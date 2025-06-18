# models.py (Optional — if you want ORM mapping)
from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.ext.declarative import declarative_base
from database import engine

Base = declarative_base()

class Question(Base):
    __tablename__ = 'questions'
    id = Column(Integer, primary_key=True, index=True)
    Subject = Column(Text)
    Question = Column(Text)
    Option_1 = Column(Text)
    Option_2 = Column(Text)
    Option_3 = Column(Text)
    Option_4 = Column(Text)
    Toughness=Column(Text)
    Correct_option = Column(String(2))  # VARCHAR(10)


class student(Base):
    __tablename__='student'
    id=Column(Integer,primary_key=True,index=True)
    username=Column(Text)
    password=Column(Text)
    number=Column(Integer)
    duration=Column(Integer,default=2)#1 year 2 year and 3 year plan are we providing
    