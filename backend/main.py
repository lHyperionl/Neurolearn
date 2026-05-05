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
import random

try:
    from .models import Diagnosis
except ImportError:
    from models import Diagnosis

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

from sqlalchemy.orm import Session
from fastapi import File, UploadFile, Form
import struct
from pydantic import BaseModel
from typing import Optional
import shutil
import time

mimetypes.init()
mimetypes.add_type('application/gzip', '.gz')
mimetypes.add_type('application/octet-stream', '.nii')

try:
    from .database import get_db, Base, engine
    from .models import Participant, Test, Question, Answer
except ImportError:
    from database import get_db, Base, engine
    from models import Participant, Test, Question, Answer


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


# Endpoint na získanie prípadov zoskupených podľa diagnózy z DB
@app.get("/cases/grouped")
def list_cases_grouped(db: Session = Depends(get_db)):
    try:
        # Získame všetkých participantov a ich diagnózy
        participants = db.query(Participant).all()
        
        # Inicializujeme s kategóriou ALL
        grouped = {"ALL": []}
        for p in participants:
            diag = p.diagnosis_id if p.diagnosis_id else "Unknown"
            if diag not in grouped:
                grouped[diag] = []
            grouped[diag].append(p.participant_id)
            grouped["ALL"].append(p.participant_id)
        
        # Zoradíme ID v rámci kategórií
        for diag in grouped:
            grouped[diag].sort()
            
        return grouped
    except Exception as e:
        logger.error(f"Error grouping cases: {e}")
        raise HTTPException(status_code=500, detail=str(e))


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


@app.post("/cases")
def create_case(
    mri: UploadFile = File(...),
    age: int = Form(...),
    gender: str = Form(...),
    diagnosis_id: int = Form(...),
    participant_id: str | None = Form(None),
    db: Session = Depends(get_db),
):
    # Normalize gender to single-letter expected by DB
    g = gender.strip().upper()
    if g in ("FEMALE", "F"):
        g = "F"
    elif g in ("MALE", "M"):
        g = "M"
    else:
        raise HTTPException(status_code=400, detail="Gender must be 'M' or 'F'")

    # Validate diagnosis exists
    diag = db.query(Diagnosis).filter(Diagnosis.diagnosis_id == diagnosis_id).first()
    if diag is None:
        raise HTTPException(status_code=400, detail="Diagnosis not found")

    # Generate participant_id if not provided
    if not participant_id:
        participant_id = f"sub-{int(time.time() * 1000)}"

    # sanitize filename and validate type
    filename = os.path.basename(mri.filename)
    if not (filename.endswith(".nii") or filename.endswith(".nii.gz")):
        raise HTTPException(status_code=400, detail="Uploaded file must have .nii or .nii.gz extension")

    # check magic bytes: gzip header (0x1f8b) or NIfTI sizeof_hdr==348 (little-endian int32 at offset 0)
    try:
        mri.file.seek(0)
        hdr = mri.file.read(4)
        mri.file.seek(0)
        is_nifti = False
        if len(hdr) >= 2 and hdr[0:2] == b"\x1f\x8b":
            is_nifti = True
        else:
            try:
                size = struct.unpack("<i", hdr)[0]
                if size == 348:
                    is_nifti = True
            except Exception:
                is_nifti = False
        if not is_nifti:
            raise HTTPException(status_code=400, detail="Uploaded file does not appear to be a valid NIfTI (.nii or .nii.gz)")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error while validating uploaded file: {e}")
        raise HTTPException(status_code=400, detail="Failed to validate uploaded file")

    participant_dir = os.path.join(BASE_DATA_DIR, participant_id)
    if os.path.exists(participant_dir):
        raise HTTPException(status_code=400, detail="Participant directory already exists")

    try:
        os.makedirs(participant_dir, exist_ok=False)
    except Exception as e:
        logger.error(f"Failed to create participant dir: {e}")
        raise HTTPException(status_code=500, detail="Failed to create participant directory")

    # Save uploaded file
    try:
        target_path = os.path.join(participant_dir, mri.filename)
        if os.path.exists(target_path):
            raise HTTPException(status_code=400, detail="File already exists")
        with open(target_path, "wb") as buffer:
            shutil.copyfileobj(mri.file, buffer)
    except HTTPException:
        # re-raise
        raise
    except Exception as e:
        logger.error(f"Failed to save uploaded file: {e}")
        raise HTTPException(status_code=500, detail="Failed to save uploaded file")

    # Create DB participant record
    try:
        participant = Participant(participant_id=participant_id, gender=g, age=age, diagnosis_id=diagnosis_id)
        db.add(participant)
        db.commit()
    except Exception as e:
        logger.error(f"Failed to create participant in DB: {e}")
        # attempt to clean up file/dir
        try:
            if os.path.exists(target_path):
                os.remove(target_path)
            if os.path.isdir(participant_dir):
                os.rmdir(participant_dir)
        except Exception:
            pass
        raise HTTPException(status_code=500, detail="Failed to create participant in database")

    return {"participant_id": participant_id, "file": f"{participant_id}/{mri.filename}"}

    
#endpoint na pocet participantov
@app.get("/participants_count")
def get_participants_count(db: Session = Depends(get_db)):
    count = (
        db.query(Participant).count()
    )

    return count

# Endpoint pre ziskanie vsetkych participantov
@app.get("/participants/all")
def get_participants(db: Session = Depends(get_db)):
    participants = db.query(Participant.participant_id).all()
    
    participant_ids = [participant.participant_id for participant in participants]
    return participant_ids

# Endpoint pre informacie o pacientovi z db
@app.get("/participants/{participant_id}")
def get_participant(participant_id: str, db: Session = Depends(get_db)):
    participant = (
        db.query(Participant)
        .filter(Participant.participant_id == participant_id)
        .first()
    )

    diagnosis = get_diagnosis(participant.diagnosis_id,db)

    if participant is None:
        raise HTTPException(status_code=404, detail="Participant not found")

    return {
        "participant_id": participant.participant_id,
        "diagnosis": diagnosis["code"],
        "age": participant.age,
        "gender": participant.gender,
        "diagnosis_signature": diagnosis["signature"],
        "diagnosis_name": diagnosis["name"],
    }

# Endpoint pre informacie o diagnoze
@app.get("/diagnosis_info/{diagnosis_id}")
def get_diagnosis(diagnosis_id: int, db: Session = Depends(get_db)):
    diagnosis = (
        db.query(Diagnosis)
        .filter(Diagnosis.diagnosis_id == diagnosis_id)
        .first()
    )

    if diagnosis is None:
        raise HTTPException(status_code=404, detail="Diagnosis not found")

    return {
        "code": diagnosis.code,
        "name": diagnosis.name,
        "signature": diagnosis.signature
    }

@app.get("/questions/generate_pids")
def get_questions(db: Session = Depends(get_db)):
    participants_ids = get_participants(db)

    ids = set()

    while len(ids) < 10:
        ids.add(random.choice(participants_ids))

    return ids

@app.get("/questions/generate/{participant_id}")
def get_questions(participant_id: str, db: Session = Depends(get_db)):
    participant_data = get_participant(participant_id,db)

    diagnoses = list_diagnoses(db)

    answers = list(filter(lambda d: d["code"] == participant_data["diagnosis"], diagnoses))

    while len(answers) < 4:
        diagnose = random.choice(diagnoses)
        if diagnose not in answers:
            answers.append(diagnose)
    
    filename = list_case_files(participant_id)["files"][0]
    random.shuffle(answers)

    return {
        "nifti_url": f"http://127.0.0.1:8000/files/{participant_id}/{filename}",
        "participant_id": participant_id,
        "answers": answers,
        "correct": participant_data["diagnosis"],
        "signature": participant_data["diagnosis_signature"],
    }


@app.get("/participants/{participant_id}/nifti")
def participant_nifti(participant_id: str):
    try:
        filename = list_case_files(participant_id)["files"][0]
        return {"nifti_url": f"http://127.0.0.1:8000/files/{participant_id}/{filename}"}
    except IndexError:
        raise HTTPException(status_code=404, detail="No NIfTI files for participant")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"participant_nifti error: {e}")
        raise HTTPException(status_code=500, detail="Failed to get nifti url")


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

@app.get("/diagnoses")
def list_diagnoses(db: Session = Depends(get_db)):
    """Return all diagnoses from the database."""
    try:
        diagnoses = db.query(Diagnosis).all()
        return [
            {
                "diagnosis_id": d.diagnosis_id,
                "code": d.code,
                "name": d.name,
                "signature": d.signature,
            }
            for d in diagnoses
        ]
    except Exception as e:
        logger.error(f"Error listing diagnoses: {e}")
        raise HTTPException(status_code=500, detail="Could not retrieve diagnoses")


class DiagnosisCreate(BaseModel):
    code: str
    name: str
    signature: str


@app.post("/diagnoses")
def create_diagnosis(payload: DiagnosisCreate, db: Session = Depends(get_db)):
    """Create a new diagnosis record."""
    code = payload.code.strip()
    name = payload.name.strip()
    signature = payload.signature.strip()

    if not code or not name or not signature:
        raise HTTPException(status_code=400, detail="code, name and signature are required")

    exists = db.query(Diagnosis).filter(Diagnosis.code == code).first()
    if exists:
        raise HTTPException(status_code=400, detail="Diagnosis code already exists")

    try:
        diag = Diagnosis(code=code, name=name, signature=signature)
        db.add(diag)
        db.commit()
        db.refresh(diag)
        return {
            "diagnosis_id": diag.diagnosis_id,
            "code": diag.code,
            "name": diag.name,
            "signature": diag.signature,
        }
    except Exception as e:
        logger.error(f"Failed to create diagnosis: {e}")
        raise HTTPException(status_code=500, detail="Failed to create diagnosis")


class AnswerCreate(BaseModel):
    text: str
    is_correct: bool


class QuestionCreate(BaseModel):
    participant_id: str
    text: str
    answers: list[AnswerCreate]


class TestCreate(BaseModel):
    title: str
    description: Optional[str] = None
    questions: list[QuestionCreate]


@app.post("/tests")
def create_test(payload: TestCreate, db: Session = Depends(get_db)):
    if not payload.title or not payload.title.strip():
        raise HTTPException(status_code=400, detail="Test title is required")

    if not payload.questions:
        raise HTTPException(status_code=400, detail="At least one question is required")

    try:
        test = Test(title=payload.title.strip(), description=payload.description)
        db.add(test)
        db.flush()

        for qi, q in enumerate(payload.questions, start=1):
            if len(q.answers) != 4:
                raise HTTPException(status_code=400, detail=f"Question {qi}: must have exactly 4 answers")
            correct_cnt = sum(1 for a in q.answers if a.is_correct)
            if correct_cnt != 1:
                raise HTTPException(status_code=400, detail=f"Question {qi}: must have exactly one correct answer")

            # ensure participant exists
            participant = db.query(Participant).filter(Participant.participant_id == q.participant_id).first()
            if not participant:
                raise HTTPException(status_code=400, detail=f"Question {qi}: participant '{q.participant_id}' not found")

            question = Question(test_id=test.test_id, participant_id=q.participant_id, text=q.text)
            db.add(question)
            db.flush()

            for a in q.answers:
                ans = Answer(question_id=question.question_id, text=a.text, is_correct=a.is_correct)
                db.add(ans)

        db.commit()
        db.refresh(test)
        return {"test_id": test.test_id}
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to create test: {e}")
        raise HTTPException(status_code=500, detail="Failed to create test")


@app.get("/tests")
def list_tests(db: Session = Depends(get_db)):
    try:
        tests = db.query(Test).all()
        result = []
        for t in tests:
            tq = []
            for q in t.questions:
                qa = []
                for a in q.answers:
                    qa.append({"answer_id": a.answer_id, "text": a.text, "is_correct": a.is_correct})
                tq.append({
                    "question_id": q.question_id,
                    "participant_id": q.participant_id,
                    "text": q.text,
                    "answers": qa,
                })
            result.append({"test_id": t.test_id, "title": t.title, "description": t.description, "questions": tq})
        return result
    except Exception as e:
        logger.error(f"Failed to list tests: {e}")
        raise HTTPException(status_code=500, detail="Failed to list tests")


@app.get("/tests/{test_id}")
def get_test(test_id: int, db: Session = Depends(get_db)):
    try:
        t = db.query(Test).filter(Test.test_id == test_id).first()
        if not t:
            raise HTTPException(status_code=404, detail="Test not found")

        tq = []
        for q in t.questions:
            # attempt to resolve a nifti file for participant
            nifti_url = None
            try:
                files = list_case_files(q.participant_id).get("files", [])
                if files:
                    nifti_url = f"http://127.0.0.1:8000/files/{q.participant_id}/{files[0]}"
            except Exception:
                nifti_url = None

            qa = []
            for a in q.answers:
                qa.append({"answer_id": a.answer_id, "text": a.text, "is_correct": a.is_correct})

            tq.append({
                "question_id": q.question_id,
                "participant_id": q.participant_id,
                "text": q.text,
                "nifti_url": nifti_url,
                "answers": qa,
            })

        return {"test_id": t.test_id, "title": t.title, "description": t.description, "questions": tq}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get test: {e}")
        raise HTTPException(status_code=500, detail="Failed to get test")

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
