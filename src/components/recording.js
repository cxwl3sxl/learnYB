import { speak } from '../utils/audio.js';

// ===== Recording State =====
let recordingState = {
  mediaRecorder: null,
  audioChunks: [],
  audioBlob: null,
  audioUrl: null,
  analyser: null,
  animFrameId: null,
  isRecording: false,
  history: JSON.parse(localStorage.getItem('learnyb_recording_history') || '[]'),
  currentWord: '',
};

function saveHistory() {
  localStorage.setItem('learnyb_recording_history', JSON.stringify(recordingState.history));
}

// ===== Request Mic & Start Recording =====
async function startRecording(canvas) {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);

    recordingState.analyser = analyser;
    recordingState.mediaRecorder = new MediaRecorder(stream);
    recordingState.audioChunks = [];
    recordingState.isRecording = true;

    recordingState.mediaRecorder.ondataavailable = (e) => {
      recordingState.audioChunks.push(e.data);
    };

    recordingState.mediaRecorder.onstop = () => {
      recordingState.audioBlob = new Blob(recordingState.audioChunks, { type: 'audio/webm' });
      recordingState.audioUrl = URL.createObjectURL(recordingState.audioBlob);
      stream.getTracks().forEach(t => t.stop());
      audioCtx.close();
      stopWaveformAnimation(canvas);
      onRecordingComplete(canvas);
    };

    recordingState.mediaRecorder.start();
    startWaveformAnimation(canvas);
    updateRecordingUI(true);

  } catch (err) {
    alert('无法访问麦克风，请检查权限设置。\n' + err.message);
  }
}

function stopRecording() {
  if (recordingState.mediaRecorder && recordingState.mediaRecorder.state !== 'inactive') {
    recordingState.mediaRecorder.stop();
    recordingState.isRecording = false;
    updateRecordingUI(false);
  }
}

// ===== Waveform Animation =====
function startWaveformAnimation(canvas) {
  const analyser = recordingState.analyser;
  const ctx = canvas.getContext('2d');
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  const dpr = window.devicePixelRatio || 1;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
  }
  resize();
  window.addEventListener('resize', resize);

  function draw() {
    recordingState.animFrameId = requestAnimationFrame(draw);
    analyser.getByteTimeDomainData(dataArray);

    const w = canvas.width / dpr;
    const h = canvas.height / dpr;

    ctx.clearRect(0, 0, w, h);

    // Background
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, w, h);

    // Center line
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2);
    ctx.stroke();

    // Waveform
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = recordingState.isRecording ? '#ef4444' : '#4f46e5';
    ctx.shadowColor = recordingState.isRecording ? 'rgba(239,68,68,0.3)' : 'rgba(79,70,229,0.3)';
    ctx.shadowBlur = 6;
    ctx.beginPath();

    const sliceWidth = w / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0;
      const y = (v * h) / 2;

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);

      x += sliceWidth;
    }

    ctx.lineTo(w, h / 2);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Recording indicator
    if (recordingState.isRecording) {
      const time = Date.now() / 500;
      const alpha = 0.3 + Math.sin(time) * 0.3;
      ctx.fillStyle = `rgba(239, 68, 68, ${alpha})`;
      ctx.beginPath();
      ctx.arc(20, 20, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ef4444';
      ctx.font = '13px -apple-system, sans-serif';
      ctx.fillText('● 录音中...', 34, 25);
    }
  }

  draw();

  // Store cleanup reference
  recordingState._cleanup = () => window.removeEventListener('resize', resize);
}

function stopWaveformAnimation(canvas) {
  if (recordingState.animFrameId) {
    cancelAnimationFrame(recordingState.animFrameId);
    recordingState.animFrameId = null;
  }
  if (recordingState._cleanup) {
    recordingState._cleanup();
    recordingState._cleanup = null;
  }
}

// ===== UI Helpers =====
function updateRecordingUI(isRecording) {
  const btn = document.getElementById('record-btn');
  if (!btn) return;
  if (isRecording) {
    btn.innerHTML = '<span class="icon">⏹</span> 停止录音';
    btn.className = 'record-btn recording';
  } else {
    btn.innerHTML = '<span class="icon">🎤</span> 点击开始录音';
    btn.className = 'record-btn';
  }
}

async function onRecordingComplete(canvas) {
  const playUserBtn = document.getElementById('play-user-btn');
  const compareBtn = document.getElementById('compare-btn');
  const word = recordingState.currentWord;

  if (playUserBtn) {
    playUserBtn.style.display = 'inline-flex';
    playUserBtn.onclick = () => {
      if (recordingState.audioUrl) {
        const audio = new Audio(recordingState.audioUrl);
        audio.play();
      }
    };
  }

  if (compareBtn) {
    compareBtn.style.display = 'inline-flex';
    compareBtn.onclick = async () => {
      // Draw static waveform from recorded audio
      drawStaticWaveform(canvas);
      // Play standard then user recording
      await speak(word);
      await new Promise(r => setTimeout(r, 800));
      if (recordingState.audioUrl) {
        const audio = new Audio(recordingState.audioUrl);
        await audio.play();
      }
    };
  }

  // Try speech recognition
  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    const resultEl = document.getElementById('recognition-result');
    if (resultEl) {
      resultEl.style.display = 'block';
      resultEl.textContent = '🎧 正在识别你的发音...';
    }

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      const expected = word.toLowerCase();
      const isMatch = transcript === expected;

      if (resultEl) {
        resultEl.className = `recognition-result ${isMatch ? 'match' : 'mismatch'}`;
        resultEl.innerHTML = isMatch
          ? `✅ 识别结果：<strong>"${transcript}"</strong> — 发音准确！`
          : `⚠️ 识别结果：<strong>"${transcript}"</strong> — 期望：<strong>"${expected}"</strong>，再练练！`;
      }

      // Save to history
      recordingState.history.unshift({
        word,
        transcript,
        expected,
        match: isMatch,
        time: new Date().toISOString(),
      });
      if (recordingState.history.length > 50) recordingState.history.pop();
      saveHistory();
      renderRecordingHistory();
    };

    recognition.onerror = () => {
      if (resultEl) {
        resultEl.style.display = 'block';
        resultEl.className = 'recognition-result mismatch';
        resultEl.textContent = '⚠️ 语音识别暂时不可用，请尝试再次录音';
      }
    };

    recognition.start();
  }
}

function drawStaticWaveform(canvas) {
  if (!recordingState.audioBlob) return;
  const reader = new FileReader();
  reader.onload = async () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const arrayBuffer = await audioCtx.decodeAudioData(reader.result);
      const data = arrayBuffer.getChannelData(0);
      const ctx = canvas.getContext('2d');
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = '#818cf8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();

      const step = Math.ceil(data.length / w);
      const amp = h / 2;

      for (let i = 0; i < w; i++) {
        let min = 1.0, max = -1.0;
        for (let j = 0; j < step; j++) {
          const datum = data[(i * step) + j] || 0;
          if (datum < min) min = datum;
          if (datum > max) max = datum;
        }
        ctx.moveTo(i, (1 + min) * amp);
        ctx.lineTo(i, (1 + max) * amp);
      }
      ctx.stroke();
      audioCtx.close();
    } catch (e) {
      // Silently fail for static waveform
    }
  };
  reader.readAsArrayBuffer(recordingState.audioBlob);
}

// ===== Recording History =====
function renderRecordingHistory() {
  const container = document.getElementById('recording-history');
  if (!container) return;

  if (recordingState.history.length === 0) {
    container.innerHTML = '<p style="color: var(--text-secondary); font-size: 0.9rem;">还没有录音记录，开始练习吧！</p>';
    return;
  }

  container.innerHTML = recordingState.history.slice(0, 10).map(h => {
    const date = new Date(h.time);
    const timeStr = `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
    return `
      <div class="history-item ${h.match ? 'match' : 'mismatch'}">
        <span class="history-icon">${h.match ? '✅' : '⚠️'}</span>
        <span class="history-word">${h.word}</span>
        <span class="history-transcript">"${h.transcript}"</span>
        <span class="history-time">${timeStr}</span>
      </div>
    `;
  }).join('');
}

// ===== Export =====
export function renderRecording() {
  const container = document.getElementById('recording-content');
  if (!container) return;

  const words = ['sheep', 'ship', 'think', 'this', 'food', 'book', 'red', 'led',
    'cat', 'cut', 'pen', 'pan', 'light', 'right', 'sing', 'sin'];

  container.innerHTML = `
    <div class="recording-card">
      <div class="recording-section">
        <h3>第一步：听标准发音</h3>
        <p class="recording-hint">选择单词，先听标准发音，然后跟读录音</p>
        <div class="word-selector" id="word-selector">
          ${words.map(w => `<button class="word-chip" data-word="${w}">${w}</button>`).join('')}
        </div>
        <button class="practice-start-btn" id="listen-btn" disabled>
          <span class="icon">🔊</span> 听发音
        </button>
      </div>

      <div class="recording-section">
        <h3>第二步：跟读录音</h3>
        <p class="recording-hint">点击录音按钮，跟着标准发音朗读单词</p>
        <div class="waveform-wrapper">
          <canvas id="recording-canvas"></canvas>
        </div>
        <button class="record-btn" id="record-btn" disabled>
          <span class="icon">🎤</span> 点击开始录音
        </button>
        <div class="record-actions" style="display:none;" id="record-actions">
          <button class="secondary-btn" id="play-user-btn" style="display:none;">
            <span class="icon">🎵</span> 回放我的录音
          </button>
          <button class="secondary-btn" id="compare-btn" style="display:none;">
            <span class="icon">🔀</span> 标准 vs 我的对比
          </button>
        </div>
        <div id="recognition-result" style="display:none; margin-top: 12px;"></div>
      </div>

      <div class="recording-section">
        <h3>录音记录</h3>
        <div id="recording-history"></div>
      </div>
    </div>
  `;

  // Word selector
  const wordSelector = document.getElementById('word-selector');
  wordSelector.querySelectorAll('.word-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      wordSelector.querySelectorAll('.word-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      recordingState.currentWord = chip.dataset.word;
      document.getElementById('listen-btn').disabled = false;
      document.getElementById('record-btn').disabled = false;
    });
  });

  // Listen button
  document.getElementById('listen-btn').addEventListener('click', () => {
    if (recordingState.currentWord) {
      speak(recordingState.currentWord);
    }
  });

  // Record button (toggle)
  const recordBtn = document.getElementById('record-btn');
  recordBtn.addEventListener('click', async () => {
    const canvas = document.getElementById('recording-canvas');
    if (recordingState.isRecording) {
      stopRecording();
    } else {
      // Reset previous
      if (recordingState.audioUrl) {
        URL.revokeObjectURL(recordingState.audioUrl);
        recordingState.audioUrl = null;
        recordingState.audioBlob = null;
      }
      const playUserBtn = document.getElementById('play-user-btn');
      const compareBtn = document.getElementById('compare-btn');
      const actions = document.getElementById('record-actions');
      const resultEl = document.getElementById('recognition-result');
      if (playUserBtn) playUserBtn.style.display = 'none';
      if (compareBtn) compareBtn.style.display = 'none';
      if (actions) actions.style.display = 'none';
      if (resultEl) resultEl.style.display = 'none';

      await startRecording(canvas);
    }
  });

  renderRecordingHistory();
}
