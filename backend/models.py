from sqlalchemy import Column, ForeignKey, Integer, String, CheckConstraint
from sqlalchemy.orm import relationship

try:
    from .database import Base
except ImportError:
    from database import Base

class Participant(Base):
    __tablename__ = "participants"

    participant_id = Column(String, primary_key=True)
    gender = Column(String(1), nullable=False)
    age = Column(Integer, nullable=False)
    diagnosis_id = Column(
        Integer,
        ForeignKey("diagnoses.diagnosis_id"),
        nullable=False
    )

    diagnosis = relationship(
        "Diagnosis",
        back_populates="participants"
    )

    __table_args__ = (
        CheckConstraint("gender IN ('F', 'M')", name="check_gender_values"),
    )

class Diagnosis(Base):
    __tablename__ = "diagnoses"

    diagnosis_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    code = Column(String(10), unique=True, nullable=False)
    name = Column(String(255), nullable=False)
    signature = Column(String)

    participants = relationship(
        "Participant",
        back_populates="diagnosis"
    )