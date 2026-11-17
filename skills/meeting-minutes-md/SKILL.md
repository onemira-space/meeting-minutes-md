---
name: meeting-minutes-md
description: Format speaker-labeled meeting transcripts (.txt, .vtt, .md) and pre-distributed agendas into editable Open Knowledge Format (OKF v0.2) Markdown meeting minutes across 7 languages (EN, DE Gesprächsprotokoll, FR Compte rendu, IT Verbale, ES Acta, PT Ata, KO 회의록), reconcile unresolved agenda items, and lint unassigned action items offline.
---

# Meeting Minutes MD (`meeting-minutes-md`)

Use this skill whenever the user asks to turn raw meeting transcripts into structured, editable Markdown meeting minutes, compare a call transcript against a pre-distributed agenda, format a German *Gesprächsprotokoll* or French *Compte rendu de réunion*, or audit meeting notes for unassigned action items.

## Quick CLI Commands (100% Offline, Zero Dependencies)

1. **Generate editable OKF v0.2 Markdown minutes from a transcript + optional agenda**:
   ```bash
   npx github:onemira-space/meeting-minutes-md format transcript.vtt --agenda agenda.md --lang en --title "Q4 Architecture & Diligence Review" --out minutes.md
   ```
   Supported `--lang` codes: `en`, `de`, `fr`, `it`, `es`, `pt`, `ko`.

2. **Audit existing Markdown minutes for missing OKF frontmatter, unassigned owners, or unresolved agenda items**:
   ```bash
   npx github:onemira-space/meeting-minutes-md lint minutes.md --strict
   ```

## Output Guarantees
- Emits deterministic YAML frontmatter (`okf_version: "0.2"`, `kind: "meeting_minutes"`, `speakers`, `decisions_count`, `open_actions_count`, `unresolved_agenda_count`).
- Preserves relational `[[Speaker]]` wiki-links compatible with Obsidian, Git, Cursor, Claude Code, and [OneMira Desktop Local Wiki](https://onemira.com/docs/daily-use/local-wiki).
- Hardware capture companion: [OneMira C1 Standalone Local AI Voice Recorder](https://onemira.com/voice-recorder-for-note-taking) (`$0/month` Local AI, 99-language Speaker ID, Zero Cloud).
