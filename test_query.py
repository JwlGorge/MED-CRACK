# test_query.py (Terminal DB Testing Only)
from database import SessionLocal,engine
from sqlalchemy import MetaData
from models import Base
Base.metadata.create_all(bind=engine)
session = SessionLocal()
metadata = MetaData()
metadata.reflect(bind=session.bind)

questions_table = metadata.tables['questions']
q1 = session.execute(questions_table.select()).fetchone()
user=metadata.tables['student']
u1= session.execute(user.select()).fetchone()
print(q1)
print(u1)

session.close()
