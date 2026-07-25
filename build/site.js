/* Data Swimming Pool — reading site behaviour:
   theme, mobile nav, search, reading progress, scrollspy, Mermaid. */

const BASE = window.SITE_BASE || '';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* ------------------------------------------------------------- theme -- */

const root = document.documentElement;
const stored = localStorage.getItem('dsp-theme');
const initial = stored || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
root.setAttribute('data-theme', initial);

$('#themebtn')?.addEventListener('click', () => {
  const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  localStorage.setItem('dsp-theme', next);
  renderDiagrams(true);
});

/* --------------------------------------------------------- mobile nav -- */

const burger = $('.burger');
const closeNav = () => { document.body.classList.remove('nav-open'); burger?.setAttribute('aria-expanded', 'false'); };
burger?.addEventListener('click', () => {
  const open = document.body.classList.toggle('nav-open');
  burger.setAttribute('aria-expanded', String(open));
});
$('#scrim')?.addEventListener('click', closeNav);
$$('.sb-flat a, .sb-links a').forEach((a) => a.addEventListener('click', closeNav));

// Keep the active sidebar entry in view on load.
requestAnimationFrame(() => {
  const on = $('.sb-links a.on');
  if (on) on.scrollIntoView({ block: 'center' });
});

/* ------------------------------------------------------- reading bar -- */

const bar = $('#bar');
if (bar) {
  const update = () => {
    const h = document.documentElement.scrollHeight - innerHeight;
    bar.style.width = h > 0 ? `${Math.min(100, (scrollY / h) * 100)}%` : '0%';
  };
  addEventListener('scroll', update, { passive: true });
  addEventListener('resize', update);
  update();
}

/* ---------------------------------------------------------- scrollspy -- */

const railLinks = $$('.rail nav a');
if (railLinks.length) {
  const targets = railLinks
    .map((a) => ({ a, el: document.getElementById(decodeURIComponent(a.hash.slice(1))) }))
    .filter((t) => t.el);
  const spy = () => {
    const y = scrollY + 140;
    let cur = targets[0];
    for (const t of targets) if (t.el.offsetTop <= y) cur = t;
    railLinks.forEach((a) => a.classList.remove('on'));
    cur?.a.classList.add('on');
  };
  addEventListener('scroll', spy, { passive: true });
  spy();
}

/* ------------------------------------------------------------- search -- */

const q = $('#q');
const results = $('#results');
let index = null;
let sel = -1;

async function loadIndex() {
  if (index) return index;
  const res = await fetch(`${BASE}/search-index.json`);
  index = await res.json();
  return index;
}

const escapeHtml = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function score(item, terms) {
  const title = item.t.toLowerCase();
  const group = item.g.toLowerCase();
  const body = item.x.toLowerCase();
  let s = 0;
  for (const term of terms) {
    if (title.includes(term)) s += title.startsWith(term) ? 60 : 40;
    else if (group.includes(term)) s += 12;
    else if (body.includes(term)) s += 8;
    else return 0;
  }
  return s;
}

function snippet(item, term) {
  const i = item.x.toLowerCase().indexOf(term);
  if (i < 0) return item.g;
  const start = Math.max(0, i - 40);
  const raw = (start ? '…' : '') + item.x.slice(start, start + 120) + '…';
  return escapeHtml(raw).replace(new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'ig'), '<mark>$1</mark>');
}

function render(list, terms) {
  if (!list.length) {
    results.innerHTML = '<p class="none">No matches. Try “correlation”, “privacy”, “Kafka”, or “fraud”.</p>';
  } else {
    results.innerHTML = list
      .map((it) => `<a href="${it.u}"><b>${escapeHtml(it.t)}</b><span>${snippet(it, terms[0])}</span></a>`)
      .join('');
  }
  results.hidden = false;
  sel = -1;
}

let timer;
q?.addEventListener('input', () => {
  clearTimeout(timer);
  timer = setTimeout(async () => {
    const value = q.value.trim().toLowerCase();
    if (value.length < 2) { results.hidden = true; return; }
    const data = await loadIndex();
    const terms = value.split(/\s+/);
    const hits = data
      .map((it) => ({ it, s: score(it, terms) }))
      .filter((r) => r.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 12)
      .map((r) => r.it);
    render(hits, terms);
  }, 110);
});

q?.addEventListener('keydown', (e) => {
  const links = $$('a', results);
  if (e.key === 'Escape') { results.hidden = true; q.blur(); return; }
  if (!links.length) return;
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault();
    sel = (sel + (e.key === 'ArrowDown' ? 1 : -1) + links.length) % links.length;
    links.forEach((l) => l.classList.remove('sel'));
    links[sel].classList.add('sel');
    links[sel].scrollIntoView({ block: 'nearest' });
  } else if (e.key === 'Enter' && sel >= 0) {
    e.preventDefault();
    location.href = links[sel].href;
  }
});

document.addEventListener('click', (e) => {
  if (results && !results.hidden && !e.target.closest('.searchwrap')) results.hidden = true;
});

addEventListener('keydown', (e) => {
  if (e.key === '/' && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)) {
    e.preventDefault();
    q?.focus();
  }
});

/* ------------------------------------------------------------ mermaid -- */

let mermaid;
let sources = null;

async function renderDiagrams(rerender = false) {
  const nodes = $$('pre.mermaid');
  if (!nodes.length) return;

  if (!sources) sources = nodes.map((n) => n.textContent);
  if (rerender) {
    nodes.forEach((n, i) => {
      n.textContent = sources[i];
      n.removeAttribute('data-processed');
    });
  }

  if (!mermaid) ({ default: mermaid } = await import('https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs'));

  const dark = root.getAttribute('data-theme') === 'dark';
  const part = getComputedStyle(root).getPropertyValue('--part').trim() || '#0b8ea3';

  mermaid.initialize({
    startOnLoad: false,
    theme: 'base',
    securityLevel: 'loose',
    fontFamily: "'Public Sans', system-ui, sans-serif",
    themeVariables: dark
      ? {
          background: '#0d2833',
          primaryColor: '#123c4c',
          primaryTextColor: '#e7f1f5',
          primaryBorderColor: part,
          secondaryColor: '#16333f',
          tertiaryColor: '#1b414f',
          lineColor: '#5f8b9b',
          textColor: '#d3e6ed',
          mainBkg: '#123c4c',
          nodeBorder: part,
          clusterBkg: 'rgba(255,255,255,.04)',
          clusterBorder: '#2a5566',
          fontSize: '14px',
        }
      : {
          background: '#ffffff',
          primaryColor: '#e9f6fa',
          primaryTextColor: '#0c2733',
          primaryBorderColor: part,
          secondaryColor: '#f3f7f4',
          tertiaryColor: '#fdf6e9',
          lineColor: '#4a7c90',
          textColor: '#12252e',
          clusterBkg: '#f7fbfc',
          clusterBorder: '#cfe2e9',
          fontSize: '14px',
        },
    // Natural size keeps labels readable; the figure frame scrolls if needed.
    flowchart: { htmlLabels: true, curve: 'basis', useMaxWidth: false },
    sequence: { useMaxWidth: false },
    gantt: { useMaxWidth: false },
  });

  try {
    await mermaid.run({ querySelector: 'pre.mermaid' });
  } catch (err) {
    console.warn('mermaid', err);
  }

  $$('.figure').forEach((f) => { if (f.querySelector('svg')) f.dataset.zoomable = ''; });
}

renderDiagrams();

/* ----------------------------------------------------------- lightbox -- */

let box;
function openBox(svg) {
  if (!box) {
    box = document.createElement('div');
    box.className = 'lightbox';
    box.innerHTML = '<button class="lightbox-close" aria-label="Close">✕</button><div class="lightbox-inner"></div>';
    box.addEventListener('click', (e) => { if (!e.target.closest('.lightbox-inner')) closeBox(); });
    document.body.appendChild(box);
  }
  const clone = svg.cloneNode(true);
  clone.removeAttribute('style');
  clone.style.width = `${svg.getBoundingClientRect().width * 1.6}px`;
  clone.style.height = 'auto';
  $('.lightbox-inner', box).replaceChildren(clone);
  box.hidden = false;
  document.body.style.overflow = 'hidden';
}
function closeBox() {
  if (box) box.hidden = true;
  document.body.style.overflow = '';
}
document.addEventListener('click', (e) => {
  const fig = e.target.closest('.figure[data-zoomable]');
  if (!fig) return;
  const svg = fig.querySelector('svg');
  if (svg) openBox(svg);
});
addEventListener('keydown', (e) => { if (e.key === 'Escape') closeBox(); });

/* ------------------------------------------------------- audio reader -- */

const listenBtn = $('#listenbtn');
const audioPanel = $('#audioPanel');
const audioBackdrop = $('#audioBackdrop');
const audioClose = $('#audioClose');
const audioScope = $('#audioScope');
const audioVoice = $('#audioVoice');
const audioRate = $('#audioRate');
const audioPlay = $('#audioPlay');
const audioPause = $('#audioPause');
const audioStop = $('#audioStop');
const audioStatus = $('#audioStatus');
const audioBar = $('#audioBar');
const synth = window.speechSynthesis;

let audioData;
let audioQueue = [];
let audioPosition = 0;
let audioSession = 0;
let audioIsPlaying = false;
let audioIsPaused = false;

function openAudio() {
  audioPanel.hidden = false;
  audioBackdrop.hidden = false;
  document.body.classList.add('audio-open');
  audioClose.focus();
}

function closeAudio() {
  audioPanel.hidden = true;
  audioBackdrop.hidden = true;
  document.body.classList.remove('audio-open');
  listenBtn?.focus();
}

listenBtn?.addEventListener('click', openAudio);
audioClose?.addEventListener('click', closeAudio);
audioBackdrop?.addEventListener('click', closeAudio);
addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && audioPanel && !audioPanel.hidden) closeAudio();
});

function populateVoices() {
  if (!synth || !audioVoice) return;
  const voices = synth.getVoices()
    .filter((voice) => voice.lang?.toLowerCase().startsWith('en'))
    .sort((a, b) => Number(b.default) - Number(a.default) || a.name.localeCompare(b.name));
  const previous = localStorage.getItem('dsp-audio-voice');
  audioVoice.innerHTML = voices
    .map((voice, i) => `<option value="${escapeHtml(voice.name)}"${voice.name === previous || (!previous && i === 0) ? ' selected' : ''}>${escapeHtml(voice.name)} · ${escapeHtml(voice.lang)}</option>`)
    .join('');
}

if (synth) {
  populateVoices();
  speechSynthesis.addEventListener?.('voiceschanged', populateVoices);
} else if (listenBtn) {
  listenBtn.disabled = true;
  listenBtn.title = 'Audio reading is not supported by this browser';
}

audioVoice?.addEventListener('change', () => localStorage.setItem('dsp-audio-voice', audioVoice.value));
audioRate?.addEventListener('change', () => localStorage.setItem('dsp-audio-rate', audioRate.value));
if (audioRate && localStorage.getItem('dsp-audio-rate')) {
  audioRate.value = localStorage.getItem('dsp-audio-rate');
}

async function loadAudioData() {
  if (audioData) return audioData;
  const response = await fetch(`${BASE}/audio-index.json`);
  if (!response.ok) throw new Error(`Audio text could not be loaded (${response.status})`);
  audioData = await response.json();
  return audioData;
}

function splitForSpeech(text, limit = 1100) {
  const sentences = text.match(/[^.!?]+(?:[.!?]+|$)/g) || [text];
  const chunks = [];
  let chunk = '';

  const add = (piece) => {
    const clean = piece.trim();
    if (!clean) return;
    if ((chunk + ' ' + clean).trim().length <= limit) {
      chunk = (chunk + ' ' + clean).trim();
      return;
    }
    if (chunk) chunks.push(chunk);
    chunk = '';
    if (clean.length <= limit) {
      chunk = clean;
      return;
    }
    const words = clean.split(/\s+/);
    for (const word of words) {
      if ((chunk + ' ' + word).trim().length > limit) {
        if (chunk) chunks.push(chunk);
        chunk = word;
      } else {
        chunk = (chunk + ' ' + word).trim();
      }
    }
  };

  sentences.forEach(add);
  if (chunk) chunks.push(chunk);
  return chunks;
}

function currentAudioEntry(data) {
  const current = (window.CURRENT || location.pathname).replace(/\/+$/, '/');
  return data.find((item) => item.u.replace(/\/+$/, '/') === current);
}

function setAudioStatus(message) {
  if (audioStatus) audioStatus.textContent = message;
}

function resetAudioControls() {
  audioIsPlaying = false;
  audioIsPaused = false;
  audioPlay.textContent = 'Start reading';
  audioPause.textContent = 'Pause';
  audioPause.disabled = true;
  audioStop.disabled = true;
}

function stopAudio({ reset = true } = {}) {
  audioSession += 1;
  synth?.cancel();
  audioQueue = [];
  audioPosition = 0;
  if (audioBar) audioBar.style.width = '0%';
  if (reset) setAudioStatus('Ready to read.');
  resetAudioControls();
}

function selectedVoice() {
  return synth?.getVoices().find((voice) => voice.name === audioVoice?.value);
}

function updateAudioProgress(item) {
  const percent = audioQueue.length ? Math.round((audioPosition / audioQueue.length) * 100) : 0;
  if (audioBar) audioBar.style.width = `${percent}%`;
  const chapter = item.chapterTotal > 1
    ? `Chapter ${item.chapterNumber} of ${item.chapterTotal} · `
    : '';
  setAudioStatus(`${chapter}${item.title} · ${percent}%`);
}

function speakAudioChunk(session) {
  if (session !== audioSession || !audioIsPlaying) return;
  if (audioPosition >= audioQueue.length) {
    if (audioBar) audioBar.style.width = '100%';
    setAudioStatus('Reading complete.');
    resetAudioControls();
    return;
  }

  const item = audioQueue[audioPosition];
  updateAudioProgress(item);
  const utterance = new SpeechSynthesisUtterance(item.text);
  utterance.rate = Number(audioRate?.value || 1);
  const voice = selectedVoice();
  if (voice) {
    utterance.voice = voice;
    utterance.lang = voice.lang;
  } else {
    utterance.lang = 'en';
  }
  utterance.onend = () => {
    if (session !== audioSession) return;
    audioPosition += 1;
    speakAudioChunk(session);
  };
  utterance.onerror = (event) => {
    if (session !== audioSession || event.error === 'interrupted' || event.error === 'canceled') return;
    setAudioStatus(`Audio reader stopped: ${event.error}.`);
    resetAudioControls();
  };
  synth.speak(utterance);
}

async function startAudio() {
  if (!synth) {
    setAudioStatus('This browser does not support text-to-speech.');
    return;
  }
  if (audioIsPaused) {
    synth.resume();
    audioIsPaused = false;
    audioPause.textContent = 'Pause';
    audioPlay.textContent = 'Restart';
    setAudioStatus(audioQueue[audioPosition]?.title || 'Reading resumed.');
    return;
  }

  audioPlay.disabled = true;
  setAudioStatus('Preparing the manuscript…');
  try {
    const data = await loadAudioData();
    const current = currentAudioEntry(data);
    let selection;
    if (audioScope.value === 'current') {
      if (!current) {
        audioScope.value = 'full';
        selection = data;
      } else {
        selection = [current];
      }
    } else {
      selection = data;
    }

    stopAudio({ reset: false });
    const chapterTotal = selection.length;
    audioQueue = selection.flatMap((entry, chapterIndex) =>
      splitForSpeech(`${entry.t}. ${entry.x}`).map((text) => ({
        text,
        title: entry.t,
        chapterNumber: chapterIndex + 1,
        chapterTotal,
      }))
    );

    if (!audioQueue.length) throw new Error('No readable text was found');
    audioPosition = 0;
    audioIsPlaying = true;
    audioIsPaused = false;
    audioPlay.textContent = 'Restart';
    audioPause.disabled = false;
    audioStop.disabled = false;
    audioSession += 1;
    speakAudioChunk(audioSession);
  } catch (error) {
    setAudioStatus(error.message || 'The audio reader could not start.');
    resetAudioControls();
  } finally {
    audioPlay.disabled = false;
  }
}

audioPlay?.addEventListener('click', startAudio);
audioPause?.addEventListener('click', () => {
  if (!audioIsPlaying) return;
  if (audioIsPaused) {
    synth.resume();
    audioIsPaused = false;
    audioPause.textContent = 'Pause';
    setAudioStatus(audioQueue[audioPosition]?.title || 'Reading resumed.');
  } else {
    synth.pause();
    audioIsPaused = true;
    audioPause.textContent = 'Resume';
    setAudioStatus('Reading paused.');
  }
});
audioStop?.addEventListener('click', () => stopAudio());
