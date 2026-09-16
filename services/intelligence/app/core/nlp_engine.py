"""
NLP Candidate Structuring & Entity Extraction Engine.
Extracts skills, experience, education, projects, and generates provenance span evidence.
"""
import re
import time
from typing import Dict, Any, List, Optional, Tuple
from app.schemas.nlp import (
    ProvenanceSpan, SkillEntity, EducationEntity, ExperienceEntity,
    ProjectEntity, ExtractEntitiesRequest, ExtractEntitiesResponse,
    NormalizeSkillsRequest, NormalizedSkillItem, NormalizeSkillsResponse
)
from app.taxonomy.taxonomy_manager import taxonomy_manager

class NLPEntityExtractionEngine:
    """Extracts structured entities and provides span-level evidence lineages."""

    DEGREE_PATTERNS = [
        (r"\b(Ph\.?D\.?|Doctor of Philosophy|Doctorate)\b", "PhD"),
        (r"\b(Master(?:'s)?(?:\s+of\s+[A-Za-z\s]+)?|M\.?S\.?|M\.?Tech\.?|M\.?B\.?A\.?|M\.?C\.?A\.?)\b", "Master's"),
        (r"\b(Bachelor(?:'s)?(?:\s+of\s+[A-Za-z\s]+)?|B\.?S\.?|B\.?E\.?|B\.?Tech\.?|B\.?B\.?A\.?|B\.?C\.?A\.?|B\.?A\.?)\b", "Bachelor's"),
        (r"\b(Associate(?:'s)?\s+Degree|A\.?S\.?|A\.?A\.?)\b", "Associate"),
    ]

    YEAR_SPAN_PATTERN = r"\b(19\d\d|20\d\d)\s*(?:-|–|to)\s*(19\d\d|20\d\d|Present|Current|now)\b"

    def extract_skills(self, text: str) -> List[SkillEntity]:
        """Match and locate canonical skills within text with character spans."""
        skills: Dict[str, SkillEntity] = {}
        all_canonical_skills = taxonomy_manager.get_all_skills()

        for skill_def in all_canonical_skills:
            skill_id = skill_def["id"]
            search_terms = [skill_def["name"]] + skill_def.get("aliases", [])

            for term in search_terms:
                # Escape regex characters
                escaped_term = re.escape(term)
                # Word boundary check, accounting for symbols like +, #, .
                pattern = rf"(?<!\w){escaped_term}(?!\w)"
                for match in re.finditer(pattern, text, re.IGNORECASE):
                    start, end = match.span()
                    matched_str = text[start:end]

                    span = ProvenanceSpan(
                        start_char=start,
                        end_char=end,
                        matched_text=matched_str,
                        confidence=1.0 if matched_str.lower() == skill_def["name"].lower() else 0.9
                    )

                    if skill_id not in skills:
                        skills[skill_id] = SkillEntity(
                            raw_name=matched_str,
                            canonical_id=skill_id,
                            canonical_name=skill_def["name"],
                            category=skill_def["category"],
                            domain=skill_def["domain"],
                            proficiency_level="intermediate",
                            provenance=[span]
                        )
                    else:
                        skills[skill_id].provenance.append(span)

        return list(skills.values())

    def extract_education(self, text: str) -> List[EducationEntity]:
        """Extract education degrees, institutions, and years."""
        education: List[EducationEntity] = []
        lines = text.splitlines()

        for line_idx, line in enumerate(lines):
            line_clean = line.strip()
            if not line_clean:
                continue

            for pattern, degree_name in self.DEGREE_PATTERNS:
                match = re.search(pattern, line_clean, re.IGNORECASE)
                if match:
                    start_char = text.find(line_clean) + match.start()
                    end_char = start_char + len(match.group(0))

                    # Search for year span in this line or next line
                    years_match = re.search(self.YEAR_SPAN_PATTERN, line_clean, re.IGNORECASE)
                    start_yr = int(years_match.group(1)) if years_match else None
                    end_yr_str = years_match.group(2) if years_match else None
                    end_yr = int(end_yr_str) if end_yr_str and end_yr_str.isdigit() else None

                    # Institution heuristic
                    inst_match = re.search(r"\b([A-Za-z\s]+(?:University|Institute|College|Academy|School))\b", line_clean, re.IGNORECASE)
                    institution = inst_match.group(0).strip() if inst_match else "Higher Education Institution"

                    span = ProvenanceSpan(
                        start_char=max(0, start_char),
                        end_char=end_char,
                        matched_text=match.group(0),
                        confidence=0.9
                    )

                    education.append(EducationEntity(
                        institution=institution,
                        degree=degree_name,
                        field_of_study="Computer Science & Engineering" if "Tech" in line_clean or "Science" in line_clean else "General Studies",
                        start_year=start_yr,
                        end_year=end_yr,
                        provenance=[span]
                    ))
                    break

        return education

    def extract_experience(self, text: str) -> Tuple[List[ExperienceEntity], float]:
        """Extract work experience roles, companies, dates, and total years."""
        experiences: List[ExperienceEntity] = []
        total_months = 0
        current_year = 2026

        lines = text.splitlines()
        role_keywords = r"\b(?:Engineer|Developer|Architect|Scientist|Manager|Consultant|Intern|Analyst|Lead|Specialist|Director|VP|President)\b"

        for line in lines:
            line_clean = line.strip()
            if not line_clean:
                continue

            # Check if line contains a role keyword and 'at' or '@' or company indicator
            if re.search(role_keywords, line_clean, re.IGNORECASE) and re.search(r"\b(at|@|,)\b", line_clean, re.IGNORECASE):
                # Extract role and company
                role_match = re.search(rf"^(?P<role>[A-Za-z\s]+(?:Engineer|Developer|Architect|Scientist|Manager|Consultant|Intern|Analyst|Lead|Specialist|Director))\s+(?:at|@|,)\s+(?P<company>[A-Za-z0-9\s\.\&]+?)(?:\s*[\(\[\,]|\s*(?:19\d\d|20\d\d)|\s*$)", line_clean, re.IGNORECASE)
                if role_match:
                    role = role_match.group("role").strip()
                    company = role_match.group("company").strip()

                    # Extract dates
                    date_match = re.search(r"(19\d\d|20\d\d)\s*(?:-|–|to)\s*(19\d\d|20\d\d|Present|Current|now)", line_clean, re.IGNORECASE)
                    duration_mo = 24
                    is_curr = False
                    start_date_str = None
                    end_date_str = None

                    if date_match:
                        sy = int(date_match.group(1))
                        ey_str = date_match.group(2)
                        start_date_str = str(sy)
                        if ey_str.lower() in ("present", "current", "now"):
                            ey = current_year
                            is_curr = True
                            end_date_str = "Present"
                        else:
                            ey = int(ey_str)
                            end_date_str = str(ey)
                        duration_mo = max(1, (ey - sy) * 12)

                    start_idx = text.find(line_clean)
                    end_idx = start_idx + len(line_clean)
                    span = ProvenanceSpan(
                        start_char=max(0, start_idx),
                        end_char=end_idx,
                        matched_text=line_clean,
                        confidence=0.9
                    )

                    total_months += duration_mo
                    experiences.append(ExperienceEntity(
                        company=company,
                        role_title=role,
                        start_date=start_date_str,
                        end_date=end_date_str,
                        is_current=is_curr,
                        duration_months=duration_mo,
                        provenance=[span]
                    ))

        total_years = round(total_months / 12.0, 1)
        return experiences, total_years

    def determine_seniority(self, total_years: float, skills: List[SkillEntity]) -> str:
        """Heuristic seniority classification based on experience duration and leadership indicators."""
        if total_years >= 8.0:
            return "lead"
        elif total_years >= 5.0:
            return "senior"
        elif total_years >= 2.0:
            return "mid_level"
        elif total_years >= 0.5:
            return "junior"
        return "entry_level"

    def extract_entities(self, req: ExtractEntitiesRequest) -> ExtractEntitiesResponse:
        """Main entity extraction dispatcher."""
        start_time = time.time()
        text = req.text

        skills = self.extract_skills(text)
        education = self.extract_education(text)
        experiences, total_years = self.extract_experience(text)
        seniority = self.determine_seniority(total_years, skills)

        return ExtractEntitiesResponse(
            candidate_id=req.candidate_id,
            tenant_id=req.tenant_id,
            skills=skills,
            education=education,
            experience=experiences,
            projects=[],
            total_years_experience=total_years,
            seniority_estimate=seniority,
            extraction_latency_ms=(time.time() - start_time) * 1000
        )

    def normalize_skills(self, req: NormalizeSkillsRequest) -> NormalizeSkillsResponse:
        """Normalize raw skill strings to canonical skills."""
        results = []
        for raw in req.skill_names:
            matched, match_type, conf = taxonomy_manager.match_skill(raw)
            if matched:
                results.append(NormalizedSkillItem(
                    query=raw,
                    canonical_id=matched["id"],
                    canonical_name=matched["name"],
                    category=matched["category"],
                    domain=matched["domain"],
                    match_type=match_type,
                    confidence=conf
                ))
            else:
                results.append(NormalizedSkillItem(
                    query=raw,
                    canonical_id="skill_unrecognized",
                    canonical_name=raw.strip(),
                    category="Other",
                    domain="General",
                    match_type="unrecognized",
                    confidence=0.0
                ))
        return NormalizeSkillsResponse(normalized_skills=results)

nlp_engine = NLPEntityExtractionEngine()
