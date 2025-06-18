# test_query.py (Terminal DB Testing Only)
from database import SessionLocal
from sqlalchemy import MetaData

session = SessionLocal()
metadata = MetaData()
metadata.reflect(bind=session.bind)

questions_table = metadata.tables['questions']
result = session.execute(questions_table.select()).fetchone()

print(result)

session.close()
