"""
Database schema migration script to fix the students table.
This script will:
1. Check current schema
2. Add missing subject columns
3. Migrate existing data if needed
4. Remove old 'marks' column if it exists
"""

import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "edupulse.db")

def fix_database_schema():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    print("Checking current database schema...")
    
    # Get current columns
    cursor.execute("PRAGMA table_info(students)")
    columns = {row[1]: row for row in cursor.fetchall()}
    print(f"Current columns: {list(columns.keys())}")
    
    # Check if we need to add subject columns
    subject_columns = ['subject1_marks', 'subject2_marks', 'subject3_marks', 
                      'subject4_marks', 'subject5_marks']
    
    missing_columns = [col for col in subject_columns if col not in columns]
    
    if missing_columns:
        print(f"\nAdding missing columns: {missing_columns}")
        
        # If 'marks' column exists, we need to migrate data
        if 'marks' in columns:
            print("\nFound old 'marks' column. Migrating data...")
            
            # Add new columns
            for col in subject_columns:
                if col not in columns:
                    cursor.execute(f"ALTER TABLE students ADD COLUMN {col} REAL NOT NULL DEFAULT 0")
                    print(f"  Added column: {col}")
            
            # Migrate data: distribute the old 'marks' value to all 5 subjects
            cursor.execute("UPDATE students SET subject1_marks = marks, subject2_marks = marks, subject3_marks = marks, subject4_marks = marks, subject5_marks = marks WHERE marks IS NOT NULL")
            print(f"  Migrated {cursor.rowcount} rows")
            
            # Drop old marks column (SQLite doesn't support DROP COLUMN directly in older versions)
            # We'll need to recreate the table
            print("\nRecreating table without 'marks' column...")
            
            # Create new table with correct schema
            cursor.execute("""
                CREATE TABLE students_new (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    roll_no TEXT,
                    department TEXT,
                    attendance REAL NOT NULL,
                    subject1_marks REAL NOT NULL DEFAULT 0,
                    subject2_marks REAL NOT NULL DEFAULT 0,
                    subject3_marks REAL NOT NULL DEFAULT 0,
                    subject4_marks REAL NOT NULL DEFAULT 0,
                    subject5_marks REAL NOT NULL DEFAULT 0,
                    fees_pending REAL NOT NULL,
                    risk_level TEXT,
                    confidence REAL,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Copy data
            cursor.execute("""
                INSERT INTO students_new (id, name, roll_no, department, attendance, 
                    subject1_marks, subject2_marks, subject3_marks, subject4_marks, subject5_marks,
                    fees_pending, risk_level, confidence, created_at)
                SELECT id, name, roll_no, department, attendance,
                    subject1_marks, subject2_marks, subject3_marks, subject4_marks, subject5_marks,
                    fees_pending, risk_level, confidence, created_at
                FROM students
            """)
            
            # Drop old table and rename new one
            cursor.execute("DROP TABLE students")
            cursor.execute("ALTER TABLE students_new RENAME TO students")
            
            print("  Table recreated successfully")
        else:
            # Just add the missing columns
            for col in missing_columns:
                cursor.execute(f"ALTER TABLE students ADD COLUMN {col} REAL NOT NULL DEFAULT 0")
                print(f"  Added column: {col}")
    else:
        print("\nAll subject columns already exist. No migration needed.")
    
    conn.commit()
    
    # Verify final schema
    print("\nFinal schema:")
    cursor.execute("PRAGMA table_info(students)")
    for row in cursor.fetchall():
        print(f"  {row[1]}: {row[2]}")
    
    # Show row count
    cursor.execute("SELECT COUNT(*) FROM students")
    count = cursor.fetchone()[0]
    print(f"\nTotal students in database: {count}")
    
    conn.close()
    print("\n✅ Database schema fixed successfully!")

if __name__ == "__main__":
    fix_database_schema()
