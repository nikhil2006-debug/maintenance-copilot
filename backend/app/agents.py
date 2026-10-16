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


def run_agents(files, scores):
    risk = {f.path: s for f, s in zip(files, scores)}
    bug = bug_analysis_agent(files, scores)
    debt = technical_debt_agent(files)

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
            {"agent": "bug_evolution", "status": "skipped", "method": "rule_based", "findings": [],
             "error": "Per-commit history is not stored yet, so temporal evolution is not computed."},
            agent("technical_debt", debt, note="Proxy indicator from churn and author spread; no complexity data."),
            agent("recommendation", recs),
            agent("orchestrator", [], note="Merges findings by file and records conflicts."),
        ],
        "orchestrator": {"conflicts": conflicts, "agent_errors": []},
        "recommendations": recs,
    }