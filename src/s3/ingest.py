import json
import logging
from pathlib import Path
from typing import List, Dict, Any

from s3 import chunker, tagger, loader

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

DATA_DIR = Path("data")
OUTPUT_FILE = Path("web/src/data/courses.json")

def parse_descr_export(path: Path) -> List[Dict[str, Any]]:
    """Parse the specific tab-separated description export file."""
    courses = []
    try:
        content = path.read_text(encoding="utf-8", errors="ignore")
        for line in content.splitlines():
            parts = line.split("\t")
            if len(parts) >= 8:
                # Assuming the last column is the description/title
                # and the 3rd column is an ID
                course_id = parts[2].strip()
                description = parts[-1].strip()
                
                if description and course_id:
                    courses.append({
                        "id": course_id,
                        "title": description,
                        "source": path.name
                    })
    except Exception as e:
        logger.error(f"Failed to parse {path}: {e}")
    return courses

def main():
    logger.info("Starting ingestion...")
    
    all_chunks = []
    
    # 1. Parse specific export files for COURSES
    for path in DATA_DIR.glob("*_DESCR_EXPORT_EN.txt"):
        logger.info(f"Processing {path}...")
        courses = parse_descr_export(path)
        
        for course in courses:
            # Chunk the description/title
            chunks = chunker.split_into_chunks(course["title"])
            
            for i, chunk_text in enumerate(chunks):
                tags = tagger.tag_text(chunk_text)
                
                # Only keep chunks that have some relevance (heuristic)
                if tags.get("skill") != "general_productivity" or float(tags.get("confidence", 0)) > 0.5:
                    all_chunks.append({
                        "id": f"{course['id']}_{i}",
                        "course_id": course["id"],
                        "title": course["title"],
                        "text": chunk_text,
                        "tags": tags,
                        "source": course["source"]
                    })

    logger.info(f"Generated {len(all_chunks)} chunks.")
    
    # 2. Write COURSES to JSON
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(all_chunks, f, indent=2)
    
    logger.info(f"Saved to {OUTPUT_FILE}")

    # 3. Process USERS from ZHRPD_VZD_STA_007.xlsx
    logger.info("Processing Users...")
    users = {}
    try:
        import pandas as pd
        df = pd.read_excel(DATA_DIR / "ZHRPD_VZD_STA_007.xlsx")
        
        # Group by User ID
        for user_id, group in df.groupby("ID účastníka"):
            user_id_str = str(user_id)
            completed = group["Označení typu akce"].unique().tolist()
            
            # Infer skills from completed courses
            skills = {}
            for course in completed:
                course_lower = str(course).lower()
                if "excel" in course_lower:
                    skills["excel"] = "advanced"
                elif "powerpoint" in course_lower:
                    skills["powerpoint"] = "intermediate"
                elif "word" in course_lower:
                    skills["word"] = "intermediate"
                elif "python" in course_lower:
                    skills["python"] = "beginner"
            
            # Realistic Mock Names
            first_names = ["James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda", "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah", "Charles", "Karen", "Christopher", "Nancy", "Daniel", "Lisa", "Matthew", "Betty", "Anthony", "Margaret", "Mark", "Sandra"]
            last_names = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin"]
            
            import random
            # Seed with user_id to ensure consistent names across runs
            random.seed(int(user_id_str)) 
            mock_name = f"{random.choice(first_names)} {random.choice(last_names)}"
            
            users[user_id_str] = {
                "id": user_id_str,
                "name": mock_name, 
                "department": "Operations", # Mock department
                "role": "Specialist",
                "completed_courses": completed,
                "skills": skills
            }
            
        # Save Users
        USERS_FILE = Path("web/src/data/users.json")
        with open(USERS_FILE, "w", encoding="utf-8") as f:
            json.dump(list(users.values()), f, indent=2)
        logger.info(f"Saved {len(users)} users to {USERS_FILE}")
            
    except Exception as e:
        logger.error(f"Failed to process users: {e}")

if __name__ == "__main__":
    main()
