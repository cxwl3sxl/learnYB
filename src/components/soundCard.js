// Render a single sound card
export function createSoundCard(sound, type) {
  const card = document.createElement('div');
  card.className = `sound-card ${type}`;
  card.dataset.symbol = sound.symbol;

  card.innerHTML = `
    <div class="sound-symbol">${sound.symbol}</div>
    <div class="sound-name">${sound.name}</div>
    <div class="sound-examples">${sound.examples.slice(0, 2).join(', ')}</div>
  `;

  return card;
}
