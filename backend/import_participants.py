import csv
from pathlib import Path

from .database import SessionLocal, Base, engine
from .models import Participant

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


def import_participants(file_path: str) -> None:
    db = SessionLocal()

    try:
        with open(file_path, "r", encoding="utf-8") as file:
            reader = csv.DictReader(file, delimiter="\t")

            for row in reader:
                participant = Participant(
                    participant_id=clean_participant_id(row["participant_id"]),
                    gender=clean_gender(row["gender"]),
                    age=clean_age(row["age"]),
                    diagnosis=clean_diagnosis(row["diagnosis"]),
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