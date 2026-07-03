import { ipaData } from '../data/ipa.js';
import { speak } from '../utils/audio.js';

// ===== Curriculum Definition =====
export const curriculum = [
  {
    id: 1,
    title: '阶段一：常见辅音',
    subtitle: 'Plosives & Nasals',
    description: '学习英语中最基础的爆破音和鼻音',
    sounds: ['p', 'b', 't', 'd', 'k', 'ɡ', 'm', 'n'],
    icon: '💪',
    unlockRequirement: 0, // always unlocked
  },
  {
    id: 2,
    title: '阶段二：摩擦音',
    subtitle: 'Fricatives & Affricates',
    description: '掌握摩擦音和破擦音，注意清浊对比',
    sounds: ['f', 'v', 'θ', 'ð', 's', 'z', 'ʃ', 'ʒ', 'h', 'tʃ', 'dʒ'],
    icon: '🔥',
    unlockRequirement: 0.5, // 50% of previous stage
  },
  {
    id: 3,
    title: '阶段三：流音与半元音',
    subtitle: 'Liquids & Semivowels',
    description: '区分 l/r 等易混淆音，掌握半元音',
    sounds: ['l', 'r', 'j', 'w', 'ŋ'],
    icon: '🌊',
    unlockRequirement: 0.5,
  },
  {
    id: 4,
    title: '阶段四：单元音',
    subtitle: 'Monophthongs',
    description: '12个单元音，重点区分长短元音和开口度',
    sounds: ['iː', 'ɪ', 'e', 'æ', 'ɜː', 'ə', 'ʌ', 'uː', 'ʊ', 'ɔː', 'ɒ', 'ɑː'],
    icon: '🎵',
    unlockRequirement: 0.5,
  },
  {
    id: 5,
    title: '阶段五：双元音',
    subtitle: 'Diphthongs',
    description: '8个双元音，掌握滑音技巧',
    sounds: ['eɪ', 'aɪ', 'ɔɪ', 'aʊ', 'əʊ', 'ɪə', 'eə', 'ʊə'],
    icon: '🦋',
    unlockRequirement: 0.5,
  },
  {
    id: 6,
    title: '阶段六：综合实战',
    subtitle: 'Minimal Pairs',
    description: '最小对立体训练，强化辨音能力',
    sounds: [], // uses all sounds
    icon: '🎯',
    unlockRequirement: 0.6,
  },
  {
    id: 7,
    title: '阶段七：进阶应用',
    subtitle: 'Connected Speech',
    description: '连读、弱读、缩读等语流音变',
    sounds: [], // conceptual
    icon: '🏆',
    unlockRequirement: 0.7,
  },
];

// ===== Progress Storage =====
function getStageProgress(stageId) {
  return JSON.parse(localStorage.getItem(`learnyb_stage_${stageId}`) || '{}');
}

function setStageProgress(stageId, data) {
  localStorage.setItem(`learnyb_stage_${stageId}`, JSON.stringify(data));
}

function getUnlockedStage() {
  return parseInt(localStorage.getItem('learnyb_unlocked_stage') || '1');
}

function setUnlockedStage(stageId) {
  localStorage.setItem('learnyb_unlocked_stage', String(stageId));
}

function getMasteredCount() {
  return (JSON.parse(localStorage.getItem('learnyb_mastered') || '[]')).length;
}

function getTotalSoundCount() {
  let count = 0;
  for (const c of Object.values(ipaData)) {
    for (const g of c.groups) count += g.sounds.length;
  }
  return count;
}

// ===== Check & Unlock Stages =====
function checkUnlocks() {
  const masteredCount = getMasteredCount();
  const totalCount = getTotalSoundCount();
  let unlocked = getUnlockedStage();

  for (let i = 1; i < curriculum.length; i++) {
    const prevStage = curriculum[i - 1];
    const prevSounds = prevStage.sounds;
    if (prevSounds.length === 0) continue;

    const masteredInStage = prevSounds.filter(s => {
      return (JSON.parse(localStorage.getItem('learnyb_mastered') || '[]')).includes(s);
    }).length;
    const pct = masteredInStage / prevSounds.length;

    if (pct >= prevStage.unlockRequirement && i + 1 > unlocked) {
      unlocked = i + 1;
    }
  }

  setUnlockedStage(unlocked);
  return unlocked;
}

// ===== Render Learning Path =====
export function renderLearningPath() {
  const container = document.getElementById('path-content');
  if (!container) return;

  const unlocked = checkUnlocks();

  container.innerHTML = `
    <div class="path-intro">
      <h2>🎓 学习路径</h2>
      <p>按阶段循序渐进地学习音标，完成当前阶段的练习以解锁下一阶段</p>
      <div class="path-stats">
        <div class="path-stat">
          <span class="path-stat-value">${getMasteredCount()}</span>
          <span class="path-stat-label">已掌握音标</span>
        </div>
        <div class="path-stat">
          <span class="path-stat-value">${getTotalSoundCount()}</span>
          <span class="path-stat-label">总音标数</span>
        </div>
        <div class="path-stat">
          <span class="path-stat-value">${unlocked}/${curriculum.length}</span>
          <span class="path-stat-label">已解锁阶段</span>
        </div>
      </div>
    </div>

    <div class="skill-tree">
      ${curriculum.map((stage, index) => {
        const isUnlocked = stage.id <= unlocked;
        const masteredInStage = stage.sounds.length > 0
          ? stage.sounds.filter(s =>
              (JSON.parse(localStorage.getItem('learnyb_mastered') || '[]')).includes(s)
            ).length
          : 0;
        const progress = stage.sounds.length > 0
          ? Math.round((masteredInStage / stage.sounds.length) * 100)
          : 0;
        const isComplete = progress >= 80;
        const isCurrent = stage.id === unlocked;

        return `
          <div class="tree-node ${isUnlocked ? 'unlocked' : 'locked'} ${isComplete ? 'complete' : ''} ${isCurrent ? 'current' : ''}">
            <div class="tree-connector">
              ${index > 0 ? `<div class="connector-line"></div>` : ''}
            </div>
            <div class="tree-card">
              <div class="tree-icon">${isUnlocked ? stage.icon : '🔒'}</div>
              <div class="tree-number">Stage ${stage.id}</div>
              <h3 class="tree-title">${stage.title}</h3>
              <p class="tree-subtitle">${stage.subtitle}</p>
              <p class="tree-desc">${stage.description}</p>
              ${stage.sounds.length > 0 ? `
                <div class="tree-progress-bar">
                  <div class="tree-progress-fill" style="width: ${progress}%"></div>
                </div>
                <div class="tree-progress-text">${masteredInStage}/${stage.sounds.length} 个音标 (${progress}%)</div>
                <div class="tree-sounds">
                  ${stage.sounds.map(s => {
                    const m = (JSON.parse(localStorage.getItem('learnyb_mastered') || '[]')).includes(s);
                    return `<span class="tree-sound ${m ? 'mastered' : ''}">${s}</span>`;
                  }).join('')}
                </div>
              ` : `
                <div class="tree-progress-text">综合训练</div>
              `}
              ${isUnlocked ? `
                <button class="tree-action-btn ${isCurrent ? 'primary' : 'secondary'}" data-stage="${stage.id}">
                  ${isComplete ? '🔄 复习巩固' : isCurrent ? '▶ 开始学习' : '📖 查看'}
                </button>
              ` : `
                <div class="tree-locked-msg">🔒 完成前一个阶段解锁</div>
              `}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  // Wire action buttons
  container.querySelectorAll('.tree-action-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const stageId = parseInt(btn.dataset.stage);
      startStagePractice(stageId);
    });
  });
}

// ===== Stage Practice =====
function startStagePractice(stageId) {
  const stage = curriculum.find(s => s.id === stageId);
  if (!stage) return;

  const container = document.getElementById('path-content');
  const allSounds = [];
  for (const c of Object.values(ipaData)) {
    for (const g of c.groups) {
      for (const s of g.sounds) {
        allSounds.push({ ...s, type: c.title.includes('Vowels') ? 'vowel' : 'consonant' });
      }
    }
  }

  let practiceSounds;
  if (stage.sounds.length === 0) {
    // Stage 6: minimal pairs - use all sounds
    practiceSounds = allSounds;
  } else {
    practiceSounds = allSounds.filter(s => stage.sounds.includes(s.symbol));
  }

  // Generate 5-question mini quiz
  const questions = generateStageQuestions(practiceSounds, 5);

  let currentQ = 0;
  let score = 0;

  function showQuestion() {
    if (currentQ >= questions.length) {
      showStageResult();
      return;
    }

    const q = questions[currentQ];
    const correctIdx = q.options.indexOf(q.target);

    container.innerHTML = `
      <div class="stage-practice-header">
        <button class="back-btn" id="stage-back">← 返回路径</button>
        <span class="stage-progress">第 ${currentQ + 1} / ${questions.length} 题</span>
        <span class="stage-score">得分: ${score}</span>
      </div>
      <div class="quiz-card">
        <div class="quiz-header">
          <span class="quiz-progress-text">${stage.title}</span>
          <span class="quiz-timer" id="quiz-timer">⏱ 15s</span>
        </div>
        <div class="quiz-body">
          <div class="quiz-prompt">${q.type === 'see_symbol_word'
            ? `以下哪个单词包含音标 <strong style="font-size:1.3rem; font-family: 'Lucida Sans Unicode', 'Arial Unicode MS', sans-serif;">${q.target.symbol}</strong>？`
            : '请听发音，选出对应的音标'
          }</div>
          ${q.type !== 'see_symbol_word' ? `
            <button class="quiz-play-btn" id="quiz-play-btn">
              <span class="icon">🔊</span> 播放发音
            </button>
          ` : ''}
        </div>
        <div class="quiz-options">
          ${q.options.map((opt, i) => {
            const word = opt.examples[Math.floor(Math.random() * opt.examples.length)];
            opt._displayWord = word;
            return `<button class="quiz-option" data-index="${i}">${q.type === 'see_symbol_word' ? word : opt.symbol}</button>`;
          }).join('')}
        </div>
      </div>
    `;

    if (q.type !== 'see_symbol_word') {
      setTimeout(() => speak(q.target.examples[0], 0.8), 400);
      const playBtn = document.getElementById('quiz-play-btn');
      if (playBtn) {
        playBtn.addEventListener('click', () => speak(q.target.examples[0]));
      }
    }

    let timeLeft = 15;
    const timerEl = document.getElementById('quiz-timer');
    const interval = setInterval(() => {
      timeLeft--;
      if (timerEl) {
        timerEl.textContent = `⏱ ${timeLeft}s`;
        timerEl.classList.toggle('warning', timeLeft <= 5);
      }
      if (timeLeft <= 0) {
        clearInterval(interval);
        handleStageAnswer(-1, correctIdx);
      }
    }, 1000);

    container.querySelectorAll('.quiz-option').forEach(btn => {
      btn.addEventListener('click', () => {
        clearInterval(interval);
        handleStageAnswer(parseInt(btn.dataset.index), correctIdx);
      });
    });

    document.getElementById('stage-back').addEventListener('click', () => {
      clearInterval(interval);
      renderLearningPath();
    });
  }

  function handleStageAnswer(selected, correctIdx) {
    const q = questions[currentQ];
    const isCorrect = selected === correctIdx;
    if (isCorrect) score++;

    // Show all options disabled
    const allOpts = container.querySelectorAll('.quiz-option');
    allOpts.forEach(b => b.disabled = true);

    if (selected >= 0) {
      allOpts[selected].classList.add(isCorrect ? 'correct' : 'wrong');
    }
    if (!isCorrect && correctIdx >= 0) {
      allOpts[correctIdx].classList.add('reveal-correct');
    }

    // Save progress for this stage
    const prog = getStageProgress(stageId);
    prog.attempts = (prog.attempts || 0) + 1;
    prog.score = Math.max(prog.score || 0, score);
    setStageProgress(stageId, prog);

    setTimeout(() => {
      currentQ++;
      showQuestion();
    }, 1200);
  }

  function showStageResult() {
    const pct = Math.round((score / questions.length) * 100);

    container.innerHTML = `
      <div class="practice-results">
        <div class="results-score ${pct >= 80 ? 'great' : pct >= 50 ? 'ok' : 'poor'}">${pct}%</div>
        <div class="results-label">${pct >= 80 ? '太棒了！' : pct >= 50 ? '还不错，继续加油！' : '再练练，你可以的！'}</div>
        <div class="results-detail">答对 ${score} / ${questions.length} 题</div>
        <div class="results-actions">
          <button class="practice-retry-btn" id="stage-retry">🔄 再练一次</button>
          <button class="practice-retry-btn" id="stage-back-end" style="background: var(--text-secondary);">← 返回路径</button>
        </div>
      </div>
    `;

    document.getElementById('stage-retry').addEventListener('click', () => {
      currentQ = 0;
      score = 0;
      showQuestion();
    });

    document.getElementById('stage-back-end').addEventListener('click', () => {
      renderLearningPath();
    });
  }

  showQuestion();
}

function generateStageQuestions(sounds, count) {
  const pool = [...sounds];
  const questions = [];
  for (let i = 0; i < count; i++) {
    const target = pool[Math.floor(Math.random() * pool.length)];
    const type = Math.random() > 0.5 ? 'hear_symbol' : 'see_symbol_word';
    const distractors = pool.filter(s => s.symbol !== target.symbol).sort(() => Math.random() - 0.5);
    const options = [target, ...distractors.slice(0, 3)].sort(() => Math.random() - 0.5);
    questions.push({ target, type, options });
  }
  return questions;
}
