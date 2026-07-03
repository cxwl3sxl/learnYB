import { ipaData } from '../data/ipa.js';
import { speak } from '../utils/audio.js';

// ===== Build flat sound list =====
function getAllSounds() {
  const sounds = [];
  for (const cat of Object.values(ipaData)) {
    for (const group of cat.groups) {
      for (const s of group.sounds) {
        sounds.push({ ...s, type: cat.title.includes('Vowels') ? 'vowel' : 'consonant' });
      }
    }
  }
  return sounds;
}

const ALL_SOUNDS = getAllSounds();

// ===== Sound type groups for filter =====
const FILTER_GROUPS = [
  { key: 'all', label: '全部' },
  { key: 'monophthongs', label: '单元音' },
  { key: 'diphthongs', label: '双元音' },
  { key: 'plosives', label: '爆破音' },
  { key: 'fricatives', label: '摩擦音' },
  { key: 'others', label: '其他辅音' },
];

function getSoundsByFilter(filterKey) {
  if (filterKey === 'all') return ALL_SOUNDS;
  if (filterKey === 'monophthongs') {
    return ALL_SOUNDS.filter(s => s.symbol.match(/^[iɪeæɜəʌuʊɔɒɑː]+$/));
  }
  if (filterKey === 'diphthongs') {
    return ALL_SOUNDS.filter(s => s.symbol.length > 1 || s.examples[0].length > 3);
  }
  if (filterKey === 'plosives') {
    return ALL_SOUNDS.filter(s => ['p','b','t','d','k','ɡ'].includes(s.symbol));
  }
  if (filterKey === 'fricatives') {
    return ALL_SOUNDS.filter(s => ['f','v','θ','ð','s','z','ʃ','ʒ','h','tʃ','dʒ'].includes(s.symbol));
  }
  return ALL_SOUNDS.filter(s => ['m','n','ŋ','l','r','j','w'].includes(s.symbol));
}

// ===== Quiz Engine =====
const QUIZ_TYPES = {
  hear_symbol: '听音辨音标',
  hear_word: '听音选单词',
  see_symbol_word: '看音标选单词',
};

function generateQuestions(sounds, count = 10) {
  const pool = [...sounds];
  const questions = [];

  for (let i = 0; i < count; i++) {
    const target = pool[Math.floor(Math.random() * pool.length)];
    const typeKeys = Object.keys(QUIZ_TYPES);
    const type = typeKeys[Math.floor(Math.random() * typeKeys.length)];

    // Generate 4 options: 1 correct + 3 distractors
    const distractors = pool.filter(s => s.symbol !== target.symbol);
    const shuffled = distractors.sort(() => Math.random() - 0.5);
    const options = [target, ...shuffled.slice(0, 3)].sort(() => Math.random() - 0.5);

    questions.push({ target, type, options });
  }
  return questions;
}

// ===== Practice State =====
let practiceState = {
  filterKey: 'all',
  questions: [],
  currentIndex: 0,
  score: 0,
  answers: [], // { question, selected, correct, isCorrect }
  timerInterval: null,
  timeLeft: 10,
  answered: false,
};

// ===== Render Practice =====
export function renderPractice() {
  const container = document.getElementById('practice-content');
  container.innerHTML = `
    <div class="practice-setup" id="practice-setup">
      <h3>选择练习范围</h3>
      <p>选择你想练习的音标类型，系统会随机出题</p>
      <div class="practice-filter" id="practice-filter"></div>
      <button class="practice-start-btn" id="practice-start" disabled>
        <span class="icon">🎯</span> 开始练习（10 题）
      </button>
    </div>
    <div id="practice-quiz" style="display:none;"></div>
  `;

  // Filter buttons
  const filterEl = document.getElementById('practice-filter');
  FILTER_GROUPS.forEach(g => {
    const btn = document.createElement('button');
    btn.className = `filter-btn${g.key === 'all' ? ' active' : ''}`;
    btn.textContent = g.label;
    btn.dataset.filter = g.key;
    btn.addEventListener('click', () => {
      filterEl.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      practiceState.filterKey = g.key;
      document.getElementById('practice-start').disabled = false;
    });
    filterEl.appendChild(btn);
  });

  document.getElementById('practice-start').addEventListener('click', startPractice);
}

function startPractice() {
  const sounds = getSoundsByFilter(practiceState.filterKey);
  if (sounds.length < 4) {
    alert('该分类音标太少，请选择其他分类');
    return;
  }

  practiceState = {
    filterKey: practiceState.filterKey,
    questions: generateQuestions(sounds, 10),
    currentIndex: 0,
    score: 0,
    answers: [],
    timerInterval: null,
    timeLeft: 10,
    answered: false,
  };

  document.getElementById('practice-setup').style.display = 'none';
  renderQuizQuestion();
}

function renderQuizQuestion() {
  const container = document.getElementById('practice-quiz');
  const { questions, currentIndex } = practiceState;
  const q = questions[currentIndex];
  const progress = `${currentIndex + 1} / ${questions.length}`;

  let promptHTML = '';
  let optionsHTML = '';

  if (q.type === 'hear_symbol') {
    promptHTML = `
      <div class="quiz-prompt">请听发音，选出对应的音标</div>
      <button class="quiz-play-btn" id="quiz-play-btn">
        <span class="icon">🔊</span> 播放发音
      </button>
    `;
    optionsHTML = q.options.map((opt, i) => `
      <button class="quiz-option" data-index="${i}">${opt.symbol}</button>
    `).join('');
  } else if (q.type === 'hear_word') {
    promptHTML = `
      <div class="quiz-prompt">请听发音，选出对应的单词</div>
      <button class="quiz-play-btn" id="quiz-play-btn">
        <span class="icon">🔊</span> 播放发音
      </button>
    `;
    optionsHTML = q.options.map((opt, i) => {
      const word = opt.examples[Math.floor(Math.random() * opt.examples.length)];
      opt._displayWord = word;
      return `<button class="quiz-option" data-index="${i}">${word}</button>`;
    }).join('');
  } else {
    promptHTML = `
      <div class="quiz-prompt">以下哪个单词包含音标 <strong style="font-size:1.3rem; font-family: 'Lucida Sans Unicode', 'Arial Unicode MS', sans-serif;">${q.target.symbol}</strong>？</div>
    `;
    optionsHTML = q.options.map((opt, i) => {
      const word = opt.examples[Math.floor(Math.random() * opt.examples.length)];
      opt._displayWord = word;
      return `<button class="quiz-option" data-index="${i}">${word}</button>`;
    }).join('');
  }

  const correctIndex = q.options.indexOf(q.target);

  container.innerHTML = `
    <div class="quiz-card">
      <div class="quiz-header">
        <span class="quiz-progress-text">${progress}</span>
        <span class="quiz-timer" id="quiz-timer">⏱ ${practiceState.timeLeft}s</span>
      </div>
      <div class="quiz-body">
        ${promptHTML}
      </div>
      <div class="quiz-options">
        ${optionsHTML}
      </div>
    </div>
  `;

  if (q.type !== 'see_symbol_word') {
    setTimeout(() => {
      const word = q.target.examples[Math.floor(Math.random() * q.target.examples.length)];
      speak(word, 0.8);
    }, 400);
  }

  const playBtn = document.getElementById('quiz-play-btn');
  if (playBtn) {
    playBtn.addEventListener('click', () => {
      const word = q.target.examples[Math.floor(Math.random() * q.target.examples.length)];
      speak(word);
    });
  }

  const quizContainer = document.getElementById('practice-quiz');
  quizContainer.querySelectorAll('.quiz-option').forEach(btn => {
    btn.addEventListener('click', () => handleAnswer(parseInt(btn.dataset.index), correctIndex));
  });

  practiceState.answered = false;
  practiceState.timeLeft = 10;
  updateTimerDisplay();

  clearInterval(practiceState.timerInterval);
  practiceState.timerInterval = setInterval(() => {
    practiceState.timeLeft--;
    updateTimerDisplay();

    if (practiceState.timeLeft <= 0) {
      clearInterval(practiceState.timerInterval);
      handleTimeout(correctIndex);
    }
  }, 1000);
}

function updateTimerDisplay() {
  const timerEl = document.getElementById('quiz-timer');
  if (!timerEl) return;
  timerEl.textContent = `⏱ ${practiceState.timeLeft}s`;
  timerEl.classList.toggle('warning', practiceState.timeLeft <= 3);
}

function handleAnswer(selectedIndex, correctIndex) {
  if (practiceState.answered) return;
  practiceState.answered = true;
  clearInterval(practiceState.timerInterval);

  const isCorrect = selectedIndex === correctIndex;
  const q = practiceState.questions[practiceState.currentIndex];

  practiceState.answers.push({
    question: q,
    selected: q.options[selectedIndex],
    correct: q.options[correctIndex],
    isCorrect,
  });

  if (isCorrect) practiceState.score++;

  const quizContainer = document.getElementById('practice-quiz');
  const allOptions = quizContainer.querySelectorAll('.quiz-option');

  allOptions[selectedIndex].classList.add(isCorrect ? 'correct' : 'wrong');

  if (!isCorrect) {
    allOptions.forEach(b => {
      if (parseInt(b.dataset.index) === correctIndex) {
        b.classList.add('reveal-correct');
      }
      b.disabled = true;
    });
  } else {
    allOptions.forEach(b => b.disabled = true);
  }

  setTimeout(() => {
    practiceState.currentIndex++;
    if (practiceState.currentIndex < practiceState.questions.length) {
      practiceState.timeLeft = 10;
      renderQuizQuestion();
    } else {
      renderResults();
    }
  }, 1200);
}

function handleTimeout(correctIndex) {
  practiceState.answered = true;
  const q = practiceState.questions[practiceState.currentIndex];

  practiceState.answers.push({
    question: q,
    selected: null,
    correct: q.options[correctIndex],
    isCorrect: false,
  });

  const quizContainer = document.getElementById('practice-quiz');
  quizContainer.querySelectorAll('.quiz-option').forEach(b => {
    if (parseInt(b.dataset.index) === correctIndex) {
      b.classList.add('reveal-correct');
    }
    b.disabled = true;
  });

  setTimeout(() => {
    practiceState.currentIndex++;
    if (practiceState.currentIndex < practiceState.questions.length) {
      practiceState.timeLeft = 10;
      renderQuizQuestion();
    } else {
      renderResults();
    }
  }, 1500);
}

function renderResults() {
  const container = document.getElementById('practice-quiz');
  const { score, answers, questions } = practiceState;
  const pct = Math.round((score / questions.length) * 100);

  let scoreClass = 'great';
  let label = '太棒了！';
  if (pct < 60) { scoreClass = 'poor'; label = '继续加油！'; }
  else if (pct < 80) { scoreClass = 'ok'; label = '还不错，再练练！'; }

  let barColor = '#22c55e';
  if (pct < 60) barColor = '#ef4444';
  else if (pct < 80) barColor = '#f59e0b';

  container.innerHTML = `
    <div class="practice-results">
      <div class="results-score ${scoreClass}">${pct}%</div>
      <div class="results-label">${label}</div>
      <div class="results-bar">
        <div class="results-bar-fill" style="width: 0%; background: ${barColor};" data-width="${pct}%"></div>
      </div>
      <div class="results-detail">答对 ${score} / ${questions.length} 题</div>

      <div class="results-review">
        <h3>📝 答题回顾</h3>
        ${answers.map(a => {
          const sym = a.question.target.symbol;
          const word = a.question.target.examples[0];
          const displayWord = a.question.type === 'hear_symbol' ? sym :
            (a.selected ? a.selected._displayWord : '（超时）');
          const correctWord = a.question.type === 'hear_symbol' ? sym :
            a.correct._displayWord;
          return `
            <div class="review-item ${a.isCorrect ? 'correct' : 'wrong'}">
              <span class="review-icon">${a.isCorrect ? '✅' : '❌'}</span>
              <span class="review-symbol">${sym}</span>
              <span class="review-words">
                例词: ${word}
                ${a.isCorrect
                  ? ''
                  : `<br><span class="review-answer wrong">你选: ${displayWord} → 正确答案: ${correctWord}</span>`
                }
              </span>
            </div>
          `;
        }).join('')}
      </div>

      <button class="practice-retry-btn" id="practice-retry">
        🔄 再练一次
      </button>
    </div>
  `;

  // Animate bar
  setTimeout(() => {
    const bar = container.querySelector('.results-bar-fill');
    if (bar) bar.style.width = bar.dataset.width;
  }, 100);

  document.getElementById('practice-retry').addEventListener('click', () => {
    document.getElementById('practice-quiz').style.display = 'none';
    document.getElementById('practice-setup').style.display = 'block';
    practiceState = { ...practiceState, questions: [], currentIndex: 0, score: 0, answers: [] };
    renderPractice();
  });
}
