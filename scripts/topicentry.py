# test_query.py (Terminal DB Testing Only)
from database import Session,engine
from sqlalchemy import MetaData,insert,update
from models import Base
Base.metadata.create_all(bind=engine)
session = Session()
metadata = MetaData()
metadata.reflect(bind=session.bind)


high_importance_physics_topics = [
    "Laws of Motion",
    "Work, Energy and Power",
    "System of Particles and Rotational Motion",
    "Thermodynamics",
    "Oscillations",
    "Current Electricity",
    "Moving Charges and Magnetism",
    "Alternating Current",
    "Ray Optics and Optical Instruments",
    "Dual Nature of Radiation and Matter",
    "Semiconductor Electronics: Materials, Devices and Simple Circuits"
]



table= metadata.tables["topics"]


result=session.query(table).all()
for line in result:
    print(line)
# try:
#     updated_count = 0
#     for topic_name in high_importance_physics_topics:
#         stmt = (
#             update(table)
#             .where(table.c.subject == "Physics", table.c.topic == topic_name)
#             .values(importance=5)
#         )
#         result = session.execute(stmt)
#         updated_count += result.rowcount
    
#     print(f"Prepared to update {updated_count} topic(s) to importance=5.")

#     key = input("Enter 1 to commit or 0 to rollback: ")
#     if key == '1':
#         session.commit()
#         print("Update committed.")
#     else:
#         session.rollback()
#         print("Update rolled back.")
# except Exception as e:
#     print(f"An error occurred: {e}")
# finally:
#     session.close()
