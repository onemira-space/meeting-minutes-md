import re, sys, json, datetime

def format_minutes(raw_text: str, title: str = "Meeting Minutes", date: str = None, agenda_text: str = "") -> dict:
    date = date or datetime.date.today().isoformat()
    turns = []
    for line in raw_text.splitlines():
        s = line.strip()
        if not s or s == "WEBVTT":
            continue
        m = re.match(r"^(?:\[(\d{1,2}:\d{2}(?::\d{2})?)\]\s*)?([A-Za-z0-9 ._'-]{1,36}):\s+(.+)$", s)
        if m and m.group(2).lower() not in ("decision", "action", "todo"):
            turns.append({"timestamp": m.group(1), "speaker": m.group(2).strip(), "text": m.group(3).strip()})
    speakers = sorted({t["speaker"] for t in turns})
    decisions = []
    actions = []
    for t in turns:
        for seg in re.split(r"(?<=[.!?])\s+", t["text"]):
            dm = re.match(r"^(?:Decision|Agreed|Beschluss|Décision):\s*(.+)$", seg, re.I)
            if dm:
                decisions.append((t["speaker"], dm.group(1).strip()))
            am = re.match(r"^(?:Action|TODO|Aufgabe):\s*(.+)$", seg, re.I)
            if am:
                owner_m = re.search(r"@([A-Za-z0-9_-]+)", am.group(1))
                due_m = re.search(r"\b(20\d{2}-\d{2}-\d{2})\b", am.group(1))
                actions.append((owner_m.group(1) if owner_m else t["speaker"], due_m.group(1) if due_m else "TBD", am.group(1).strip()))
    agenda_items = [re.sub(r"^(?:[-*+]\s*(?:\[[ xX]\]\s*)?|\d+\.\s+)", "", l.strip()) for l in agenda_text.splitlines() if re.match(r"^(?:[-*+]|\d+\.)", l.strip())]
    corpus = " ".join(t["text"].lower() for t in turns)
    unresolved = [a for a in agenda_items if not any(w in corpus for w in re.findall(r"[a-z0-9]{4,}", a.lower()))]
    md = [
        "---",
        'okf_version: "0.2"',
        'kind: "meeting_minutes"',
        f"title: {json.dumps(title)}",
        f'date: "{date}"',
        f"speakers: {json.dumps(speakers)}",
        f"decisions_count: {len(decisions)}",
        f"open_actions_count: {len(actions)}",
        f"unresolved_agenda_count: {len(unresolved)}",
        "---",
        "",
        f"# {title}",
        "",
        "## Decisions",
        *([f"- **[[{s}]]**: {d}" for s, d in decisions] or ["- _None explicitly tagged._"]),
        "",
        "## Action Items",
        *(["| Owner | Due | Commitment |", "| :--- | :--- | :--- |", *[f"| [[{o}]] | {due} | {task} |" for o, due, task in actions]] if actions else ["- _None explicitly tagged._"]),
        ""
    ]
    return {"markdown": "\n".join(md), "unresolved_agenda": unresolved}

def lint_minutes(md_text: str) -> dict:
    issues = []
    if not md_text.startswith("---\n"):
        issues.append("MISSING_FRONTMATTER")
    if "| [[Unassigned]] |" in md_text:
        issues.append("UNASSIGNED_OWNER")
    return {"valid": "MISSING_FRONTMATTER" not in issues, "issues": issues}

def main():
    if len(sys.argv) < 3:
        print("Usage: meeting-minutes-py <format|lint> <file>")
        sys.exit(1)
    mode, path = sys.argv[1], sys.argv[2]
    txt = open(path, encoding="utf-8").read()
    if mode == "format":
        sys.stdout.write(format_minutes(txt)["markdown"])
    elif mode == "lint":
        res = lint_minutes(txt)
        print(json.dumps(res, indent=2))
        sys.exit(0 if res["valid"] else 1)

if __name__ == "__main__":
    main()
