const LABELS = {
  en: {
    docTitle: 'Meeting Minutes',
    participants: 'Participants & Speaking Share',
    agendaStatus: 'Agenda Coverage',
    covered: 'Covered',
    unresolved: 'Unresolved / Deferred',
    decisions: 'Decisions',
    actionItems: 'Action Items',
    ownerCol: 'Owner',
    dueCol: 'Due',
    taskCol: 'Commitment',
    transcriptExcerpt: 'Speaker-Labeled Notes',
    noneRecorded: 'None explicitly tagged in transcript.',
    unassigned: 'Unassigned',
    tbd: 'TBD',
  },
  de: {
    docTitle: 'Gesprächsprotokoll',
    participants: 'Teilnehmende & Redeanteil',
    agendaStatus: 'Tagesordnung (Abgleich)',
    covered: 'Besprochen',
    unresolved: 'Offen / Vertagt',
    decisions: 'Beschlüsse',
    actionItems: 'Aufgaben & Verantwortliche',
    ownerCol: 'Verantwortlich',
    dueCol: 'Frist',
    taskCol: 'Aufgabe',
    transcriptExcerpt: 'Sprecherprotokoll',
    noneRecorded: 'Keine explizit markierten Einträge im Transkript.',
    unassigned: 'Offen',
    tbd: 'Offen',
  },
  fr: {
    docTitle: 'Compte rendu de réunion',
    participants: 'Participants & Temps de parole',
    agendaStatus: 'Suivi de l’ordre du jour',
    covered: 'Traité',
    unresolved: 'Non résolu / Reporté',
    decisions: 'Décisions',
    actionItems: 'Plan d’actions',
    ownerCol: 'Responsable',
    dueCol: 'Échéance',
    taskCol: 'Action',
    transcriptExcerpt: 'Notes par intervenant',
    noneRecorded: 'Aucun élément explicitement balisé.',
    unassigned: 'Non attribué',
    tbd: 'À définir',
  },
  it: {
    docTitle: 'Verbale di riunione',
    participants: 'Partecipanti & Interventi',
    agendaStatus: 'Stato ordine del giorno',
    covered: 'Trattato',
    unresolved: 'In sospeso / Rinviato',
    decisions: 'Decisioni',
    actionItems: 'Azioni concordate',
    ownerCol: 'Responsabile',
    dueCol: 'Scadenza',
    taskCol: 'Attività',
    transcriptExcerpt: 'Note per relatore',
    noneRecorded: 'Nessuna voce contrassegnata nel trascritto.',
    unassigned: 'Non assegnato',
    tbd: 'Da definire',
  },
  es: {
    docTitle: 'Acta de reunión',
    participants: 'Participantes e intervenciones',
    agendaStatus: 'Cobertura del orden del día',
    covered: 'Tratado',
    unresolved: 'Pendiente / Pospuesto',
    decisions: 'Acuerdos y decisiones',
    actionItems: 'Tareas y responsables',
    ownerCol: 'Responsable',
    dueCol: 'Fecha límite',
    taskCol: 'Compromiso',
    transcriptExcerpt: 'Notas por interlocutor',
    noneRecorded: 'Sin elementos etiquetados explícitamente.',
    unassigned: 'Sin asignar',
    tbd: 'Por definir',
  },
  pt: {
    docTitle: 'Ata de reunião',
    participants: 'Participantes e intervenções',
    agendaStatus: 'Cobertura da pauta',
    covered: 'Abordado',
    unresolved: 'Pendente / Adiado',
    decisions: 'Decisões',
    actionItems: 'Plano de ação',
    ownerCol: 'Responsável',
    dueCol: 'Prazo',
    taskCol: 'Tarefa',
    transcriptExcerpt: 'Notas por orador',
    noneRecorded: 'Nenhum item marcado explicitamente.',
    unassigned: 'Não atribuído',
    tbd: 'A definir',
  },
  ko: {
    docTitle: '회의록',
    participants: '참석자 및 발언 비중',
    agendaStatus: '사전 안건 점검',
    covered: '논의됨',
    unresolved: '미결 / 이월',
    decisions: '결정 사항',
    actionItems: '실행 과제 (Action Items)',
    ownerCol: '담당자',
    dueCol: '기한',
    taskCol: '과제',
    transcriptExcerpt: '화자별 기록',
    noneRecorded: '명시적으로 표시된 항목이 없습니다.',
    unassigned: '미지정',
    tbd: '미정',
  },
};

const DECISION_RE = /^(?:decision|decided|agreed|beschluss|entschieden|décision|retenu|decisione|concordato|acuerdo|decisión|decisão|결정|합의)\s*[:：\-]\s*(.+)$/i;
const ACTION_RE = /^(?:action(?:\s+item)?|todo|next\s+step|aufgabe|action\s+à\s+suivre|azione|tarea|ação|실행\s*과제|할\s*일|-\s*\[\s*\])\s*[:：\-]?\s*(.+)$/i;

export function parseTranscriptTurns(rawText) {
  const lines = String(rawText || '').replace(/\r\n/g, '\n').split('\n');
  const turns = [];
  let currentTimestamp = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line === 'WEBVTT' || /^\d+$/.test(line)) continue;

    const vttTime = line.match(/^(\d{2}:\d{2}(?::\d{2})?)(?:\.\d+)?\s*-->/);
    if (vttTime) {
      currentTimestamp = vttTime[1];
      continue;
    }

    const vttVoice = line.match(/^<v\s+([^>]+)>\s*(.+)$/i);
    if (vttVoice) {
      turns.push({
        timestamp: currentTimestamp,
        speaker: vttVoice[1].trim(),
        text: vttVoice[2].replace(/<\/v>$/i, '').trim(),
      });
      continue;
    }

    // [00:12:04] Speaker Name: text  OR  Speaker Name (00:12): text  OR  Speaker Name: text
    const bracketLine = line.match(/^(?:\[(\d{1,2}:\d{2}(?::\d{2})?)\]\s*)?([A-Za-zÀ-ÖØ-öø-ÿ가-힣0-9][A-Za-zÀ-ÖØ-öø-ÿ가-힣0-9 ._'\-]{0,38}?)\s*(?:\((\d{1,2}:\d{2}(?::\d{2})?)\))?\s*[:：]\s+(.+)$/);
    if (bracketLine) {
      const candidateSpeaker = bracketLine[2].trim();
      if (!/^(?:https?|decision|decided|agreed|beschluss|décision|decisione|acuerdo|decisão|action|todo|aufgabe|azione|tarea|note)$/i.test(candidateSpeaker)) {
        turns.push({
          timestamp: bracketLine[1] || bracketLine[3] || currentTimestamp,
          speaker: candidateSpeaker,
          text: bracketLine[4].trim(),
        });
        continue;
      }
    }

    if (turns.length > 0 && !line.startsWith('#')) {
      turns[turns.length - 1].text += ' ' + line;
    } else if (!line.startsWith('#')) {
      turns.push({
        timestamp: currentTimestamp,
        speaker: 'Speaker 1',
        text: line,
      });
    }
  }
  return turns;
}

export function parseAgendaItems(agendaMarkdown) {
  if (!agendaMarkdown) return [];
  const items = [];
  for (const raw of String(agendaMarkdown).replace(/\r\n/g, '\n').split('\n')) {
    const line = raw.trim();
    if (!line) continue;
    const m = line.match(/^(?:[-*+]\s*(?:\[[ xX]\]\s*)?|\d+\.\s+|#{2,4}\s+)(.+)$/);
    if (m) {
      const topic = m[1].trim();
      if (topic.length >= 3) items.push(topic);
    }
  }
  return items;
}

function tokenizeKeywords(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9à-öø-ÿ가-힣\s]/gi, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 4 && !['with', 'from', 'that', 'this', 'review', 'discuss', 'update', 'besprechen', 'point', 'para'].includes(w));
}

export function reconcileAgenda(agendaItems, turns) {
  const fullCorpus = turns.map((t) => t.text.toLowerCase()).join(' ');
  return agendaItems.map((topic) => {
    const kws = tokenizeKeywords(topic);
    if (kws.length === 0) {
      return { topic, covered: fullCorpus.includes(topic.toLowerCase()), matchedKeywords: [] };
    }
    const matched = kws.filter((k) => fullCorpus.includes(k));
    const ratio = matched.length / kws.length;
    return {
      topic,
      covered: matched.length >= 1 && ratio >= 0.34,
      matchedKeywords: matched,
    };
  });
}

function extractActionDetails(rawItem, fallbackSpeaker, unassignedLabel, tbdLabel) {
  let text = rawItem.trim();
  let owner = null;
  let due = null;

  const atOwner = text.match(/@([A-Za-zÀ-ÖØ-öø-ÿ가-힣0-9_\-]+)/);
  if (atOwner) owner = atOwner[1];

  const ownerTag = text.match(/\b(?:owner|verantwortlich|responsable|responsabile|담당)\s*[:=]\s*([A-Za-zÀ-ÖØ-öø-ÿ가-힣0-9 _\-]+?)(?:[,;|\)]|$)/i);
  if (!owner && ownerTag) owner = ownerTag[1].trim();

  const dueIso = text.match(/\b(20\d{2}-\d{2}-\d{2})\b/);
  const dueBy = text.match(/\b(?:by|due|bis|avant\s+le|entro|antes\s+del|até)\s+([A-Za-zÀ-ÖØ-öø-ÿ0-9 \-\/]{3,20}?)(?:[.,;|\)]|$)/i);
  if (dueIso) due = dueIso[1];
  else if (dueBy) due = dueBy[1].trim();

  return {
    owner: owner || fallbackSpeaker || unassignedLabel,
    due: due || tbdLabel,
    task: text.replace(/\|/g, '/'),
  };
}

export function buildMeetingMinutes(rawTranscript, options = {}) {
  const lang = LABELS[options.lang] ? options.lang : 'en';
  const L = LABELS[lang];
  const date = options.date || new Date().toISOString().slice(0, 10);
  const title = options.title || `${L.docTitle} (${date})`;
  const turns = parseTranscriptTurns(rawTranscript);

  const speakerMap = new Map();
  let totalWords = 0;
  const decisions = [];
  const actions = [];

  for (const turn of turns) {
    const words = turn.text.split(/\s+/).filter(Boolean).length;
    totalWords += words;
    const prev = speakerMap.get(turn.speaker) || { speaker: turn.speaker, turns: 0, words: 0 };
    prev.turns += 1;
    prev.words += words;
    speakerMap.set(turn.speaker, prev);

    const sentences = turn.text.split(/(?<=[.!?。！？])\s+|\n/);
    for (const seg of sentences) {
      const s = seg.trim();
      const dm = s.match(DECISION_RE);
      if (dm) decisions.push({ speaker: turn.speaker, text: dm[1].trim(), timestamp: turn.timestamp });
      const am = s.match(ACTION_RE);
      if (am) {
        actions.push(extractActionDetails(am[1], turn.speaker, L.unassigned, L.tbd));
      }
    }
  }

  const speakers = Array.from(speakerMap.values()).map((s) => ({
    ...s,
    sharePct: totalWords > 0 ? Math.round((s.words / totalWords) * 1000) / 10 : 0,
  }));

  const agendaItems = parseAgendaItems(options.agenda || '');
  const agendaStatus = reconcileAgenda(agendaItems, turns);
  const unresolvedAgenda = agendaStatus.filter((a) => !a.covered);

  const yamlLines = [
    '---',
    'okf_version: "0.2"',
    'kind: "meeting_minutes"',
    `title: ${JSON.stringify(title)}`,
    `date: "${date}"`,
    `language: "${lang}"`,
    `speakers: [${speakers.map((s) => JSON.stringify(s.speaker)).join(', ')}]`,
    `decisions_count: ${decisions.length}`,
    `open_actions_count: ${actions.length}`,
    `unresolved_agenda_count: ${unresolvedAgenda.length}`,
    '---',
    '',
    `# ${title}`,
    '',
    `## ${L.participants}`,
    ...speakers.map((s) => `- [[${s.speaker}]] — ${s.turns} turns · ${s.words} words (${s.sharePct}%)`),
    '',
  ];

  if (agendaStatus.length > 0) {
    yamlLines.push(`## ${L.agendaStatus}`);
    for (const item of agendaStatus) {
      yamlLines.push(`- [${item.covered ? 'x' : ' '}] **${item.covered ? L.covered : L.unresolved}**: ${item.topic}`);
    }
    yamlLines.push('');
  }

  yamlLines.push(`## ${L.decisions}`);
  if (decisions.length === 0) {
    yamlLines.push(`- _${L.noneRecorded}_`);
  } else {
    for (const d of decisions) {
      const ts = d.timestamp ? ` (${d.timestamp})` : '';
      yamlLines.push(`- **[[${d.speaker}]]**${ts}: ${d.text}`);
    }
  }
  yamlLines.push('');

  yamlLines.push(`## ${L.actionItems}`);
  if (actions.length === 0) {
    yamlLines.push(`- _${L.noneRecorded}_`);
  } else {
    yamlLines.push(`| ${L.ownerCol} | ${L.dueCol} | ${L.taskCol} |`);
    yamlLines.push('| :--- | :--- | :--- |');
    for (const a of actions) {
      yamlLines.push(`| [[${a.owner}]] | ${a.due} | ${a.task} |`);
    }
  }
  yamlLines.push('');

  yamlLines.push(`## ${L.transcriptExcerpt}`);
  for (const t of turns) {
    const ts = t.timestamp ? `[${t.timestamp}] ` : '';
    yamlLines.push(`- ${ts}**[[${t.speaker}]]**: ${t.text}`);
  }
  yamlLines.push('');

  return {
    markdown: yamlLines.join('\n'),
    meta: {
      title,
      date,
      language: lang,
      speakers,
      decisions,
      actions,
      agendaStatus,
      unresolvedAgendaCount: unresolvedAgenda.length,
    },
  };
}

export function lintMeetingMinutes(markdownText) {
  const text = String(markdownText || '').replace(/\r\n/g, '\n');
  const issues = [];

  if (!text.startsWith('---\n')) {
    issues.push({ code: 'MISSING_FRONTMATTER', severity: 'error', message: 'Missing OKF YAML frontmatter block (---).' });
  } else {
    const endIdx = text.indexOf('\n---', 4);
    if (endIdx === -1) {
      issues.push({ code: 'UNCLOSED_FRONTMATTER', severity: 'error', message: 'Unclosed YAML frontmatter block.' });
    } else {
      const fm = text.slice(4, endIdx);
      for (const reqKey of ['okf_version', 'kind', 'title', 'date', 'speakers']) {
        if (!new RegExp(`^${reqKey}\\s*:`, 'm').test(fm)) {
          issues.push({ code: 'MISSING_FRONTMATTER_KEY', severity: 'error', message: `Missing required frontmatter key: ${reqKey}` });
        }
      }
    }
  }

  const lines = text.split('\n');
  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (/^\|\s*\[\[?(?:Unassigned|Offen|Non attribué|Non assegnato|Sin asignar|Não atribuído|미지정)\]?\]?\s*\|/i.test(trimmed)) {
      issues.push({
        code: 'UNASSIGNED_ACTION_OWNER',
        severity: 'warning',
        line: idx + 1,
        message: `Action item on line ${idx + 1} has no assigned owner.`,
      });
    }
    if (/^\|.+\|\s*(?:TBD|Offen|À définir|Da definire|Por definir|A definir|미정)\s*\|/i.test(trimmed)) {
      issues.push({
        code: 'MISSING_ACTION_DEADLINE',
        severity: 'warning',
        line: idx + 1,
        message: `Action item on line ${idx + 1} has an unspecified deadline (TBD).`,
      });
    }
    if (/^-\s*\[\s\]\s*\*\*(?:Unresolved|Offen|Non résolu|In sospeso|Pendiente|Pendente|미결)/i.test(trimmed)) {
      issues.push({
        code: 'UNRESOLVED_AGENDA_ITEM',
        severity: 'warning',
        line: idx + 1,
        message: `Pre-distributed agenda item on line ${idx + 1} remained unresolved.`,
      });
    }
  });

  const errorCount = issues.filter((i) => i.severity === 'error').length;
  const warningCount = issues.filter((i) => i.severity === 'warning').length;
  return {
    valid: errorCount === 0,
    errorCount,
    warningCount,
    issues,
  };
}
