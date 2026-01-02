from database import engine, SessionLocal
from sqlalchemy import text
from models import Base

def update_schema():
    with engine.connect() as conn:
        conn = conn.execution_options(isolation_level="AUTOCOMMIT")
        
        # Add missing columns to 'student' table
        columns_to_add = [
            ("experience_points", "INTEGER DEFAULT 0"),
            ("next_level_points", "INTEGER DEFAULT 1000"),
            ("easy_solved", "INTEGER DEFAULT 0"),
            ("medium_solved", "INTEGER DEFAULT 0"),
            ("hard_solved", "INTEGER DEFAULT 0"),
            # Note: 'rank' and 'streak' existed but we changed types/defaults. 
            # Altering types in Postgres can be tricky if data exists.
            # For now, let's assume they exist and just add the NEW ones.
            # If we need to fix types, we might need explicit ALTER COLUMN.
        ]
        
        for col_name, col_type in columns_to_add:
            try:
                print(f"Adding column {col_name}...")
                conn.execute(text(f"ALTER TABLE student ADD COLUMN IF NOT EXISTS {col_name} {col_type};"))
                print(f"Added {col_name}")
            except Exception as e:
                print(f"Error adding {col_name}: {e}")

        # Create new tables (ReportedError)
        print("Creating new tables if they don't exist...")
        Base.metadata.create_all(bind=engine)
        
    print("Schema update completed.")

if __name__ == "__main__":
    update_schema()
