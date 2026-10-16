"""Heuristic risk scoring. NOT a trained model: method is always 'heuristic' and validated is always False."""

WEIGHTS = {"bugfix": 0.40, "churn": 0.25, "commits": 0.20, "contributors": 0.15}

LABEL_METHOD = (
    "Keyword heuristic: a commit counts as a bug fix if its first message line matches "
    "fix/bug/patch/defect/hotfix/resolve. This is not SZZ. Up to the last 1000 commits of the default branch; "
    "renamed files, binary/lock files, and docs/changelog/config files are skipped."
)
PREDICTION_TARGET = (
    "Heuristic relative bug-proneness of a file (rank-based, 0..1). Not a validated prediction."
)


def _percentile_ranks(values: list[float]) -> list[float]:
    """Rank-normalise to 0..1 so one huge outlier cannot flatten all other scores."""
    n = len(values)
    if n <= 1:
        return [0.0] * n
    order = sorted(range(n), key=lambda i: values[i])
    ranks = [0.0] * n
    for position, idx in enumerate(order):
        ranks[idx] = position / (n - 1)
    return ranks


def score_files(rows) -> list[float]:
    """Return one 0..1 risk score per row, in the same order as rows."""
    bugfix = _percentile_ranks([r.bugfix_commits for r in rows])
    churn = _percentile_ranks([r.churn for r in rows])
    commits = _percentile_ranks([r.commits for r in rows])
    contributors = _percentile_ranks([r.contributors for r in rows])
    return [
        round(
            WEIGHTS["bugfix"] * bugfix[i]
            + WEIGHTS["churn"] * churn[i]
            + WEIGHTS["commits"] * commits[i]
            + WEIGHTS["contributors"] * contributors[i],
            4,
        )
        for i in range(len(rows))
    ]