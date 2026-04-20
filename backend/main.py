from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, Response
import nibabel as nib
import os
import csv
import mimetypes
import logging
import json

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

from sqlalchemy.orm import Session

mimetypes.init()
mimetypes.add_type('application/gzip', '.gz')
mimetypes.add_type('application/octet-stream', '.nii')

try:
    from .database import get_db, Base, engine
    from .models import Participant
except ImportError:
    from database import get_db, Base, engine
    from models import Participant


app = FastAPI()

# Environment variable validation on startup
@app.on_event("startup")
async def startup_event():
    logger.info("Starting up FastAPI application...")
    
    # Check for OpenRouter API Key
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        logger.warning("❌ OPENROUTER_API_KEY is not set. AI chat features will not work.")
    elif api_key == "vlozte-svoj-openrouter-kluc-sem":
        logger.warning("❌ OPENROUTER_API_KEY is still set to placeholder 'vlozte-svoj-openrouter-kluc-sem'.")
    else:
        logger.info("✅ OPENROUTER_API_KEY is configured.")

    # Ensure DB directory exists if we're in Docker
    if os.path.exists("/app") and not os.path.exists("/app/db"):
        try:
            os.makedirs("/app/db", exist_ok=True)
            logger.info("✅ Created /app/db directory for SQLite persistence.")
        except Exception as e:
            logger.error(f"❌ Failed to create /app/db directory: {e}")

# Povolenie CORS (pre vývoj povolené všetko, v produkcii zmeniť)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)


# Nová štruktúra: každý prípad (case) má svoj podpriečinok v data/
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DATA_DIR = os.path.join(BASE_DIR, "data")
PARTICIPANTS_PATH = os.path.join(BASE_DIR, "docs", "participants.tsv")
DIAGNOSES_PATH = os.path.join(BASE_DIR, "docs", "diagnoses.json")

Base.metadata.create_all(bind=engine)


@app.get("/APIhealth")
def root():
    return {"message": "API is running"}


# Endpoint na výpis všetkých prípadov (adresárov)
@app.get("/cases")
def list_cases():
    try:
        if not os.path.exists(BASE_DATA_DIR):
            logger.warning(f"Data directory not found at {BASE_DATA_DIR}")
            return {"cases": []}
            
        cases = [
            d
            for d in os.listdir(BASE_DATA_DIR)
            if os.path.isdir(os.path.join(BASE_DATA_DIR, d)) and d.startswith("sub-")
        ]
        return {"cases": sorted(cases)}
    except Exception as e:
        logger.error(f"Error listing cases: {e}")
        return {"cases": []}


# Endpoint na výpis všetkých súborov v prípade (rekurzívne hľadanie)
@app.get("/cases/{case_id}/files")
def list_case_files(case_id: str):
    case_dir = os.path.join(BASE_DATA_DIR, case_id)
    if not os.path.isdir(case_dir):
        raise HTTPException(status_code=404, detail="Prípad nenájdený")
    try:
        supported_extensions = (".nii", ".nii.gz")
        files = []
        for root, _, filenames in os.walk(case_dir):
            for filename in filenames:
                if filename.endswith(supported_extensions):
                    # Získanie relatívnej cesty od case_dir
                    rel_path = os.path.relpath(os.path.join(root, filename), case_dir)
                    # Použitie dopredných lomítok pre konzistentné URL
                    files.append(rel_path.replace(os.sep, "/"))
        return {"files": sorted(files)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Endpoint pre metadáta konkrétneho súboru v prípade
@app.get("/metadata/{case_id}/{filename:path}")
def get_metadata(case_id: str, filename: str):
    file_path = os.path.join(BASE_DATA_DIR, case_id, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Súbor nenájdený")
    try:
        img = nib.load(file_path)
        header = img.header
        return {
            "filename": filename,
            "case_id": case_id,
            "shape": img.shape,
            "datatype": str(header.get_data_dtype()),
            "vox_offset": float(header["vox_offset"]),
            "units": header.get_xyzt_units(),
            "affine": img.affine.tolist(),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Endpoint pre informacie o pacientovi z db
@app.get("/participants/{participant_id}")
def get_participant(participant_id: str, db: Session = Depends(get_db)):
    participant = (
        db.query(Participant)
        .filter(Participant.participant_id == participant_id)
        .first()
    )

    if participant is None:
        raise HTTPException(status_code=404, detail="Participant not found")

    return {
        "participant_id": participant.participant_id,
        "diagnosis": participant.diagnosis,
        "age": participant.age,
        "gender": participant.gender,
    }


def load_diagnoses() -> dict:
    if not os.path.exists(DIAGNOSES_PATH):
        return {}
    try:
        with open(DIAGNOSES_PATH, "r", encoding="utf-8") as file:
            data = json.load(file)
            if isinstance(data, dict):
                return data
            return {}
    except json.JSONDecodeError as exc:
        raise HTTPException(status_code=500, detail=f"Invalid diagnoses.json: {exc}")


@app.get("/diagnoses/{diagnosis_key}")
def get_diagnosis_info(diagnosis_key: str):
    diagnoses = load_diagnoses()
    key = diagnosis_key.strip()
    if key in diagnoses:
        return diagnoses[key]
    key_upper = key.upper()
    if key_upper in diagnoses:
        return diagnoses[key_upper]
    raise HTTPException(status_code=404, detail="Diagnosis not found")

# Statické súbory pre všetky prípady
@app.get("/files/{case_id}/{filename:path}")
async def get_case_file(case_id: str, filename: str):
    file_path = os.path.join(BASE_DATA_DIR, case_id, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    
    media_type = "application/x-gzip" if file_path.endswith(".gz") else "application/octet-stream"
    
    response = FileResponse(file_path, media_type=media_type)
    response.headers["Access-Control-Allow-Origin"] = "*"
    return response


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
