"""Utility script to turn raw Škoda hackathon exports into UI-friendly JSON."""

from __future__ import annotations

import json
import logging
import random
from collections import Counter, defaultdict
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, Iterable, List

import pandas as pd

try:
    from transformers import MarianMTModel, MarianTokenizer
except ImportError:  # pragma: no cover
    MarianMTModel = None
    MarianTokenizer = None
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

BATCH_MODEL_NAME = "Helsinki-NLP/opus-mt-cs-en"

DATA_DIR = Path("data")
OUTPUT_USERS = Path("web/src/data/users.json")
OUTPUT_COURSES = Path("web/src/data/courses.json")
TRANSLATION_CACHE_PATH = Path("artifacts/translation_cache.json")
TODAY = datetime(2025, 8, 28)

translator_tokenizer = None
translator_model = None
if MarianMTModel and MarianTokenizer:
    try:  # pragma: no cover - heavy init
        translator_tokenizer = MarianTokenizer.from_pretrained(BATCH_MODEL_NAME)
        translator_model = MarianMTModel.from_pretrained(BATCH_MODEL_NAME)
    except Exception as exc:
        logger.warning("Failed loading translation model: %s", exc)
        translator_tokenizer = None
        translator_model = None

translation_cache: Dict[str, str] = {}
if TRANSLATION_CACHE_PATH.exists():
    try:
        translation_cache = json.loads(TRANSLATION_CACHE_PATH.read_text(encoding="utf-8"))
        logger.info("Loaded %d cached translations", len(translation_cache))
    except Exception:  # pragma: no cover - corrupted cache
        translation_cache = {}

# Batch translation queue
_translation_queue: List[str] = []

FIRST_NAMES = [
    "Anna",
    "Elena",
    "Nina",
    "Sofia",
    "Tereza",
    "Marek",
    "Jakub",
    "Petr",
    "Filip",
    "Lucie",
    "Gabriela",
    "Matej",
    "Adela",
    "Klara",
    "Barbora",
    "Daniel",
    "Ondrej",
    "Michal",
    "Ivana",
    "Simona",
]

LAST_NAMES = [
    "Novak",
    "Svoboda",
    "Vesely",
    "Prochazka",
    "Kucera",
    "Horak",
    "Nemec",
    "Pospisil",
    "Hajek",
    "Král",
    "Dvorak",
    "Fiala",
    "Benes",
    "Sedlacek",
    "Stepanek",
    "Ruzicka",
    "Urban",
    "Mach",
    "Blazek",
    "Holub",
]

CATEGORY_KEYWORDS = {
    "Leadership & Management": ["leadership", "management", "strategy", "board", "project"],
    "Compliance & Ethics": ["compliance", "etický", "ethics", "law", "legal", "safety", "protect", "kodex"],
    "Production & Quality": ["production", "quality", "manufacturing", "audits", "qms", "process"],
    "Digital & Data": ["sap", "python", "digital", "analytics", "data", "it", "cyber"],
    "Customer & Retail": ["sales", "retail", "marketing", "dealer", "b2b"],
    "HR & People": ["hr", "people", "talent", "recruitment", "education", "academy"],
    "Health & Safety": ["safety", "požární", "bozp", "first aid", "security"],
    "Languages & Communication": ["english", "german", "language", "communication"],
}

SKILL_KEYWORDS = {
    "excel": ("Excel Automation", "advanced"),
    "powerpoint": ("Storytelling with Slides", "intermediate"),
    "word": ("Word Templates", "intermediate"),
    "project": ("Project Delivery", "intermediate"),
    "compliance": ("Compliance Mindset", "advanced"),
    "quality": ("Quality Systems", "advanced"),
    "python": ("Python Foundations", "beginner"),
    "sap": ("SAP Operations", "intermediate"),
    "safety": ("Workplace Safety", "advanced"),
    "hr": ("People Operations", "advanced"),
}


def safe_text(value: Any, default: str = "") -> str:
    if isinstance(value, str):
        text = value.strip()
        return text or default
    if value is None:
        return default
    if isinstance(value, (float, int)) and pd.isna(value):
        return default
    text = str(value).strip()
    return text or default


# Common Czech-to-English translations (fast lookup)
COMMON_TRANSLATIONS = {
    "vysokoškolské bakalářské vzdělání": "Higher Bachelor's Education",
    "vysokoškolské vzdělání": "Higher Education",
    "specializace v pedagogice": "Specialization in Education",
    "učitel": "Teacher",
    "pracovník": "Worker/Employee",
    "vzdělání": "Education",
    "specializace": "Specialization",
    "pedagogika": "Education/Pedagogy",
    "učitelství": "Teaching",
    "praktického vyučování": "Practical Teaching",
    "odborného výcviku": "Vocational Training",
}

def looks_like_czech(text: str) -> bool:
    """Simple heuristic to check if text is likely Czech."""
    if not text:
        return False
    # Check for Czech-specific chars
    czech_chars = set("áčďéěíňóřšťúůýžÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ")
    return any(c in czech_chars for c in text)


def generate_mock_name(user_id: str) -> str:
    """Generate a consistent mock name based on user ID."""
    # Seed random with user_id so the name is always the same for the same ID
    # We use a simple hash of the ID to seed
    seed_val = int(user_id) if user_id.isdigit() else hash(user_id)
    rng = random.Random(seed_val)
    first = rng.choice(FIRST_NAMES)
    last = rng.choice(LAST_NAMES)
    return f"{first} {last}"


def translate_batch(texts: List[str]) -> List[str]:
    """Translate a batch of texts at once for efficiency."""
    if not texts or translator_model is None or translator_tokenizer is None:
        return texts
    try:
        inputs = translator_tokenizer(texts, return_tensors="pt", padding=True, truncation=True, max_length=256)
        outputs = translator_model.generate(**inputs, max_length=256)
        translated = translator_tokenizer.batch_decode(outputs, skip_special_tokens=True)
        return translated
    except Exception as exc:
        logger.warning("Batch translation failed: %s", exc)
        return texts


def translate_text(value: Any, force: bool = False) -> str:
    text = safe_text(value)
    if not text:
        return ""
    # Skip if already cached - this is the key speedup!
    cached = translation_cache.get(text)
    if cached:
        return cached
    # Check common translations first (fast!)
    text_lower = text.lower().strip()
    if text_lower in COMMON_TRANSLATIONS:
        translated = COMMON_TRANSLATIONS[text_lower]
        translation_cache[text] = translated
        return translated
    # Skip if doesn't look like Czech (unless forced) - this speeds things up massively
    if not force and not looks_like_czech(text):
        translation_cache[text] = text
        return text
    # If no model and no google translator, just return as-is
    if (translator_model is None or translator_tokenizer is None) and google_translator is None:
        translation_cache[text] = text
        return text
    # Queue for batch translation (will be processed later)
    if text not in _translation_queue:
        _translation_queue.append(text)
    # Return original for now, will be replaced after batch processing
    return text


def flush_translation_queue() -> None:
    """Translate all queued texts in batches."""
    global _translation_queue
    if not _translation_queue or translator_model is None:
        _translation_queue = []
        return
    # Filter out already cached
    to_translate = [t for t in _translation_queue if t not in translation_cache]
    if not to_translate:
        _translation_queue = []
        return
    logger.info("Batch translating %d texts...", len(to_translate))
    batch_size = 32
    for i in range(0, len(to_translate), batch_size):
        batch = to_translate[i : i + batch_size]
        try:
            translated = translate_batch(batch)
            for orig, trans in zip(batch, translated):
                translation_cache[orig] = trans
            if (i // batch_size + 1) % 10 == 0:
                logger.info("  Translated %d/%d...", min(i + batch_size, len(to_translate)), len(to_translate))
        except Exception as exc:
            logger.warning("Batch translation failed: %s", exc)
            for text in batch:
                translation_cache[text] = text
    _translation_queue = []
    logger.info("Batch translation complete")


def alias_name(user_id: str) -> str:
    random.seed(int(user_id))
    return f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}"


def infer_category(title: str) -> str:
    lower = title.lower()
    for category, keywords in CATEGORY_KEYWORDS.items():
        if any(keyword in lower for keyword in keywords):
            return category
    return "Professional Skills"


def infer_skill_levels(course_titles: Iterable[str]) -> Dict[str, str]:
    skills: Dict[str, str] = {}
    for title in course_titles:
        lower = title.lower()
        for key, (skill_name, level) in SKILL_KEYWORDS.items():
            if key in lower:
                current_level = skills.get(skill_name)
                if current_level != "advanced":
                    skills[skill_name] = level
    return skills


def summarize_categories(course_titles: Iterable[str]) -> List[Dict[str, Any]]:
    counter = Counter(infer_category(title) for title in course_titles if isinstance(title, str))
    total = sum(counter.values()) or 1
    return [
        {"category": category, "count": count, "share": round(count / total * 100, 1)}
        for category, count in counter.most_common()
    ]


def load_erp_profiles() -> Dict[str, Dict[str, Any]]:
    df = pd.read_excel(DATA_DIR / "ERP_SK1.Start_month - SE.xlsx")
    df = df.rename(
        columns={
            "persstat_start_month.personal_number": "personal_number",
            "persstat_start_month.profession": "profession",
            "persstat_start_month.planned_position": "planned_position",
            "persstat_start_month.basic_branch_of_education_name": "education_branch",
            "persstat_start_month.field_of_study_name": "field_of_study",
            "persstat_start_month.education_category_name": "education_category",
        }
    )
    profiles = {}
    for row in df.to_dict("records"):
        personal_number = str(row.get("personal_number")).strip()
        if not personal_number or personal_number == "nan":
            continue
        profiles[personal_number] = {
            "profession": translate_text(row.get("profession") or "Specialist"),
            "planned_position": translate_text(row.get("planned_position") or row.get("profession") or "Specialist"),
            "education_branch": translate_text(row.get("education_branch") or "Applied Sciences"),
            "field_of_study": translate_text(row.get("field_of_study") or "Industrial Engineering"),
            "education_category": translate_text(row.get("education_category") or "University"),
            "user_name": safe_text(row.get("user_name"), None),
        }
    return profiles


def load_training_history() -> Dict[str, List[Dict[str, Any]]]:
    df = pd.read_excel(DATA_DIR / "ZHRPD_VZD_STA_007.xlsx")
    df["Datum zahájení"] = pd.to_datetime(df["Datum zahájení"], errors="coerce")
    history: Dict[str, List[Dict[str, Any]]] = defaultdict(list)
    for row in df.to_dict("records"):
        user_id = str(row.get("ID účastníka")).strip()
        if not user_id or user_id == "nan":
            continue
        history[user_id].append(
            {
                "title": translate_text(row.get("Označení typu akce")),
                "start": row.get("Datum zahájení"),
                "end": row.get("Datum ukončení"),
                "source": "Legacy LMS",
            }
        )
    for items in history.values():
        items.sort(key=lambda x: x["start"] or datetime(2000, 1, 1))
    return history
    
    
def load_extended_history() -> Dict[str, List[Dict[str, Any]]]:
    df = pd.read_excel(DATA_DIR / "ZHRPD_VZD_STA_016_RE_RHRHAZ00.xlsx")
    df["Počát.datum"] = pd.to_datetime(df["Počát.datum"], errors="coerce")
    extra: Dict[str, List[Dict[str, Any]]] = defaultdict(list)
    for row in df.to_dict("records"):
        user_id = str(row.get("ID P")).strip()
        if not user_id or user_id == "nan":
            continue
        extra[user_id].append(
            {
                "title": translate_text(row.get("Název Q")),
                "start": row.get("Počát.datum"),
                "end": row.get("Koncové datum"),
                "source": "Qualification Archive",
            }
        )
    for items in extra.values():
        items.sort(key=lambda x: x["start"] or datetime(2000, 1, 1))
    return extra


def load_degreed_history() -> Dict[str, Dict[str, Any]]:
    df = pd.read_excel(DATA_DIR / "Degreed.xlsx")
    df["Completed Date"] = pd.to_datetime(df["Completed Date"], errors="coerce")
    latest: Dict[str, Dict[str, Any]] = {}
    for user_id, group in df.groupby("Employee ID"):
        group_sorted = group.sort_values("Completed Date", ascending=False).iloc[0]
        latest[str(user_id)] = {
            "title": group_sorted["Content Title"],
            "provider": group_sorted["Content Provider"],
            "date": group_sorted["Completed Date"],
            "minutes": group_sorted["Verified Learning Minutes"],
        }
    return latest


def build_course_catalog() -> List[Dict[str, Any]]:
    seen = set()
    catalog: List[Dict[str, Any]] = []
    max_courses = 600

    def add_entry(title: Any, source: str, metadata: Dict[str, Any] | None = None) -> None:
        clean_title = translate_text(title)
        if not clean_title or clean_title.lower() == "nan":
            return
        key = clean_title.lower()
        if key in seen:
            return
        seen.add(key)
        entry = {
            "title": clean_title,
            "category": infer_category(clean_title),
            "source": source,
        }
        if metadata:
            for key, value in metadata.items():
                if isinstance(value, str) or pd.isna(value):
                    entry[key] = translate_text(value)
                else:
                    entry[key] = value
        if not entry.get("category"):
            entry["category"] = infer_category(clean_title)
        catalog.append(entry)

    skill_df = pd.read_excel(DATA_DIR / "Skill_mapping.xlsx")
    for row in skill_df.to_dict("records"):
        title = row.get("Název D")
        topic = row.get("Téma")
        category = row.get("Kategorie")
        add_entry(
            title,
            "Skill Mapping",
            {
                "topic": topic,
                "category": category or infer_category(str(title)),
                "audience": row.get("Oddělení") or "Škoda Academy",
            },
        )

    training_titles = pd.read_excel(DATA_DIR / "ZHRPD_VZD_STA_007.xlsx")["Označení typu akce"].dropna().unique()
    # LIMIT FOR DEMO
    for title in training_titles[:50]:
        add_entry(title, "Legacy LMS")

    degreed_df = pd.read_excel(DATA_DIR / "Degreed.xlsx")
    # LIMIT FOR DEMO
    for _, row in degreed_df.head(50).iterrows():
        add_entry(
            row.get("Content Title"),
            "Degreed",
            {"provider": row.get("Content Provider"), "content_type": row.get("Content Type")},
        )

    if len(catalog) > max_courses:
        catalog = catalog[:max_courses]
    # Flush translations and update catalog entries
    flush_translation_queue()
    for entry in catalog:
        if "title" in entry:
            entry["title"] = translation_cache.get(entry["title"], entry["title"])
        for key in ["topic", "category", "audience", "provider"]:
            if key in entry and isinstance(entry[key], str):
                entry[key] = translation_cache.get(entry[key], entry[key])
    return catalog


def merge_histories(*histories: Dict[str, List[Dict[str, Any]]]) -> Dict[str, List[Dict[str, Any]]]:
    merged: Dict[str, List[Dict[str, Any]]] = defaultdict(list)
    for history in histories:
        for user_id, records in history.items():
            merged[user_id].extend(records)
    for items in merged.values():
        items.sort(key=lambda x: x["start"] or datetime(2000, 1, 1))
    return merged


def build_user_profiles() -> List[Dict[str, Any]]:
    erp = load_erp_profiles()
    history007 = load_training_history()
    history016 = load_extended_history()
    degreed = load_degreed_history()
    # Flush translations and update profiles with translated text
    flush_translation_queue()
    for profile in erp.values():
        for key in ["profession", "planned_position", "education_branch", "field_of_study", "education_category"]:
            if key in profile:
                profile[key] = translation_cache.get(profile[key], profile[key])
    # Update history entries with translated titles
    for user_id, entries in list(history007.items()) + list(history016.items()):
        for entry in entries:
            if "title" in entry:
                entry["title"] = translation_cache.get(entry["title"], entry["title"])
    merged_history = merge_histories(history007, history016)

    users = []
    # LIMIT FOR DEMO: Process only first 50 users to speed up translation
    erp_items = list(erp.items())[:50]
    for user_id, profile in erp_items:
        courses = merged_history.get(user_id, [])
        course_titles = [c["title"] for c in courses if c.get("title")]
        recent_entries = courses[-5:]
        earliest_date = None
        for entry in courses:
            if entry.get("start") and (earliest_date is None or entry["start"] < earliest_date):
                earliest_date = entry["start"]
        experience_years = round(((TODAY - earliest_date).days / 365), 1) if earliest_date else 5.0
        skills = infer_skill_levels(course_titles)
        course_mix = summarize_categories(course_titles)

        degreed_focus = degreed.get(user_id)
        if degreed_focus:
            title = translation_cache.get(degreed_focus['title'], degreed_focus['title'])
            provider = translation_cache.get(degreed_focus.get('provider', 'Degreed'), degreed_focus.get('provider', 'Degreed'))
            current_focus = f"{title} ({provider})"
        elif courses:
            title = translation_cache.get(courses[-1]['title'], courses[-1]['title'])
            current_focus = f"{title} ({courses[-1].get('source', 'Internal')})"
        else:
            current_focus = "Awaiting next assignment"

        users.append(
            {
                "id": user_id,
                "name": profile.get("user_name") or generate_mock_name(user_id),
                "department": "Skoda Academy" if "Academy" in profile["planned_position"] else "Operational Excellence",
                "role": profile["profession"],
                "position": profile["planned_position"],
                "experience_years": experience_years,
                "education": {
                    "category": profile["education_category"],
                    "branch": profile["education_branch"],
                    "field": profile["field_of_study"],
                },
                "background": f"{profile['education_branch']} • {profile['field_of_study']}",
                "current_assignment": profile["planned_position"],
                "current_focus": current_focus,
                "skills": skills,
                "completed_courses": course_titles,
                "recent_courses": [
                    {
                        "title": entry["title"],
                        "date": entry["start"].strftime("%Y-%m-%d") if isinstance(entry["start"], datetime) else None,
                        "source": entry.get("source"),
                    }
                    for entry in recent_entries
                ],
                "course_mix": course_mix,
            }
        )
    return users


def _replace_translated_in_data(data: Any) -> Any:
    """Recursively replace original Czech text with translations in data structures."""
    if isinstance(data, dict):
        return {k: _replace_translated_in_data(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [_replace_translated_in_data(item) for item in data]
    elif isinstance(data, str):
        # If this string is in the queue and now has a translation, use it
        return translation_cache.get(data, data)
    return data


def main() -> None:
    logger.info("Rebuilding course catalog...")
    courses = build_course_catalog()
    # Process queued translations
    flush_translation_queue()
    # Replace original Czech text with translations
    courses = _replace_translated_in_data(courses)
    OUTPUT_COURSES.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_COURSES, "w", encoding="utf-8") as fp:
        json.dump(courses, fp, indent=2, ensure_ascii=False)
    logger.info("Saved %d courses to %s", len(courses), OUTPUT_COURSES)

    logger.info("Rebuilding user profiles...")
    users = build_user_profiles()
    # Process any remaining queued translations
    flush_translation_queue()
    # Replace original Czech text with translations
    users = _replace_translated_in_data(users)
    with open(OUTPUT_USERS, "w", encoding="utf-8") as fp:
        json.dump(users, fp, indent=2, ensure_ascii=False)
    logger.info("Saved %d users to %s", len(users), OUTPUT_USERS)

    if translation_cache:
        TRANSLATION_CACHE_PATH.parent.mkdir(parents=True, exist_ok=True)
        with open(TRANSLATION_CACHE_PATH, "w", encoding="utf-8") as fp:
            json.dump(translation_cache, fp, indent=2, ensure_ascii=False)
        logger.info("Persisted %d translated terms", len(translation_cache))


if __name__ == "__main__":
    main()
