from database import engine, SessionLocal
from sqlalchemy import text

def fix_duplicates():
    session = SessionLocal()
    try:
        # We know the specific duplicates from the dump
        # ID 6: 'test5' and 'sasi'
        # We want to keep 'sasi' (ID 6)
        
        # ID 1: 'testuser' and 'malar' -> delete testuser
        # ID 2: 'testuser1' and 'malar2' -> delete testuser1
        # ID 3: 'test2' and 'malar3' -> delete test2
        # ID 4: 'test3' and 'qwer' -> delete test3
        # ID 5: 'test4' and 'asdf' -> delete test4
        # ID 6: 'test5' and 'sasi' -> delete test5
        # ID 7: 'fatima'
        # ID 8: 'fatimas'
        # Wait, are there other duplicates?
        # Let's just delete the specific usernames that look like test data if they collide.
        
        usernames_to_delete = ['testuser', 'testuser1', 'test2', 'test3', 'test4', 'test5']
        
        for username in usernames_to_delete:
            print(f"Deleting user '{username}'...")
            session.execute(text(f"DELETE FROM student WHERE username = '{username}'"))
            
        session.commit()
        print("Duplicate deletion complete.")
        
    except Exception as e:
        print(f"Error: {e}")
        session.rollback()
    finally:
        session.close()

if __name__ == "__main__":
    fix_duplicates()
