import re
import shutil
import subprocess
import tempfile
from collections import defaultdict
from datetime import datetime, timezone

from git import Repo

MAX_COMMITS = 1000
BUGFIX_RE = re.compile(r"\b(fix(es|ed)?|bug|patch|defect|hotfix|resolve[sd]?)\b", re.IGNORECASE)
SKIP_SUFFIXES = (".lock", ".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico", ".pdf", ".zip", ".min.js")
# Non-source files: docs, changelogs, config. Excluded so the ranking is about code.
EXCLUDE_SUFFIXES = (".rst", ".md", ".txt", ".toml", ".cfg", ".ini", ".yml", ".yaml", ".json")
EXCLUDE_DIRS = ("docs/", "doc/", ".github/")
EXCLUDE_NAMES = ("license", "authors", "changes", "changelog", "news", "manifest.in")


def is_non_source(path: str) -> bool:
    p = path.lower()
    name = p.rsplit("/", 1)[-1]
    return (
        p.endswith(EXCLUDE_SUFFIXES)
        or p.startswith(EXCLUDE_DIRS)
        or name in EXCLUDE_NAMES
    )

def clone_repo(url: str) -> tuple[Repo, str]:
    tmp = tempfile.mkdtemp(prefix="mc_")
    try:
        subprocess.run(
            ["git", "clone", "--quiet", "--depth", "1000", "--single-branch", "--no-tags", url, tmp],
            check=True, capture_output=True, text=True, timeout=300,
        )
    except Exception:
        shutil.rmtree(tmp, ignore_errors=True)
        raise
    return Repo(tmp), tmp


def extract_features(repo: Repo):
    """One `git log --numstat` call over up to MAX_COMMITS commits."""
    out = subprocess.run(
        ["git", "-C", str(repo.working_dir), "log", f"--max-count={MAX_COMMITS}",
         "--numstat", "--pretty=format:%x1e%H%x1f%ae%x1f%ct%x1f%s"],
        capture_output=True, text=True, encoding="utf-8", errors="replace",
        check=True, timeout=600,
    ).stdout

    stats = defaultdict(lambda: {"commits": 0, "churn": 0, "authors": set(), "bugfix": 0, "last": None})
    total = 0
    for block in out.split("\x1e"):
        block = block.strip("\n")
        if not block:
            continue
        lines = block.split("\n")
        parts = lines[0].split("\x1f")
        if len(parts) < 4:
            continue
        _sha, author, ts, subject = parts[0], parts[1], parts[2], parts[3]
        total += 1
        is_fix = bool(BUGFIX_RE.search(subject))
        when = datetime.fromtimestamp(int(ts), tz=timezone.utc)
        for line in lines[1:]:
            cols = line.split("\t")
            if len(cols) != 3:
                continue
            ins, dele, path = cols
            if "=>" in path or path.lower().endswith(SKIP_SUFFIXES) or is_non_source(path):
                continue
            s = stats[path]
            s["commits"] += 1
            s["churn"] += (int(ins) if ins.isdigit() else 0) + (int(dele) if dele.isdigit() else 0)
            s["authors"].add(author)
            s["bugfix"] += 1 if is_fix else 0
            if s["last"] is None or when > s["last"]:
                s["last"] = when
    return total, stats