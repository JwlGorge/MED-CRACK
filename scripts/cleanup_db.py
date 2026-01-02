from database import engine
from sqlalchemy import text

def cleanup_schema():
    with engine.connect() as conn:
        conn = conn.execution_options(isolation_level="AUTOCOMMIT")
        
        # Helper to drop column safely
        def drop_column(table, col):
            try:
                print(f"Dropping column {col} from {table}...")
                conn.execute(text(f"ALTER TABLE {table} DROP COLUMN IF EXISTS {col};"))
                print(f"Dropped {col}.")
            except Exception as e:
                print(f"Error dropping {col}: {e}")

        # Remove requested columns from attempts
        drop_column("attempts", "details")
        drop_column("attempts", "submitted")
        drop_column("attempts", "accuracy") # Replaced by is_correct

        # Drop QuizAttempt table if exists
        try:
            print("Dropping quiz_attempts table...")
            conn.execute(text("DROP TABLE IF EXISTS quiz_attempts;"))
            print("Dropped quiz_attempts.")
        except Exception as e:
            print(f"Error dropping table: {e}")
            
    print("Cleanup detailed.")

if __name__ == "__main__":
    cleanup_schema()
