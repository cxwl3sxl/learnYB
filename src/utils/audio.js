// ===== Audio: use Web Speech API =====
export function speak(text, rate = 0.8) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'en-GB';
  utter.rate = rate;
  utter.pitch = 1;
  window.speechSynthesis.speak(utter);
}

export function stopAudio() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
