from sqlalchemy import Column, ForeignKey, Integer, String, CheckConstraint, Boolean, UniqueConstraint
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

    questions = relationship(
        "Question",
        back_populates="participant"
    )

    __table_args__ = (
        CheckConstraint("gender IN ('F', 'M')", name="check_gender_values"),
    )

class Diagnosis(Base):
    __tablename__ = "diagnoses"

    diagnosis_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    code = Column(String(10), unique=True, nullable=False)
    name = Column(String(255), nullable=False)
    signature = Column(String, nullable=False)
    grade = Column(String(50), nullable=True, default="N/A")
    tags = Column(String, nullable=True, default="[]")  # JSON array stored as string
    description = Column(String, nullable=True, default="")
    key_features = Column(String, nullable=True, default="[]")  # JSON array stored as string
    differentials = Column(String, nullable=True, default="[]")  # JSON array stored as string

    participants = relationship(
        "Participant",
        back_populates="diagnosis"
    )


class Test(Base):
    __tablename__ = "tests"

    test_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(255), nullable=False)
    description = Column(String, nullable=True)

    questions = relationship(
        "Question",
        back_populates="test",
    )


class Question(Base):
    __tablename__ = "questions"

    question_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    test_id = Column(Integer, ForeignKey("tests.test_id"), nullable=False)
    participant_id = Column(String, ForeignKey("participants.participant_id"), nullable=False)
    text = Column(String, nullable=False)

    test = relationship("Test", back_populates="questions")
    participant = relationship("Participant", back_populates="questions")
    answers = relationship(
        "Answer",
        back_populates="question",
    )


class Answer(Base):
    __tablename__ = "answers"

    answer_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    question_id = Column(Integer, ForeignKey("questions.question_id"), nullable=False)
    text = Column(String, nullable=False)
    is_correct = Column(Boolean, nullable=False, default=False)

    question = relationship("Question", back_populates="answers")