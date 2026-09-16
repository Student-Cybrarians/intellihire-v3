"""
Automated Fairness & Disparate Impact Auditing Engine.
Evaluates algorithmic hiring outcomes against the EEOC Four-Fifths (80%) Rule and NYC Local Law 144.
"""
from typing import Dict, Any, List, Optional
from collections import defaultdict
from app.schemas.fairness import (
    DemographicGroupMetrics, DisparateImpactAuditRequest, DisparateImpactAuditResponse
)
from app.config import settings

class FairnessAuditorEngine:
    """Calculates adverse impact metrics and generates compliance audit certificates."""

    def audit_disparate_impact(self, req: DisparateImpactAuditRequest) -> DisparateImpactAuditResponse:
        """Evaluate selection ratios across demographic groups for 80% rule compliance."""
        group_totals = defaultdict(int)
        group_selected = defaultdict(int)

        for record in req.applicant_data:
            grp = str(record.get("group", "unspecified"))
            passed = bool(record.get("passed", False))
            group_totals[grp] += 1
            if passed:
                group_selected[grp] += 1

        if not group_totals:
            return DisparateImpactAuditResponse(
                tenant_id=req.tenant_id,
                job_id=req.job_id,
                protected_attribute=req.protected_attribute,
                highest_selection_rate_group="None",
                highest_selection_rate=0.0,
                groups=[],
                overall_compliant=True,
                audit_recommendations=["No applicant data provided for auditing."]
            )

        # 1. Compute selection rate per group: SR = selected / total
        selection_rates: Dict[str, float] = {}
        for grp, total in group_totals.items():
            sel = group_selected[grp]
            sr = sel / float(total) if total > 0 else 0.0
            selection_rates[grp] = sr

        # 2. Find highest selection rate group (benchmark group)
        highest_grp = max(selection_rates, key=selection_rates.get)
        highest_sr = selection_rates[highest_grp]

        # 3. Compute Impact Ratio (IR) = SR_group / SR_benchmark
        threshold = req.custom_threshold or settings.FAIRNESS_FOUR_FIFTHS_THRESHOLD
        group_metrics: List[DemographicGroupMetrics] = []
        overall_compliant = True
        recommendations = []

        for grp, total in group_totals.items():
            sr = selection_rates[grp]
            if highest_sr > 0.0:
                ir = sr / highest_sr
            else:
                ir = 1.0  # If nobody selected, ratio is technically 1.0

            passes_rule = ir >= threshold
            if not passes_rule:
                overall_compliant = False
                recommendations.append(
                    f"Group '{grp}' exhibits an adverse impact ratio of {ir:.1%} (< {threshold:.0%} threshold). Review rubric weighting on this role."
                )

            group_metrics.append(DemographicGroupMetrics(
                group_name=grp,
                total_applicants=total,
                selected_count=group_selected[grp],
                selection_rate=round(sr, 4),
                impact_ratio=round(ir, 4),
                passes_four_fifths_rule=passes_rule
            ))

        if overall_compliant:
            recommendations.append("All demographic groups satisfy the EEOC 80% (Four-Fifths) selection rule. No adverse impact detected.")

        return DisparateImpactAuditResponse(
            tenant_id=req.tenant_id,
            job_id=req.job_id,
            protected_attribute=req.protected_attribute,
            highest_selection_rate_group=highest_grp,
            highest_selection_rate=round(highest_sr, 4),
            groups=group_metrics,
            overall_compliant=overall_compliant,
            audit_recommendations=recommendations
        )

fairness_auditor_engine = FairnessAuditorEngine()
