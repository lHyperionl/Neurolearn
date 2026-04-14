from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import nibabel as nib
import os
import csv

from sqlalchemy.orm import Session
from .database import get_db, Base, engine
from .models import Participant


app = FastAPI()

# Povolenie CORS (pre vývoj povolené všetko, v produkcii zmeniť)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# Nová štruktúra: každý prípad (case) má svoj podpriečinok v data/
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DATA_DIR = os.path.join(BASE_DIR, "data")
PARTICIPANTS_PATH = os.path.join(BASE_DIR, "docs", "participants.tsv")

Base.metadata.create_all(bind=engine)

@app.get("/APIhealth")
def root():
    return {"message": "API is running"}

# Endpoint na výpis všetkých prípadov (adresárov)
@app.get("/cases")
def list_cases():
    try:
        cases = [d for d in os.listdir(BASE_DATA_DIR) if os.path.isdir(os.path.join(BASE_DATA_DIR, d))]
        return {"cases": cases}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Endpoint na výpis všetkých súborov v prípade
@app.get("/cases/{case_id}/files")
def list_case_files(case_id: str):
    case_dir = os.path.join(BASE_DATA_DIR, case_id)
    if not os.path.isdir(case_dir):
        raise HTTPException(status_code=404, detail="Prípad nenájdený")
    try:
        files = [f for f in os.listdir(case_dir) if os.path.isfile(os.path.join(case_dir, f))]
        return {"files": files}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Endpoint pre metadáta konkrétneho súboru v prípade
@app.get("/metadata/{case_id}/{filename}")
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
            "affine": img.affine.tolist()
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

# Statické súbory pre všetky prípady
class MultiCaseStaticFiles(StaticFiles):
    def __init__(self, base_directory: str):
        super().__init__(directory=base_directory)
        self.base_directory = base_directory

    async def get_response(self, path: str, scope):
        # path: "{case_id}/{filename}"
        return await super().get_response(path, scope)

# Mount statických súborov na /files/{case_id}/{filename}
app.mount("/files", MultiCaseStaticFiles(BASE_DATA_DIR), name="files")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
