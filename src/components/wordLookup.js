import { ipaData } from '../data/ipa.js';
import { speak } from '../utils/audio.js';

// ===== Simple IPA lookup map =====
// Maps common spellings to their IPA symbols
const IPA_MAP = {
  // Long vowels
  'ee': 'iː', 'ea': 'iː', 'e_e': 'iː', 'ey': 'eɪ', 'ay': 'eɪ',
  'ie': 'aɪ', 'igh': 'aɪ', 'y': 'aɪ', 'oi': 'ɔɪ', 'oy': 'ɔɪ',
  'ow': 'aʊ', 'ou': 'aʊ', 'oo': 'uː', 'u_e': 'uː', 'ew': 'uː',
  'o_e': 'əʊ', 'oa': 'əʊ', 'ue': 'uː', 'ui': 'uː',
  'ear': 'ɪə', 'eer': 'ɪə', 'ere': 'ɪə',
  'air': 'eə', 'are': 'eə', 'ear_e': 'eə',
  'ure': 'ʊə', 'our_e': 'ʊə',

  // Short vowels
  'i': 'ɪ', 'a': 'æ', 'e': 'e', 'u': 'ʌ',
  'o': 'ɒ', 'oo_short': 'ʊ', 'ou_short': 'ʌ',
  'a_e': 'eɪ', 'i_e': 'aɪ', 'o_e': 'əʊ', 'u_e': 'juː',

  // Consonants
  'ch': 'tʃ', 'sh': 'ʃ', 'th_voiced': 'ð', 'th_voiceless': 'θ',
  'ng': 'ŋ', 'ph': 'f', 'gh_silent': '', 'gh_f': 'f',
  'ck': 'k', 'qu': 'kw', 'x': 'ks', 'g_e': 'dʒ', 'j': 'dʒ',
  's': 's', 'z': 'z', 'c_e': 's', 'c': 'k',
};

function simpleTranscribe(word) {
  const lower = word.toLowerCase();
  let result = '';
  let i = 0;

  while (i < lower.length) {
    // Try multi-char matches first
    let matched = false;

    // Check 3-char patterns
    if (i + 2 < lower.length) {
      const three = lower.substring(i, i + 3);
      const entry = Object.entries(IPA_MAP).find(([k]) => k === three || k.replace('_short', '') === three.replace('_short', ''));
      if (entry && entry[1]) {
        result += entry[1] + ' ';
        i += 3;
        matched = true;
      }
    }

    // Check 2-char patterns
    if (!matched && i + 1 < lower.length) {
      const two = lower.substring(i, i + 2);
      const thMatch = lower.substring(i, i + 2) === 'th';
      if (thMatch) {
        // Heuristic: voiced after vowels/medial
        const afterVowel = /[aeiou]/.test(result);
        const beforeVowel = i + 2 < lower.length && /[aeiou]/.test(lower[i + 2]);
        result += (beforeVowel || (!afterVowel && i > 0)) ? 'ð ' : 'θ ';
        i += 2;
        matched = true;
      } else {
        const entry = Object.entries(IPA_MAP).find(([k]) => k === two);
        if (entry && entry[1]) {
          result += entry[1] + ' ';
          i += 2;
          matched = true;
        }
      }
    }

    // Single char
    if (!matched) {
      const ch = lower[i];
      const singleMap = {
        'a': /[aeiou]/.test(lower.substring(i + 1, i + 2)) ? 'eɪ' : 'æ',
        'e': /[aeiou]/.test(lower.substring(i + 1, i + 2)) ? 'iː' : 'e',
        'i': /[aeiou]/.test(lower.substring(i + 1, i + 2)) ? 'aɪ' : 'ɪ',
        'o': /[aeiou]/.test(lower.substring(i + 1, i + 2)) ? 'əʊ' : 'ɒ',
        'u': /[aeiou]/.test(lower.substring(i + 1, i + 2)) ? 'juː' : 'ʌ',
        'p': 'p', 'b': 'b', 't': 't', 'd': 'd',
        'k': 'k', 'g': 'ɡ', 'f': 'f', 'v': 'v',
        's': 's', 'z': 'z', 'h': 'h',
        'm': 'm', 'n': 'n', 'l': 'l', 'r': 'r', 'w': 'w',
        'y': 'j',
      };
      if (singleMap[ch]) {
        result += singleMap[ch] + ' ';
      }
      i++;
    }
  }

  return result.trim().split(/\s+/).filter(Boolean);
}

// ===== Find sound by symbol =====
function findSound(symbol) {
  for (const c of Object.values(ipaData)) {
    for (const g of c.groups) {
      for (const s of g.sounds) {
        if (s.symbol === symbol) return s;
      }
    }
  }
  return null;
}

// ===== Search History =====
function getSearchHistory() {
  return JSON.parse(localStorage.getItem('learnyb_search_history') || '[]');
}

function addToSearchHistory(word) {
  const history = getSearchHistory().filter(w => w !== word);
  history.unshift(word);
  if (history.length > 20) history.pop();
  localStorage.setItem('learnyb_search_history', JSON.stringify(history));
}

// ===== Render Word Lookup =====
export function renderWordLookup() {
  const container = document.getElementById('lookup-content');
  if (!container) return;

  const history = getSearchHistory();

  container.innerHTML = `
    <div class="lookup-card">
      <div class="lookup-header">
        <h3>🔍 单词音标查询</h3>
        <p class="lookup-hint">输入英文单词，查看音标拆分和每个音标对应的发音技巧</p>
      </div>

      <div class="lookup-input-row">
        <input type="text" id="lookup-input" class="lookup-input" placeholder="输入单词，如：beautiful" autocomplete="off" />
        <button class="lookup-search-btn" id="lookup-search-btn">查询</button>
        <button class="lookup-play-btn" id="lookup-play-btn" title="播放发音">🔊</button>
      </div>

      <div class="lookup-history" id="lookup-history">
        ${history.length > 0 ? `
          <div class="history-header">
            <span>搜索历史</span>
            <button class="clear-history-btn" id="clear-history">清空</button>
          </div>
          <div class="history-tags">
            ${history.map(w => `<button class="history-tag" data-word="${w}">${w}</button>`).join('')}
          </div>
        ` : ''}
      </div>

      <div id="lookup-result"></div>
    </div>
  `;

  const input = document.getElementById('lookup-input');
  const searchBtn = document.getElementById('lookup-search-btn');
  const playBtn = document.getElementById('lookup-play-btn');
  let currentWord = '';

  function doSearch() {
    const word = input.value.trim().toLowerCase();
    if (!word) return;
    currentWord = word;
    addToSearchHistory(word);
    showResult(word);
    renderWordLookup(); // re-render to update history
    input.value = word;
  }

  searchBtn.addEventListener('click', doSearch);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') doSearch();
  });

  playBtn.addEventListener('click', () => {
    if (currentWord) speak(currentWord);
  });

  // History tag clicks
  container.querySelectorAll('.history-tag').forEach(tag => {
    tag.addEventListener('click', () => {
      currentWord = tag.dataset.word;
      input.value = tag.dataset.word;
      showResult(tag.dataset.word);
    });
  });

  // Clear history
  const clearBtn = document.getElementById('clear-history');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      localStorage.removeItem('learnyb_search_history');
      renderWordLookup();
    });
  }
}

function showResult(word) {
  const resultEl = document.getElementById('lookup-result');
  if (!resultEl) return;

  const symbols = simpleTranscribe(word);
  const matchedSounds = symbols.map(sym => findSound(sym)).filter(Boolean);
  const hasIPA = matchedSounds.length > 0;

  resultEl.innerHTML = `
    <div class="lookup-result-inner">
      <div class="result-word-row">
        <span class="result-word">${word}</span>
        <span class="result-ipa">[${symbols.join('')}]</span>
      </div>

      ${hasIPA ? `
        <div class="result-breakdown">
          <h4>音标拆分</h4>
          <div class="breakdown-list">
            ${matchedSounds.map(s => `
              <div class="breakdown-item">
                <span class="breakdown-symbol">${s.symbol}</span>
                <div class="breakdown-info">
                  <div class="breakdown-name">${s.name}</div>
                  <div class="breakdown-tip">${s.tip}</div>
                </div>
                <button class="breakdown-play" data-word="${s.examples[0]}" title="听发音">🔊</button>
              </div>
            `).join('')}
          </div>
        </div>
      ` : `
        <div class="result-no-ipa">
          <p>暂未收录该单词的音标数据，试试其他单词吧</p>
          <button class="lookup-play-btn" id="fallback-play">🔊 播放发音</button>
        </div>
      `}
    </div>
  `;

  // Wire breakdown play buttons
  resultEl.querySelectorAll('.breakdown-play').forEach(btn => {
    btn.addEventListener('click', () => speak(btn.dataset.word));
  });

  // Fallback play
  const fallbackBtn = document.getElementById('fallback-play');
  if (fallbackBtn) {
    fallbackBtn.addEventListener('click', () => speak(word));
  }
}
