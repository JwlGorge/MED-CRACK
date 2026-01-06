from sqlalchemy import Column, Integer, BigInteger, Text, Float, Boolean, DateTime
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


class BiologyQuestion(Base):
    __tablename__ = 'biologyquestion'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    Subject = Column(Text)
    Question = Column(Text)
    Option_1 = Column(Text)
    Option_2 = Column(Text)
    Option_3 = Column(Text)
    Option_4 = Column(Text)
    Toughness = Column(Text)
    Correct_option = Column(Integer) 
    topic = Column(Text)

    
class PhysicsQuestion(Base):
    __tablename__ = 'physicsquestion'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    Subject = Column(Text)
    Question = Column(Text)
    Option_1 = Column(Text)
    Option_2 = Column(Text)
    Option_3 = Column(Text)
    Option_4 = Column(Text)
    Toughness = Column(Text)
    Correct_option = Column(Integer) 
    topic = Column(Text)


class ChemistryQuestion(Base):
    __tablename__ = 'chemistryquestion'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    Subject = Column(Text)
    Question = Column(Text)
    Option_1 = Column(Text)
    Option_2 = Column(Text)
    Option_3 = Column(Text)
    Option_4 = Column(Text)
    Toughness = Column(Text)
    Correct_option = Column(Integer) 
    topic = Column(Text)



class Student(Base):
    __tablename__ = 'student'

    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(Text, unique=True, nullable=False)
    password = Column(Text, nullable=False)
    email = Column(Text, nullable=True)
    
    # Stats
    rank = Column(Integer, default=0)
    streak = Column(Integer, default=0)
    experience_points = Column(Integer, default=0)
    next_level_points = Column(Integer, default=1000)
    badge = Column(Text, default="Rookie")
    
    # Problem Counts
    noofquestioncompleted = Column(Integer, default=0)
    easy_solved = Column(Integer, default=0)
    medium_solved = Column(Integer, default=0)
    hard_solved = Column(Integer, default=0)
    
    # We can calculate 'total' available questions dynamically or store them if fixed
    # For now, let's keep it simple and just track solved counts.
    
    duration = Column(BigInteger, default=0) # Total time spent in seconds

class Topics(Base):
    __tablename__="topics"
    id=Column(Integer,primary_key=True,autoincrement=True)
    subject=Column(Text)
    year=Column(Integer)
    topic=Column(Text)
    description=Column(Text,nullable=True)
    importance=Column(Integer,nullable=True)

class ReportedError(Base):
    __tablename__ = "reported_errors"
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer) # ID of the student reporting
    question_id = Column(Text) # ID of the question (e.g. "1", "2") or DB ID
    subject = Column(Text) # Subject/Topic context
    quiz_id = Column(Text) # Optional: which quiz they were taking
    timestamp = Column(BigInteger) # when it happened

class Attempt(Base):
    __tablename__ = "attempts"
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer)
    quiz_id = Column(Text) # Keep for session tracking if needed
    question_id = Column(Integer)
    subject = Column(Text)
    is_correct = Column(Boolean, default=False)
    submitted_at = Column(DateTime) # timestamp
    # columns to eventually remove/ignore: time_taken, accuracy, submitted, details


class Weakarea(Base):
    __tablename__="weakarea"
    id=Column(Integer,primary_key=True,autoincrement=True)
    user_id=Column(Integer)
    subject=Column(Text)
    question_id=Column(Integer) #multiple questionsids after each quiz in one column
    