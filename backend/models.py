from sqlalchemy import Column, Integer, String, CheckConstraint
from .database import Base

class Participant(Base):
    __tablename__ = "participants"

    participant_id = Column(String, primary_key=True)
    gender = Column(String(1), nullable=False)
    age = Column(Integer, nullable=False)
    diagnosis = Column(String, nullable=False)

    __table_args__ = (
        CheckConstraint("gender IN ('F', 'M')", name="check_gender_values"),
    )