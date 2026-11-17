import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { buildMeetingMinutes, lintMeetingMinutes, parseTranscriptTurns } from '../src/index.mjs';

test('1. Parses timestamped & VTT speaker turns and computes speaking share', () => {
  const sample = `[00:01:10] Sarah Chen: Welcome everyone to the diligence architecture sync. Decision: Keep all speech-to-text local with zero cloud retention.
[00:02:05] Marc Weber: Agreed. Action: @Marc to upload hardware security spec by 2026-11-22.`;
  const turns = parseTranscriptTurns(sample);
  assert.equal(turns.length, 2);
  assert.equal(turns[0].speaker, 'Sarah Chen');
  assert.equal(turns[1].timestamp, '00:02:05');

  const res = buildMeetingMinutes(sample, {
    title: 'M&A Diligence Sync',
    date: '2026-11-17',
    agenda: '- Local speech-to-text architecture\n- Vendor pricing escalation clause',
  });
  assert.equal(res.meta.decisions.length, 1);
  assert.equal(res.meta.actions.length, 1);
  assert.equal(res.meta.actions[0].owner, 'Marc');
  assert.equal(res.meta.actions[0].due, '2026-11-22');
  assert.equal(res.meta.unresolvedAgendaCount, 1);
  assert.ok(res.markdown.includes('okf_version: "0.2"'));
  assert.ok(res.markdown.includes('[[Sarah Chen]]'));
});

test('2. Supports localized German Gesprächsprotokoll & French Compte rendu headings', () => {
  const deSample = `[09:00] Anna: Beschluss: Wir nutzen lokale KI ohne Abo.
[09:04] Lukas: Aufgabe: @Lukas erstellt das Gesprächsprotokoll bis 2026-11-20.`;
  const deRes = buildMeetingMinutes(deSample, { lang: 'de', date: '2026-11-17' });
  assert.ok(deRes.markdown.includes('# Gesprächsprotokoll (2026-11-17)'));
  assert.ok(deRes.markdown.includes('## Beschlüsse'));
  assert.ok(deRes.markdown.includes('| [[Lukas]] | 2026-11-20 |'));

  const frSample = `[14:00] Claire: Décision: Aucun bot dans nos appels clients.`;
  const frRes = buildMeetingMinutes(frSample, { lang: 'fr', date: '2026-11-17' });
  assert.ok(frRes.markdown.includes('# Compte rendu de réunion (2026-11-17)'));
  assert.ok(frRes.markdown.includes('## Décisions'));
});

test('3. Lints missing frontmatter, unassigned owners, TBD deadlines & unresolved agenda items', () => {
  const bad = `# Raw Notes\n| [[Unassigned]] | TBD | Fix deck |`;
  const badLint = lintMeetingMinutes(bad);
  assert.equal(badLint.valid, false);
  assert.ok(badLint.issues.some((i) => i.code === 'MISSING_FRONTMATTER'));
  assert.ok(badLint.issues.some((i) => i.code === 'UNASSIGNED_ACTION_OWNER'));
  assert.ok(badLint.issues.some((i) => i.code === 'MISSING_ACTION_DEADLINE'));
});

test('4. CLI format and lint commands run cleanly offline', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mm-md-'));
  const trFile = path.join(tmp, 'call.txt');
  const outFile = path.join(tmp, 'minutes.md');
  fs.writeFileSync(
    trFile,
    '[10:00] Elena: Decision: Adopt OKF v0.2 Markdown.\n[10:02] Elena: Action: @Elena publish repo by 2026-11-19.\n',
  );
  execFileSync('node', ['./bin/meeting-minutes.mjs', 'format', trFile, '--date', '2026-11-17', '--out', outFile], {
    cwd: path.resolve('.'),
  });
  const lintJson = JSON.parse(
    execFileSync('node', ['./bin/meeting-minutes.mjs', 'lint', outFile, '--strict', '--json'], {
      cwd: path.resolve('.'),
      encoding: 'utf8',
    }),
  );
  assert.equal(lintJson.valid, true);
  assert.equal(lintJson.warningCount, 0);
  fs.rmSync(tmp, { recursive: true, force: true });
});
