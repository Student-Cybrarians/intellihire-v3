"""
Taxonomy Manager for Canonical Skill & Career Hierarchy Resolution.
"""
import os
import json
import re
from typing import Dict, Any, List, Optional, Tuple

class TaxonomyManager:
    """Manages skills and career taxonomy structures with fuzzy and exact alias resolution."""
    def __init__(self, taxonomy_dir: Optional[str] = None):
        if not taxonomy_dir:
            taxonomy_dir = os.path.dirname(os.path.abspath(__file__))
        self.taxonomy_dir = taxonomy_dir
        self.skills_by_id: Dict[str, Dict[str, Any]] = {}
        self.alias_to_id: Dict[str, str] = {}
        self.career_categories: List[Dict[str, Any]] = []
        self._load_taxonomy()

    def _load_taxonomy(self):
        """Load skills.json and careers.json from disk."""
        skills_path = os.path.join(self.taxonomy_dir, "skills.json")
        if os.path.exists(skills_path):
            with open(skills_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                for item in data.get("skills", []):
                    skill_id = item["id"]
                    self.skills_by_id[skill_id] = item
                    # Register primary name
                    norm_primary = self._normalize_token(item["name"])
                    self.alias_to_id[norm_primary] = skill_id
                    # Register aliases
                    for alias in item.get("aliases", []):
                        norm_alias = self._normalize_token(alias)
                        self.alias_to_id[norm_alias] = skill_id

        careers_path = os.path.join(self.taxonomy_dir, "careers.json")
        if os.path.exists(careers_path):
            with open(careers_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                self.career_categories = data.get("categories", [])

    def _normalize_token(self, text: str) -> str:
        """Lowercase, strip non-alphanumeric (except plus/dash/dot), and normalize whitespace."""
        text = text.lower().strip()
        # Keep + (for c++), # (for c#), . (for next.js / node.js)
        text = re.sub(r"[^\w\+\#\.\-]", " ", text)
        return " ".join(text.split())

    def match_skill(self, raw_query: str) -> Tuple[Optional[Dict[str, Any]], str, float]:
        """
        Match a raw skill string to canonical skill entity.
        Returns (canonical_skill_dict_or_None, match_type, confidence).
        """
        norm_q = self._normalize_token(raw_query)
        if not norm_q:
            return None, "unrecognized", 0.0

        # Exact match
        if norm_q in self.alias_to_id:
            skill_id = self.alias_to_id[norm_q]
            return self.skills_by_id[skill_id], "exact", 1.0

        # Substring / partial match
        for alias, skill_id in self.alias_to_id.items():
            if alias == norm_q:
                return self.skills_by_id[skill_id], "exact", 1.0
            if len(alias) >= 3 and alias in norm_q:
                return self.skills_by_id[skill_id], "alias", 0.85
            if len(norm_q) >= 3 and norm_q in alias:
                return self.skills_by_id[skill_id], "fuzzy", 0.75

        return None, "unrecognized", 0.0

    def get_all_skills(self) -> List[Dict[str, Any]]:
        return list(self.skills_by_id.values())

    def get_career_hierarchy(self) -> List[Dict[str, Any]]:
        return self.career_categories

taxonomy_manager = TaxonomyManager()
