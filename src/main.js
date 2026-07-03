import { ipaData } from './data/ipa.js';
import { createSoundCard } from './components/soundCard.js';
import { renderPractice } from './components/practice.js';
import { speak, stopAudio } from './utils/audio.js';

// ===== App State =====
const state = {
  currentSound: null,
  mastered: JSON.parse(localStorage.getItem('learnyb_mastered') || '[]'),
  attempts: JSON.parse(localStorage.getItem('learnyb_attempts') || '{}'),
};

function saveState() {
  localStorage.setItem('learnyb_mastered', JSON.stringify(state.mastered));
  localStorage.setItem('learnyb_attempts', JSON.stringify(state.attempts));
}

// ===== Tab Switching =====
const navLinks = document.querySelectorAll('.nav-link');
const panels = document.querySelectorAll('.tab-panel');

navLinks.forEach(link => {
  link.addEventListener('click', () => {
    navLinks.forEach(l => l.classList.remove('active'));
    panels.forEach(p => p.classList.remove('active'));
    link.classList.add('active');
    document.getElementById(`tab-${link.dataset.tab}`).classList.add('active');
  });
});

// ===== Detail Modal =====
const modal = document.getElementById('detail-modal');

function openModal(sound, type) {
  state.currentSound = sound;
  document.getElementById('modal-symbol').textContent = sound.symbol;
  document.getElementById('modal-name').textContent = sound.name;
  document.getElementById('modal-tip').textContent = sound.tip;

  const examplesEl = document.getElementById('modal-examples');
  examplesEl.innerHTML = '';
  sound.examples.forEach(word => {
    const btn = document.createElement('button');
    btn.className = 'example-word';
    btn.textContent = word;
    btn.addEventListener('click', () => speak(word));
    examplesEl.appendChild(btn);
  });

  modal.classList.add('active');

  // Auto-play
  setTimeout(() => {
    speak(sound.examples[0]);
    // Animate waveform
    animateWaveform();
  }, 300);
}

function closeModal() {
  modal.classList.remove('active');
  stopAudio();
  state.currentSound = null;
}

document.getElementById('modal-close').addEventListener('click', closeModal);
modal.addEventListener('click', (e) => {
  if (e.target === modal) closeModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

document.getElementById('modal-play-btn').addEventListener('click', () => {
  if (state.currentSound) {
    speak(state.currentSound.examples[0]);
    animateWaveform();
  }
});

// ===== Waveform Animation =====
function animateWaveform() {
  const container = document.querySelector('.waveform-container');
  if (!container) return;
  container.innerHTML = '';
  const barCount = 40;
  for (let i = 0; i < barCount; i++) {
    const bar = document.createElement('span');
    bar.className = 'waveform-bar';
    bar.style.height = '4px';
    container.appendChild(bar);
  }
  const bars = container.querySelectorAll('.waveform-bar');
  let frame = 0;
  const totalFrames = 60;

  function tick() {
    frame++;
    bars.forEach((bar, i) => {
      const phase = (frame + i * 3) / totalFrames * Math.PI * 2;
      const envelope = Math.sin(phase) * 0.5 + 0.5;
      const noise = Math.random() * 0.3;
      const h = Math.max(4, (envelope + noise) * 30);
      bar.style.height = `${h}px`;
      bar.style.opacity = 0.4 + envelope * 0.6;
    });
    if (frame < totalFrames) {
      requestAnimationFrame(tick);
    } else {
      bars.forEach(b => { b.style.height = '4px'; b.style.opacity = 0.3; });
    }
  }
  requestAnimationFrame(tick);
}

// ===== Render Chart =====
function renderChart() {
  const container = document.getElementById('chart-content');
  container.innerHTML = '';

  for (const [typeKey, category] of Object.entries(ipaData)) {
    const card = document.createElement('div');
    card.className = 'category-card';

    const heading = document.createElement('h2');
    heading.textContent = category.title;
    card.appendChild(heading);

    for (const group of category.groups) {
      const groupLabel = document.createElement('h3');
      groupLabel.style.cssText = 'font-size: 0.85rem; color: var(--text-secondary); margin: 16px 0 10px; font-weight: 500;';
      groupLabel.textContent = group.name;
      card.appendChild(groupLabel);

      const grid = document.createElement('div');
      grid.className = 'ipa-grid';

      group.sounds.forEach(sound => {
        const el = createSoundCard(sound, typeKey);

        // Click: open detail + speak
        el.addEventListener('click', () => {
          document.querySelectorAll('.sound-card').forEach(c => c.classList.remove('playing'));
          el.classList.add('playing');
          setTimeout(() => el.classList.remove('playing'), 800);
          openModal(sound, typeKey);
        });

        // Hover: quick preview
        el.addEventListener('mouseenter', () => {
          if (!modal.classList.contains('active')) {
            speak(sound.examples[0], 0.9);
          }
        });

        // Mark as mastered
        el.addEventListener('dblclick', (e) => {
          e.stopPropagation();
          toggleMastered(sound.symbol, el);
        });

        grid.appendChild(el);
      });

      card.appendChild(grid);
    }

    container.appendChild(card);
  }
}

function toggleMastered(symbol, cardEl) {
  const idx = state.mastered.indexOf(symbol);
  if (idx >= 0) {
    state.mastered.splice(idx, 1);
    cardEl.classList.remove('mastered');
  } else {
    state.mastered.push(symbol);
    cardEl.classList.add('mastered');
  }
  saveState();
  renderProgress();
}

// ===== Render Contrast =====
function renderContrast() {
  const container = document.getElementById('contrast-content');
  container.innerHTML = '';

  const pairs = [
    { label: '长元音 vs 短元音', pairs: [
      ['iː', 'ɪ', 'sheep/ship', 'sea/sit'],
      ['uː', 'ʊ', 'food/book', 'moon/pull'],
      ['ɜː', 'ə', 'bird/about', 'nurse/banana'],
    ]},
    { label: '清辅音 vs 浊辅音', pairs: [
      ['p', 'b', 'pen/book', 'pig/bag'],
      ['t', 'd', 'tea/dog', 'stop/did'],
      ['k', 'ɡ', 'cat/go', 'back/girl'],
      ['f', 'v', 'fish/very', 'five/love'],
      ['θ', 'ð', 'think/this', 'three/mother'],
      ['s', 'z', 'sun/zoo', 'is/buzz'],
      ['ʃ', 'ʒ', 'ship/vision', 'fish/pleasure'],
      ['tʃ', 'dʒ', 'chair/job', 'catch/orange'],
    ]},
    { label: '容易混淆的音', pairs: [
      ['l', 'r', 'love/red', 'let/run'],
      ['n', 'ŋ', 'no/sing', 'net/ring'],
      ['e', 'ɪ', 'bed/big', 'pen/pig'],
      ['æ', 'e', 'cat/bed', 'apple/pen'],
      ['ʌ', 'ɒ', 'cup/hot', 'bus/stop'],
    ]},
  ];

  pairs.forEach(group => {
    const groupCard = document.createElement('div');
    groupCard.className = 'category-card';

    const title = document.createElement('h2');
    title.textContent = group.label;
    groupCard.appendChild(title);

    const contrastWrap = document.createElement('div');
    contrastWrap.className = 'contrast-pair';

    group.pairs.forEach(([sym1, sym2, ex1, ex2]) => {
      const item = document.createElement('div');
      item.className = 'contrast-item';
      item.innerHTML = `
        <div class="contrast-symbol">${sym1}</div>
        <div class="contrast-label">${ex1}</div>
        <div style="text-align:center; margin-top:6px;">
          <button class="modal-play-btn" style="padding:8px 16px; font-size:0.85rem;">🔊 听</button>
        </div>
      `;
      const btn = item.querySelector('button');
      const words1 = ex1.split('/');
      let toggle = false;
      btn.addEventListener('click', () => {
        toggle = !toggle;
        speak(words1[toggle ? 1 : 0]);
      });
      contrastWrap.appendChild(item);

      const item2 = document.createElement('div');
      item2.className = 'contrast-item';
      item2.innerHTML = `
        <div class="contrast-symbol">${sym2}</div>
        <div class="contrast-label">${ex2}</div>
        <div style="text-align:center; margin-top:6px;">
          <button class="modal-play-btn" style="padding:8px 16px; font-size:0.85rem;">🔊 听</button>
        </div>
      `;
      const btn2 = item2.querySelector('button');
      const words2 = ex2.split('/');
      let toggle2 = false;
      btn2.addEventListener('click', () => {
        toggle2 = !toggle2;
        speak(words2[toggle2 ? 1 : 0]);
      });
      contrastWrap.appendChild(item2);
    });

    groupCard.appendChild(contrastWrap);
    container.appendChild(groupCard);
  });
}

// ===== Render Progress =====
function renderProgress() {
  const container = document.getElementById('progress-content');
  const total = [];
  for (const c of Object.values(ipaData)) {
    for (const g of c.groups) total.push(...g.sounds);
  }
  const masteredCount = state.mastered.length;
  const pct = total.length > 0 ? Math.round((masteredCount / total.length) * 100) : 0;

  container.innerHTML = `
    <div class="category-card" style="text-align:center;">
      <div style="font-size:3rem; font-weight:700; color: var(--primary);">${pct}%</div>
      <div style="color: var(--text-secondary); margin-bottom: 8px;">已完成 ${masteredCount} / ${total.length} 个音标</div>
      <div style="background: var(--bg); height: 12px; border-radius: 6px; overflow: hidden; max-width: 400px; margin: 0 auto;">
        <div style="background: var(--primary); height: 100%; width: ${pct}%; border-radius: 6px; transition: width 0.5s;"></div>
      </div>
      <p style="font-size:0.85rem; color: var(--text-secondary); margin-top: 16px;">
        在音标表中双击卡片可标记为已掌握
      </p>
    </div>
    <div class="category-card">
      <h2>已掌握的音标</h2>
      <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px;">
        ${state.mastered.length === 0
          ? '<span style="color: var(--text-secondary);">还没有标记任何音标，去音标表双击开始吧！</span>'
          : state.mastered.map(s => `<span style="font-size:1.5rem; background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 4px 12px;">${s}</span>`).join('')
        }
      </div>
    </div>
    <div class="category-card">
      <h2>待学习清单</h2>
      <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px;">
        ${total.filter(s => !state.mastered.includes(s.symbol)).map(s => `<span style="font-size:1.3rem; background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 4px 12px; color: #991b1b;">${s.symbol}</span>`).join('')}
      </div>
    </div>
  `;
}

// ===== Init =====
renderChart();
renderContrast();
renderPractice();
renderProgress();
