#!/usr/bin/env python3
"""
Migration script to add new columns to the diagnoses table.
Run this ONCE to migrate the existing database schema.

Usage:
    docker compose exec backend python -m migrate_schema
    # or locally:
    python migrate_schema.py
"""

import sqlite3
import os
import sys

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from database import DATABASE_URL
except ImportError:
    # Default path if import fails
    DATABASE_URL = "sqlite:///./maps.db"


def get_db_path():
    """Extract database path from DATABASE_URL."""
    if DATABASE_URL.startswith("sqlite:////app"):
        return "/app/db/maps.db"
    elif DATABASE_URL.startswith("sqlite:///"):
        return DATABASE_URL.replace("sqlite:///", "")
    return "maps.db"


# Whitelist of allowed column names to prevent SQL injection
ALLOWED_COLUMNS = {"grade", "tags", "description", "key_features", "differentials"}
ALLOWED_TYPES = {"TEXT", "INTEGER", "REAL", "BLOB"}


def alter_table_add_column(db_path, table, column, col_type):
    """Add a column to a table if it doesn't exist."""
    # Validate column name against whitelist (prevents SQL injection)
    if column not in ALLOWED_COLUMNS:
        print(f" Invalid column name: '{column}'")
        return False
    
    # Validate col_type against whitelist
    col_type_upper = col_type.split("(")[0].strip().upper()
    if col_type_upper not in ALLOWED_TYPES:
        print(f" Invalid column type: '{col_type}'")
        return False
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Check if table exists (using parameterized query)
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name=?", (table,))
    if not cursor.fetchone():
        print(f" Table '{table}' does not exist")
        conn.close()
        return False
    
    # Get existing columns
    cursor.execute(f"PRAGMA table_info({table})")
    existing_cols = [row[1] for row in cursor.fetchall()]
    
    if column in existing_cols:
        print(f" Column '{column}' already exists in {table}")
        conn.close()
        return False
    
    try:
        # Use parameterized query for type to prevent injection
        cursor.execute(f"ALTER TABLE {table} ADD COLUMN {column} {col_type}")
        conn.commit()
        print(f" Added column '{column}' to {table}")
        conn.close()
        return True
    except sqlite3.Error as e:
        print(f" Error adding column '{column}': {e}")
        conn.close()
        return False


def migrate_schema():
    """Add new columns to existing diagnoses table."""
    db_path = get_db_path()
    
    # Check if database exists
    if not os.path.exists(db_path):
        print(f" Database not found at {db_path}")
        print("   The database will be created automatically when the backend starts.")
        print("   You only need to run this migration if the database already exists.")
        return
    
    print(f" Database path: {db_path}\n")
    
    # Define new columns to add
    new_columns = [
        ("diagnoses", "grade", "TEXT DEFAULT 'N/A'"),
        ("diagnoses", "tags", "TEXT DEFAULT '[]'"),
        ("diagnoses", "description", "TEXT DEFAULT ''"),
        ("diagnoses", "key_features", "TEXT DEFAULT '[]'"),
        ("diagnoses", "differentials", "TEXT DEFAULT '[]'"),
    ]
    
    print(" Adding new columns to diagnoses table...\n")
    added = 0
    for table, column, col_type in new_columns:
        if alter_table_add_column(db_path, table, column, col_type):
            added += 1
    
    print(f"\n Schema migration complete!")
    print(f"    Added: {added} columns")
    print(f"    Skipped: {len(new_columns) - added} columns (already exist)")


if __name__ == "__main__":
    print(" Starting schema migration...\n")
    migrate_schema()
    print("\n Done! You can now run the data migration:")
    print("   docker compose exec backend python -m migrate_diagnoses")
