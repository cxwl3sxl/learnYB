// ===== Audio: Phoneme sound files (PCM WAV) =====
let currentPhonemeAudio = null;

export function playPhoneme(sound) {
  // Stop any current phoneme audio and speech
  stopAudio();

  if (!sound || !sound.audio) return;

  currentPhonemeAudio = new Audio(sound.audio);
  currentPhonemeAudio.volume = 1.0;
  currentPhonemeAudio.play().catch(e => {
    // Fallback to Web Speech API if audio file fails
    if (sound.examples && sound.examples[0]) {
      speak(sound.examples[0], 0.85);
    }
  });
}

// ===== Audio: Web Speech API (for example words) =====
export function speak(text, rate = 0.8) {
  stopPhonemeAudio();
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'en-GB';
  utter.rate = rate;
  utter.pitch = 1;
  window.speechSynthesis.speak(utter);
}

function stopPhonemeAudio() {
  if (currentPhonemeAudio) {
    currentPhonemeAudio.pause();
    currentPhonemeAudio = null;
  }
}

export function stopAudio() {
  stopPhonemeAudio();
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
