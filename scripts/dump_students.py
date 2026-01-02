from database import engine, SessionLocal
from sqlalchemy import text

def dump_students():
    session = SessionLocal()
    try:
        rows = session.execute(text("SELECT id, username, email FROM student")).fetchall()
        print(f"Total students: {len(rows)}")
        for row in rows:
            print(f"ID: {row.id}, Username: '{row.username}', Email: {row.email}")
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        session.close()

if __name__ == "__main__":
    dump_students()
