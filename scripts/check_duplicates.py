from database import engine, SessionLocal
from sqlalchemy import text
from models import Student

def check_duplicates():
    session = SessionLocal()
    try:
        # Check for duplicate usernames
        result = session.execute(text("SELECT username, COUNT(*) FROM student GROUP BY username HAVING COUNT(*) > 1"))
        duplicates = result.fetchall()
        
        if duplicates:
            print(f"Found {len(duplicates)} duplicate usernames:")
            for username, count in duplicates:
                print(f"  - {username}: {count} records")
                
                # Fetch detailed rows
                rows = session.execute(text(f"SELECT id, username, email FROM student WHERE username = '{username}'")).fetchall()
                for row in rows:
                    print(f"    ID: {row.id}, Email: {row.email}")
        else:
            print("No duplicate usernames found.")
            
    except Exception as e:
        print(f"Error checking duplicates: {e}")
    finally:
        session.close()

if __name__ == "__main__":
    check_duplicates()
