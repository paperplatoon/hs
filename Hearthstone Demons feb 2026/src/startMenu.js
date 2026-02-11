/**
 * Start Menu Screen
 *
 * Allows player to choose a starter character or build their own deck.
 */

import { CHARACTERS, HERO_POWERS } from './characters/schema.js';
import { CARDS } from './cards/schema.js';

// Characters available for quick start (in order of display)
const STARTER_CHARACTERS = ['char:druid', 'char:mage'];

/**
 * Render the start menu
 * @param {HTMLElement} container - Container to render into
 * @param {Function} onSelectCharacter - Callback when character is selected (receives character object)
 * @param {Function} onBuildOwn - Callback when "Build Your Own" is clicked
 */
export function renderStartMenu(container, onSelectCharacter, onBuildOwn) {
  const menu = document.createElement('div');
  menu.className = 'start-menu';

  // Title
  const title = document.createElement('h1');
  title.className = 'start-menu__title';
  title.textContent = 'Choose Your Character';
  menu.appendChild(title);

  // Character cards container
  const cardsContainer = document.createElement('div');
  cardsContainer.className = 'start-menu__characters';

  // Render each starter character
  STARTER_CHARACTERS.forEach((charId) => {
    const char = CHARACTERS[charId];
    if (!char) return;

    const card = createCharacterCard(char, () => onSelectCharacter(char));
    cardsContainer.appendChild(card);
  });

  menu.appendChild(cardsContainer);

  // Divider
  const divider = document.createElement('div');
  divider.className = 'start-menu__divider';
  divider.innerHTML = '<span>or</span>';
  menu.appendChild(divider);

  // Build Your Own button
  const buildOwnBtn = document.createElement('button');
  buildOwnBtn.className = 'btn btn--large start-menu__build-own';
  buildOwnBtn.textContent = 'Build Your Own Deck';
  buildOwnBtn.addEventListener('click', onBuildOwn);
  menu.appendChild(buildOwnBtn);

  container.appendChild(menu);
}

/**
 * Create a character selection card
 */
function createCharacterCard(char, onSelect) {
  const card = document.createElement('div');
  card.className = 'character-card';

  // Character name
  const name = document.createElement('h2');
  name.className = 'character-card__name';
  name.textContent = char.name;
  card.appendChild(name);

  // Description
  const desc = document.createElement('p');
  desc.className = 'character-card__desc';
  desc.textContent = char.description;
  card.appendChild(desc);

  // Hero power section
  const heroPower = HERO_POWERS[char.heroPower];
  if (heroPower) {
    const powerSection = document.createElement('div');
    powerSection.className = 'character-card__power';

    const powerLabel = document.createElement('div');
    powerLabel.className = 'character-card__power-label';
    powerLabel.textContent = 'Hero Power';

    const powerName = document.createElement('div');
    powerName.className = 'character-card__power-name';
    powerName.innerHTML = `<strong>${heroPower.name}</strong> <span class="mana-cost">(${heroPower.cost})</span>`;

    const powerText = document.createElement('div');
    powerText.className = 'character-card__power-text';
    powerText.textContent = heroPower.text;

    powerSection.appendChild(powerLabel);
    powerSection.appendChild(powerName);
    powerSection.appendChild(powerText);
    card.appendChild(powerSection);
  }

  // Deck preview section
  const deckSection = document.createElement('div');
  deckSection.className = 'character-card__deck';

  const deckLabel = document.createElement('div');
  deckLabel.className = 'character-card__deck-label';
  deckLabel.textContent = `Deck (${char.starterDeck.length} cards)`;

  const deckList = document.createElement('div');
  deckList.className = 'character-card__deck-list';

  // Group cards by ID and count
  const cardCounts = {};
  char.starterDeck.forEach((cardId) => {
    cardCounts[cardId] = (cardCounts[cardId] || 0) + 1;
  });

  // Display each unique card with count
  Object.entries(cardCounts).forEach(([cardId, count]) => {
    const cardDef = CARDS[cardId];
    if (!cardDef) return;

    const cardLine = document.createElement('div');
    cardLine.className = 'character-card__deck-item';

    const stats = cardDef.stats;
    const statText = cardDef.type === 'minion'
      ? `${stats.attack}/${stats.health}`
      : '';

    cardLine.innerHTML = `
      <span class="deck-item__count">${count}x</span>
      <span class="deck-item__name">${cardDef.name}</span>
      ${statText ? `<span class="deck-item__stats">${statText}</span>` : ''}
    `;
    deckList.appendChild(cardLine);
  });

  deckSection.appendChild(deckLabel);
  deckSection.appendChild(deckList);
  card.appendChild(deckSection);

  // Start button
  const startBtn = document.createElement('button');
  startBtn.className = 'btn btn--primary character-card__start';
  startBtn.textContent = `Play as ${char.name}`;
  startBtn.addEventListener('click', onSelect);
  card.appendChild(startBtn);

  return card;
}
