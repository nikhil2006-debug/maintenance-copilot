"""Rule-based agents. Heuristics only: nothing here is a validated prediction."""


def _percentile(values: list[float], p: float) -> float:
    if not values:
        return 0.0
    s = sorted(values)
    return s[min(len(s) - 1, int(p * len(s)))]


def bug_analysis_agent(files, scores):
    cutoff = max(3, _percentile([f.bugfix_commits for f in files], 0.90))
    findings = []
    for f, s in zip(files, scores):
        if f.bugfix_commits >= cutoff:
            findings.append({
                "file": f.path,
                "summary": f"{f.bugfix_commits} of {f.commits} commits touching this file match bug-fix keywords.",
                "evidence": {"bugfix_commits": f.bugfix_commits, "commits": f.commits,
                             "risk": s, "rule": f"bugfix_commits >= {cutoff}"},
            })
    findings.sort(key=lambda x: x["evidence"]["bugfix_commits"], reverse=True)
    return findings[:15]


def technical_debt_agent(files):
    ratios = [f.churn / f.commits for f in files if f.commits >= 5]
    cutoff = _percentile(ratios, 0.90)
    findings = []
    for f in files:
        if f.commits < 5:
            continue
        ratio = f.churn / f.commits
        if ratio >= cutoff and f.contributors >= 3:
            findings.append({
                "file": f.path,
                "summary": f"Large changes per commit (avg {ratio:.0f} lines) spread across {f.contributors} authors.",
                "evidence": {"churn_per_commit": round(ratio, 1), "contributors": f.contributors,
                             "commits": f.commits, "rule": "top-decile churn/commit, >=5 commits, >=3 authors"},
            })
    findings.sort(key=lambda x: x["evidence"]["churn_per_commit"], reverse=True)
    return findings[:15]


def bug_evolution_agent(monthly):
    """Compares the bug-fix share of commits in the earlier vs later half of the analysed months."""
    base = {"agent": "bug_evolution", "method": "rule_based"}
    if not monthly:
        return {**base, "status": "skipped", "findings": [],
                "error": "Monthly commit counts were not collected for this analysis; re-run it."}
    if len(monthly) < 6:
        return {**base, "status": "skipped", "findings": [],
                "error": f"Only {len(monthly)} months with source-file commits; at least 6 are needed for a comparison."}

    half = len(monthly) // 2
    early, late = monthly[:half], monthly[-half:]

    def share(rows):
        total = sum(r["commits"] for r in rows)
        fixes = sum(r["bugfix_commits"] for r in rows)
        return total, (fixes / total if total else None)

    e_total, e_share = share(early)
    l_total, l_share = share(late)
    if e_share is None or l_share is None or e_total < 20 or l_total < 20:
        return {**base, "status": "skipped", "findings": [],
                "error": f"Too few commits per half (earlier {e_total}, later {l_total}); at least 20 each are needed."}

    diff = l_share - e_share
    trend = "rising" if diff >= 0.05 else "falling" if diff <= -0.05 else "flat"
    finding = {
        "file": "(repository-wide)",
        "summary": (f"Bug-fix share of commits is {trend}: {e_share:.0%} in the earlier {half} months "
                    f"vs {l_share:.0%} in the later {half} months."),
        "evidence": {
            "earlier_share": round(e_share, 3), "later_share": round(l_share, 3),
            "earlier_commits": e_total, "later_commits": l_total, "months_per_half": half,
            "rule": "later minus earlier share >= +0.05 rising, <= -0.05 falling; threshold untuned",
        },
    }
    return {**base, "status": "completed", "findings": [finding],
            "note": "Compares two halves of the analysed window using keyword-based bug-fix labels. Not a forecast."}


def run_agents(files, scores, monthly=None):
    risk = {f.path: s for f, s in zip(files, scores)}
    bug = bug_analysis_agent(files, scores)
    debt = technical_debt_agent(files)
    evolution = bug_evolution_agent(monthly or [])

    bug_files = {x["file"] for x in bug}
    debt_files = {x["file"] for x in debt}

    conflicts = [
        {"file": p, "agents": ["bug_analysis", "technical_debt"],
         "description": "Flagged as debt-heavy but has low bug-risk score.",
         "resolution": "Kept as a debt-only recommendation."}
        for p in debt_files - bug_files if risk.get(p, 0) < 0.4
    ]

    recs = []
    for path in sorted(bug_files | debt_files, key=lambda p: risk.get(p, 0), reverse=True)[:10]:
        actions, reasons = [], []
        if path in bug_files:
            actions.append("Add regression tests around the areas fixed repeatedly.")
            reasons.append("bug_analysis")
        if path in debt_files:
            actions.append("Review for splitting into smaller units; large, widely edited changes are common here.")
            reasons.append("technical_debt")
        recs.append({"file": path, "rank": len(recs) + 1, "risk": risk.get(path),
                     "actions": actions, "flagged_by": reasons})

    def agent(name, findings, **extra):
        return {"agent": name, "status": "completed", "method": "rule_based", "findings": findings, **extra}

    return {
        "agents": [
            agent("bug_analysis", bug),
            evolution,
            agent("technical_debt", debt, note="Proxy indicator from churn and author spread; no complexity data."),
            agent("recommendation", recs),
            agent("orchestrator", [], note="Merges findings by file and records conflicts."),
        ],
        "orchestrator": {"conflicts": conflicts, "agent_errors": []},
        "recommendations": recs,
    }