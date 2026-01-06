from database import engine
from sqlalchemy import text

def upgrade_attempts_table():
    with engine.connect() as conn:
        conn = conn.execution_options(isolation_level="AUTOCOMMIT")
        
        # Add 'subject' column
        try:
            print("Adding 'subject' column to attempts...")
            conn.execute(text("ALTER TABLE attempts ADD COLUMN IF NOT EXISTS subject TEXT;"))
            print("Added 'subject'.")
        except Exception as e:
            print(f"Error adding subject: {e}")

        # Add 'is_correct' column
        try:
            print("Adding 'is_correct' column to attempts...")
            conn.execute(text("ALTER TABLE attempts ADD COLUMN IF NOT EXISTS is_correct BOOLEAN DEFAULT FALSE;"))
            print("Added 'is_correct'.")
        except Exception as e:
            print(f"Error adding is_correct: {e}")
            
    print("Attempts table upgrade completed.")

if __name__ == "__main__":
    upgrade_attempts_table()
