#!/usr/bin/env python3
"""
Migration script to transfer diagnoses from diagnoses.json to the database.
Run this script AFTER the database tables have been created with the new schema.

Usage:
    docker compose exec backend python -m migrate_diagnoses
    # or locally:
    python migrate_diagnoses.py
    (docker compose restart backend - after running this)
"""

import json
import os
import sys

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from database import SessionLocal, engine, Base
    from models import Diagnosis
except ImportError:
    from database import SessionLocal, engine, Base
    from models import Diagnosis


def load_json_diagnoses():
    """Load diagnoses from the JSON file."""
    base_dir = os.path.dirname(os.path.abspath(__file__))
    diagnoses_path = os.path.join(base_dir, "docs", "diagnoses.json")
    
    if not os.path.exists(diagnoses_path):
        print(f"❌ diagnoses.json not found at {diagnoses_path}")
        return {}
    
    with open(diagnoses_path, "r", encoding="utf-8") as f:
        return json.load(f)


def migrate_diagnoses():
    """Migrate diagnoses from JSON to database."""
    diagnoses = load_json_diagnoses()
    
    if not diagnoses:
        print(" No diagnoses found in JSON file")
        return 0
    
    # Ensure tables exist (Base.metadata.create_all)
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    migrated_count = 0
    skipped_count = 0
    
    try:
        for code, data in diagnoses.items():
            # Check if diagnosis already exists
            existing = db.query(Diagnosis).filter(Diagnosis.code == code).first()
            if existing:
                # Update existing record with new fields (if they're NULL or empty)
                updated = False
                grade_val = data.get("grade")
                if existing.grade is None or existing.grade == "N/A":
                    existing.grade = grade_val if grade_val is not None else "N/A"
                    updated = True
                
                tags_val = data.get("tags")
                if existing.tags is None or existing.tags == "[]":
                    existing.tags = json.dumps(tags_val) if tags_val is not None else "[]"
                    updated = True
                
                desc_val = data.get("description")
                if not existing.description and desc_val is not None:
                    existing.description = desc_val
                    updated = True
                
                kf_val = data.get("keyFeatures")
                if existing.key_features is None or existing.key_features == "[]":
                    existing.key_features = json.dumps(kf_val) if kf_val is not None else "[]"
                    updated = True
                
                diff_val = data.get("differentials")
                if existing.differentials is None or existing.differentials == "[]":
                    existing.differentials = json.dumps(diff_val) if diff_val is not None else "[]"
                    updated = True
                
                if updated:
                    print(f" Updated diagnosis: {code} - {data.get('name', '')}")
                    migrated_count += 1
                else:
                    print(f" Skipping '{code}' - already has all data")
                    skipped_count += 1
                continue
            
            # Create new diagnosis record
            # Safely extract values, handling potential None/null from JSON
            name_val = data.get("name", "") or ""
            signature_val = data.get("signature") or name_val
            grade_val = data.get("grade")
            tags_val = data.get("tags")
            desc_val = data.get("description", "")
            kf_val = data.get("keyFeatures")
            diff_val = data.get("differentials")
            
            diagnosis = Diagnosis(
                code=code,
                name=name_val,
                signature=signature_val,
                grade=grade_val if grade_val is not None else "N/A",
                tags=json.dumps(tags_val) if tags_val is not None else "[]",
                description=desc_val if desc_val is not None else "",
                key_features=json.dumps(kf_val) if kf_val is not None else "[]",
                differentials=json.dumps(diff_val) if diff_val is not None else "[]",
            )
            
            db.add(diagnosis)
            print(f" Added diagnosis: {code} - {data.get('name', '')}")
            migrated_count += 1
        
        db.commit()
        print(f"\n Migration complete!")
        print(f"    Migrated: {migrated_count}")
        print(f"     Skipped: {skipped_count}")
        print(f"    Total in JSON: {len(diagnoses)}")
        
    except Exception as e:
        db.rollback()
        print(f" Migration failed: {e}")
        raise
    finally:
        db.close()
    
    return migrated_count


def verify_migration():
    """Verify the migrated data."""
    db = SessionLocal()
    try:
        diagnoses = db.query(Diagnosis).all()
        print(f"\n🔍 Verification - Found {len(diagnoses)} diagnoses in database:")
        for d in diagnoses:
            tags = json.loads(d.tags) if d.tags else []
            key_features = json.loads(d.key_features) if d.key_features else []
            print(f"   • {d.code}: {d.name} (Grade: {d.grade})")
            print(f"     Tags: {', '.join(tags) if tags else 'none'}")
            print(f"     Key Features: {len(key_features)} items")
    finally:
        db.close()


if __name__ == "__main__":
    print("🚀 Starting diagnosis migration from JSON to database...\n")
    migrated = migrate_diagnoses()
    
    if migrated > 0:
        verify_migration()
    
    print("\n✨ Done!")
