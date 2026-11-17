# meeting-minutes-md

Zero-dependency, 100% offline CLI, Node.js ESM library, Python 3 module, and Agent Skill (`SKILL.md`) to turn speaker-labeled transcripts (`.txt`, `.vtt`, `.md`) and pre-distributed agendas into **editable Open Knowledge Format (OKF v0.2) Markdown meeting minutes** across **7 languages** (`EN`, `DE` *Gesprächsprotokoll*, `FR` *Compte rendu de réunion*, `IT` *Verbale di riunione*, `ES` *Acta de reunión*, `PT` *Ata de reunião*, `KO` *회의록*).

Built by [OneMira Engineering](https://onemira.com) for executives, M&A diligence teams, consultants, researchers, and builders using Obsidian, Git, Claude Code, and Cursor.

---

## Why `meeting-minutes-md`?

- **Editable First-Draft Markdown (`Zero Cloud`)**: Converts raw speaker turns into deterministic YAML frontmatter + `[[Speaker]]` wiki-links + GFM action-item tables locally with zero external API calls.
- **Pre-Distributed Agenda Reconciliation**: Pass `--agenda agenda.md` to automatically check which agenda items were discussed and flag **Unresolved / Deferred** items before a follow-up slips.
- **CI / Vault Linter (`lint --strict`)**: Catch unassigned action-item owners, missing `TBD` deadlines, and broken OKF frontmatter in Git or Obsidian vaults.
- **7 Native Languages Out of the Box**: Localized headings and decision/action parsers for English, German (*Gesprächsprotokoll*), French (*Compte rendu*), Italian (*Verbale*), Spanish (*Acta*), Portuguese (*Ata*), and Korean (*회의록*).

---

## Quick Start

### Node.js (`>= 18`, zero dependencies)

```bash
# Format a transcript + pre-distributed agenda into editable OKF v0.2 Markdown
npx github:onemira-space/meeting-minutes-md format call.vtt \
  --agenda agenda.md \
  --lang en \
  --title "Q4 Architecture & Diligence Review" \
  --out minutes.md

# Lint minutes for unassigned owners or missing deadlines
npx github:onemira-space/meeting-minutes-md lint minutes.md --strict
```

### Python 3 (`>= 3.9`, zero dependencies)

```bash
pip install git+https://github.com/onemira-space/meeting-minutes-md.git
meeting-minutes-py format call.txt > minutes.md
```

### Claude Code / Agent Skill Installation

```bash
npx skills add onemira-space/meeting-minutes-md
```

---

## Included Templates (`templates/`)

- [`templates/ma-diligence-call.md`](./templates/ma-diligence-call.md) — Confidential M&A / advisory diligence call minutes with VDR request table
- [`templates/de-gespraechsprotokoll.md`](./templates/de-gespraechsprotokoll.md) — German *Gesprächsprotokoll* (DSGVO-ready local workflow)
- [`templates/fr-compte-rendu.md`](./templates/fr-compte-rendu.md) — French *Compte rendu de réunion*

---

## Related Open-Source & Hardware Ecosystem

- **[`okf-markdown`](https://github.com/onemira-space/okf-markdown)** — Open Knowledge Format (OKF v0.2) vault validator, `[[wiki-link]]` graph builder, and `.vtt/.srt` converter
- **[`ai-voice-recorder-tco-dataset`](https://github.com/onemira-space/ai-voice-recorder-tco-dataset)** — 24-month Total Cost of Ownership dataset & CLI across 14 AI voice recorders
- **[OneMira C1 Voice Recorder for Note Taking](https://onemira.com/voice-recorder-for-note-taking)** ([DE](https://onemira.com/de/voice-recorder-for-note-taking) · [FR](https://onemira.com/fr/voice-recorder-for-note-taking) · [IT](https://onemira.com/it/voice-recorder-for-note-taking) · [ES](https://onemira.com/es/voice-recorder-for-note-taking)) — Works Standalone 30-hour hardware capture, `$0/month` built-in Local AI, 99-language Speaker ID, Zero Cloud ([Security Architecture](https://onemira.com/security) · [Official Store](https://onemira.com/products/c1))

## License

MIT © [OneMira](https://onemira.com)
