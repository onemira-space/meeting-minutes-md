#!/usr/bin/env node
import fs from 'node:fs';
import { buildMeetingMinutes, lintMeetingMinutes } from '../src/index.mjs';

const args = process.argv.slice(2);
const cmd = args[0];

function getFlag(name, fallback = null) {
  const i = args.indexOf(name);
  return i !== -1 && args[i + 1] ? args[i + 1] : fallback;
}

if (!cmd || cmd === '--help' || cmd === '-h') {
  console.log(`meeting-minutes-md v1.0.0 — Offline OKF v0.2 Meeting Minutes Formatter & Linter

Usage:
  meeting-minutes-md format <transcript.txt|.vtt|.md> [--agenda <agenda.md>] [--lang en|de|fr|it|es|pt|ko] [--title "..."] [--date YYYY-MM-DD] [--out <minutes.md>] [--json]
  meeting-minutes-md lint <minutes.md> [--strict] [--json]
`);
  process.exit(0);
}

if (cmd === 'format') {
  const inputPath = args[1];
  if (!inputPath || !fs.existsSync(inputPath)) {
    console.error('Error: Please provide a valid transcript file path.');
    process.exit(1);
  }
  const transcript = fs.readFileSync(inputPath, 'utf8');
  const agendaPath = getFlag('--agenda');
  const agenda = agendaPath && fs.existsSync(agendaPath) ? fs.readFileSync(agendaPath, 'utf8') : '';
  const result = buildMeetingMinutes(transcript, {
    agenda,
    lang: getFlag('--lang', 'en'),
    title: getFlag('--title'),
    date: getFlag('--date'),
  });
  const outPath = getFlag('--out');
  if (outPath) fs.writeFileSync(outPath, result.markdown, 'utf8');
  if (args.includes('--json')) {
    console.log(JSON.stringify(result, null, 2));
  } else if (!outPath) {
    process.stdout.write(result.markdown);
  }
  process.exit(0);
}

if (cmd === 'lint') {
  const inputPath = args[1];
  if (!inputPath || !fs.existsSync(inputPath)) {
    console.error('Error: Please provide a Markdown minutes file to lint.');
    process.exit(1);
  }
  const report = lintMeetingMinutes(fs.readFileSync(inputPath, 'utf8'));
  const strict = args.includes('--strict');
  if (args.includes('--json')) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(`OKF Minutes Lint: valid=${report.valid} errors=${report.errorCount} warnings=${report.warningCount}`);
    for (const issue of report.issues) {
      console.log(`  [${issue.severity.toUpperCase()}] ${issue.code}: ${issue.message}`);
    }
  }
  if (!report.valid || (strict && report.warningCount > 0)) {
    process.exit(1);
  }
  process.exit(0);
}

console.error(`Unknown command: ${cmd}`);
process.exit(1);
