"""
Prompt Injection Defense & LLM Leakage Shield Engine.
Detects direct/indirect prompt injections, delimiter attacks, jailbreaks, and system prompt leakage.
"""
import re
from typing import Dict, Any, List, Tuple

class PromptDefenseShield:
    """Detects and neutralizes adversarial prompt injection payloads in user submissions."""

    INJECTION_PATTERNS = [
        (r"(?i)\bignore\s+(?:all\s+)?(?:previous|prior|above)\s+(?:instructions|prompts|rules)\b", "instruction_override"),
        (r"(?i)\b(?:disregard|forget|bypass)\s+(?:system\s+)?(?:instructions|guardrails|safety)\b", "guardrail_bypass"),
        (r"(?i)\b(?:you\s+are\s+now|act\s+as|pretend\s+to\s+be)\s+(?:DAN|unrestricted|god\s+mode|jailbroken)\b", "jailbreak_persona"),
        (r"(?i)\b(?:repeat|print|output|dump|reveal|show)\s+(?:the\s+)?(?:system\s+prompt|initial\s+prompt|developer\s+message)\b", "prompt_leakage"),
        (r"(?i)<\|(?:im_start|im_end|system|assistant|user)\|>", "chatml_delimiter_injection"),
        (r"(?i)\[SYSTEM_PROMPT\]|\[INST\]|\[\/INST\]|<<SYS>>|<\/SYS>>", "raw_token_delimiter_injection"),
        (r"(?i)\b(?:grade\s+this|score\s+this|give\s+me)\s+(?:100%|full\s+marks|perfect\s+score)\s+(?:regardless|no\s+matter)\b", "evaluator_hijack")
    ]

    def scan_text(self, text: str) -> Tuple[bool, List[str], float]:
        """
        Scan input text for adversarial prompt injection signatures.
        Returns (is_threat_detected, matched_threat_types, risk_score_0_to_1).
        """
        matched_threats = []
        if not text:
            return False, [], 0.0

        for pattern, threat_type in self.INJECTION_PATTERNS:
            if re.search(pattern, text):
                matched_threats.append(threat_type)

        threat_count = len(matched_threats)
        risk_score = min(1.0, threat_count * 0.4)
        is_threat = threat_count > 0

        return is_threat, matched_threats, risk_score

    def sanitize_for_prompt(self, text: str) -> str:
        """Sanitize and delimit untrusted candidate content safely before passing to LLM context."""
        # 1. Neutralize delimiter tags
        sanitized = re.sub(r"<\|(?:im_start|im_end|system|assistant|user)\|>", "", text, flags=re.IGNORECASE)
        sanitized = re.sub(r"\[SYSTEM_PROMPT\]|\[INST\]|\[\/INST\]|<<SYS>>|<\/SYS>>", "", sanitized, flags=re.IGNORECASE)

        # 2. Escape XML-like markers
        sanitized = sanitized.replace("<", "&lt;").replace(">", "&gt;")

        # 3. Enclose within isolated XML envelope
        return f"<candidate_untrusted_input>\n{sanitized}\n</candidate_untrusted_input>"

prompt_defense_shield = PromptDefenseShield()
