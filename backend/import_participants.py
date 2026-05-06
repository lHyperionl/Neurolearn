import csv
from pathlib import Path

try:
    from .database import SessionLocal, Base, engine
    from .models import Participant, Diagnosis
except ImportError:
    from database import SessionLocal, Base, engine
    from models import Participant, Diagnosis

Base.metadata.create_all(bind=engine)

def clean_participant_id(value: str) -> str:
    value = value.strip()
    if not value:
        raise ValueError("participant_id cannot be empty")
    return value


def clean_gender(value: str) -> str:
    value = value.strip().upper()
    if value not in {"F", "M"}:
        raise ValueError(f"Invalid gender value: {value}")
    return value


def clean_age(value: str) -> int:
    value = value.strip()
    if not value:
        raise ValueError("age cannot be empty")
    return int(value)


def clean_diagnosis(value: str) -> str:
    value = value.strip()
    if not value:
        raise ValueError("diagnosis cannot be empty")
    return value

def ensure_diagnoses(db):
    predefined = [
        ("CONTROL", "Healthy", "No significant structural abnormalities; normal symmetry and brain volume."),
        ("SCHZ", "Schizophrenia", "Enlarged ventricles and reduced gray matter, especially in frontal and temporal lobes."),
        ("BIPOLAR", "Bipolar Disorder", "Alterations in the limbic system (e.g., amygdala, hippocampus) and prefrontal regions linked to emotion regulation."),
        ("ADHD", "ADHD", "Reduced volume in the prefrontal cortex and basal ganglia, sometimes with delayed cortical development."),
        ("LGG", "Low-Grade Glioma", "Uniform, solid mass with relatively well-defined edges, typically little to no swelling (edema) in the surrounding brain tissue."),
        ("HGG", "High-Grade Glioma", "Hallmark is a brightly glowing ring that appears after contrast is administered, this ring surrounds a dark center, which consists of dead tissue (necrosis) that the tumor outgrew.")
    ]

    for code, name, signature in predefined:
        exists = db.query(Diagnosis).filter(Diagnosis.code == code).first()
        if not exists:
            db.add(Diagnosis(code=code, name=name, signature=signature))

    db.commit()


def import_participants(file_path: str) -> None:
    db = SessionLocal()

    try:
        ensure_diagnoses(db) 

        diagnosis_map = {}
        for d in db.query(Diagnosis).all():
            diagnosis_map[d.code] = d.diagnosis_id

        with open(file_path, "r", encoding="utf-8") as file:
            reader = csv.DictReader(file, delimiter="\t")

            for row in reader:
                code=clean_diagnosis(row["diagnosis"])

                participant = Participant(
                    participant_id=clean_participant_id(row["participant_id"]),
                    gender=clean_gender(row["gender"]),
                    age=clean_age(row["age"]),
                    diagnosis_id=diagnosis_map[code]
                )

                db.merge(participant)

            db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    base_dir = Path(__file__).resolve().parent
    tsv_path = base_dir / "docs" / "participants.tsv"

    import_participants(str(tsv_path))
    print("Participants imported successfully.")