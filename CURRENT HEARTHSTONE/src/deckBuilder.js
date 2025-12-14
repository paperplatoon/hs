// Deck builder state management - pure functions for pre-combat deck selection

import { CARDS } from './cards/schema.js';

const DECK_SIZE = 15;
const MAX_COPIES = 2;

// Create initial deck builder state
export function createDeckBuilderState() {
  return {
    selectedCards: {}, // { cardId: count }
  };
}

// Add a card to the deck (max 2 copies)
export function addCard(state, cardId) {
  const currentCount = state.selectedCards[cardId] || 0;
  if (currentCount >= MAX_COPIES) return state; // Can't add more than 2

  return {
    ...state,
    selectedCards: {
      ...state.selectedCards,
      [cardId]: currentCount + 1,
    },
  };
}

// Remove one copy of a card from the deck
export function removeCard(state, cardId) {
  const currentCount = state.selectedCards[cardId] || 0;
  if (currentCount === 0) return state; // Nothing to remove

  const newSelected = { ...state.selectedCards };

  if (currentCount === 1) {
    // Remove entirely if only one copy
    delete newSelected[cardId];
  } else {
    // Decrement count
    newSelected[cardId] = currentCount - 1;
  }

  return {
    ...state,
    selectedCards: newSelected,
  };
}

// Get total number of cards in deck
export function getTotalCardCount(state) {
  return Object.values(state.selectedCards).reduce((sum, count) => sum + count, 0);
}

// Check if we can add another copy of this card
export function canAddCard(state, cardId) {
  const currentCount = state.selectedCards[cardId] || 0;
  return currentCount < MAX_COPIES;
}

// Check if deck is complete (exactly 15 cards)
export function isDeckComplete(state) {
  return getTotalCardCount(state) === DECK_SIZE;
}

// Get deck as array of card IDs for game initialization
// Returns flat array with duplicates: ['card1', 'card1', 'card2', ...]
export function getDeckAsCardList(state) {
  const deck = [];
  Object.entries(state.selectedCards).forEach(([cardId, count]) => {
    for (let i = 0; i < count; i++) {
      deck.push(cardId);
    }
  });
  return deck;
}

// Get deck grouped by cost for rendering the deck list
// Returns: [{ cost, cards: [{ id, name, count }] }]
export function getDeckGroupedByCost(state) {
  const groups = {}; // { cost: [{ id, name, count }] }

  Object.entries(state.selectedCards).forEach(([cardId, count]) => {
    const cardDef = CARDS[cardId];
    if (!cardDef) return;

    const cost = cardDef.stats?.cost ?? 0;
    if (!groups[cost]) groups[cost] = [];

    groups[cost].push({
      id: cardId,
      name: cardDef.name,
      count,
    });
  });

  // Sort each group alphabetically by name
  Object.values(groups).forEach(group => {
    group.sort((a, b) => a.name.localeCompare(b.name));
  });

  // Convert to array sorted by cost
  return Object.entries(groups)
    .map(([cost, cards]) => ({ cost: parseInt(cost), cards }))
    .sort((a, b) => a.cost - b.cost);
}

// Get available cards for gallery (all cards in CARDS)
export function getAvailableCards() {
  return Object.keys(CARDS);
}

// Get cards grouped by cost for gallery rendering
// Returns: [{ cost, cardIds: [...] }]
export function getGalleryGroupedByCost(cardIds) {
  const groups = {}; // { cost: [cardId] }

  cardIds.forEach(cardId => {
    const cardDef = CARDS[cardId];
    if (!cardDef) return;

    const cost = cardDef.stats?.cost ?? 0;
    if (!groups[cost]) groups[cost] = [];
    groups[cost].push(cardId);
  });

  // Sort each group alphabetically by name
  Object.values(groups).forEach(group => {
    group.sort((a, b) => {
      const nameA = CARDS[a]?.name || '';
      const nameB = CARDS[b]?.name || '';
      return nameA.localeCompare(nameB);
    });
  });

  // Convert to array sorted by cost
  return Object.entries(groups)
    .map(([cost, cardIds]) => ({ cost: parseInt(cost), cardIds }))
    .sort((a, b) => a.cost - b.cost);
}

// ========== UI RENDERING ==========

import { createCardInstance } from './cards/schema.js';
import { createInitialState } from './state.js';

// Render a card for the gallery with click handler and visual feedback
function renderGalleryCard(cardId, state, setState) {
  const cardDef = CARDS[cardId];
  if (!cardDef) return null;

  const cardInstance = createCardInstance(cardId);
  const selectedCount = state.selectedCards[cardId] || 0;
  const canAdd = canAddCard(state, cardId);

  // Create card wrapper
  const wrap = document.createElement('div');
  wrap.className = 'card-wrap gallery-card-wrap';
  if (!canAdd) wrap.classList.add('card-disabled');

  // Create card element (reuse existing minion card rendering)
  const card = document.createElement('div');
  card.className = 'card-minion';

  // Portrait
  const portrait = document.createElement('div');
  portrait.className = 'cm-portrait';
  if (cardDef.art) {
    portrait.style.backgroundImage = `url(${cardDef.art})`;
    portrait.style.backgroundSize = 'cover';
    portrait.style.backgroundPosition = 'center';
  }

  // Name
  const name = document.createElement('div');
  name.className = 'cm-name';
  name.textContent = cardDef.name;
  portrait.appendChild(name);

  // Keywords chips (if any)
  const keywords = Object.keys(cardDef.keywords || {});
  if (keywords.length > 0) {
    const keywordDiv = document.createElement('div');
    keywordDiv.className = 'cm-keywords';
    keywords.forEach(kw => {
      const chip = document.createElement('span');
      chip.className = 'cm-chip';
      chip.textContent = kw;
      keywordDiv.appendChild(chip);
    });
    portrait.appendChild(keywordDiv);
  }

  card.appendChild(portrait);

  // Text (call text function with null context for gallery)
  const dummyState = createInitialState();
  const cardText = typeof cardDef.text === 'function'
    ? cardDef.text(dummyState, null, null, null)
    : (cardDef.text || '');

  if (cardText) {
    const textDiv = document.createElement('div');
    textDiv.className = 'cm-text';
    textDiv.textContent = cardText;
    card.appendChild(textDiv);
  }

  // Stats orbs
  if (cardDef.type === 'minion') {
    const atkOrb = document.createElement('div');
    atkOrb.className = 'cm-orb atk';
    atkOrb.textContent = cardDef.stats.attack;
    card.appendChild(atkOrb);

    const hpOrb = document.createElement('div');
    hpOrb.className = 'cm-orb hp';
    hpOrb.textContent = cardDef.stats.health;
    card.appendChild(hpOrb);
  }

  // Cost orb
  const costOrb = document.createElement('div');
  costOrb.className = 'cm-orb cost';
  costOrb.textContent = cardDef.stats?.cost ?? 0;
  card.appendChild(costOrb);

  // Selected count badge
  if (selectedCount > 0) {
    const badge = document.createElement('div');
    badge.className = 'gallery-count-badge';
    badge.textContent = `(${selectedCount})`;
    card.appendChild(badge);
  }

  wrap.appendChild(card);

  // Click handler to add card
  if (canAdd) {
    wrap.style.cursor = 'pointer';
    wrap.addEventListener('click', (e) => {
      e.preventDefault();
      setState(addCard(state, cardId));
    });
  }

  return wrap;
}

// Render the card gallery (left panel)
function renderCardGallery(state, availableCardIds, setState) {
  const container = document.createElement('div');
  container.className = 'deck-builder-gallery';

  const title = document.createElement('h2');
  title.textContent = 'Available Cards';
  title.style.marginBottom = '16px';
  container.appendChild(title);

  const galleryGrid = document.createElement('div');
  galleryGrid.className = 'card-gallery-grid';

  // Group cards by cost
  const groups = getGalleryGroupedByCost(availableCardIds);

  groups.forEach(({ cost, cardIds }) => {
    // Cost header
    const costHeader = document.createElement('div');
    costHeader.className = 'gallery-cost-header';
    costHeader.textContent = `Cost ${cost}`;
    galleryGrid.appendChild(costHeader);

    // Cards in this cost group
    cardIds.forEach(cardId => {
      const cardEl = renderGalleryCard(cardId, state, setState);
      if (cardEl) galleryGrid.appendChild(cardEl);
    });
  });

  container.appendChild(galleryGrid);
  return container;
}

// Render deck list entry (one row per unique card)
function renderDeckListEntry(cardId, count, setState, state) {
  const cardDef = CARDS[cardId];
  if (!cardDef) return null;

  const entry = document.createElement('div');
  entry.className = 'deck-list-entry';
  entry.style.cursor = 'pointer';

  const cost = cardDef.stats?.cost ?? 0;
  const costSpan = document.createElement('span');
  costSpan.className = 'deck-list-cost';
  costSpan.textContent = cost;

  const nameSpan = document.createElement('span');
  nameSpan.className = 'deck-list-name';
  nameSpan.textContent = cardDef.name;

  const countSpan = document.createElement('span');
  countSpan.className = 'deck-list-count';
  countSpan.textContent = count > 1 ? `(${count})` : '';

  entry.appendChild(costSpan);
  entry.appendChild(nameSpan);
  entry.appendChild(countSpan);

  // Click to remove one copy
  entry.addEventListener('click', (e) => {
    e.preventDefault();
    setState(removeCard(state, cardId));
  });

  return entry;
}

// Render deck list (right panel)
function renderDeckList(state, setState) {
  const container = document.createElement('div');
  container.className = 'deck-builder-decklist';

  // Header with count
  const header = document.createElement('div');
  header.className = 'deck-list-header';

  const title = document.createElement('h2');
  title.textContent = 'Your Deck';

  const counter = document.createElement('div');
  counter.className = 'deck-list-counter';
  const total = getTotalCardCount(state);
  counter.textContent = `${total}/${DECK_SIZE} cards`;
  if (total === DECK_SIZE) counter.classList.add('complete');

  header.appendChild(title);
  header.appendChild(counter);
  container.appendChild(header);

  // Deck entries grouped by cost
  const listContainer = document.createElement('div');
  listContainer.className = 'deck-list-container';

  const groups = getDeckGroupedByCost(state);

  if (groups.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'deck-list-empty';
    empty.textContent = 'No cards selected. Click cards on the left to add them.';
    listContainer.appendChild(empty);
  } else {
    groups.forEach(({ cost, cards }) => {
      // Cost header
      const costHeader = document.createElement('div');
      costHeader.className = 'deck-list-cost-header';
      costHeader.textContent = `Cost ${cost}`;
      listContainer.appendChild(costHeader);

      // Card entries
      cards.forEach(({ id, count }) => {
        const entry = renderDeckListEntry(id, count, setState, state);
        if (entry) listContainer.appendChild(entry);
      });
    });
  }

  container.appendChild(listContainer);
  return container;
}

// Render start button
function renderStartButton(state, onStartRun) {
  const button = document.createElement('button');
  button.className = 'btn btn--start-run';
  button.textContent = 'Start Run';

  const isComplete = isDeckComplete(state);
  button.disabled = !isComplete;

  if (!isComplete) {
    button.classList.add('disabled');
  }

  button.addEventListener('click', () => {
    if (isComplete) {
      onStartRun(getDeckAsCardList(state));
    }
  });

  return button;
}

// Main render function for entire deck builder
export function renderDeckBuilder(container, onStartRun) {
  let state = createDeckBuilderState();
  const availableCards = getAvailableCards();
  let galleryElement = null;

  function setState(newState) {
    // Save scroll position of gallery before re-render
    let savedScrollTop = 0;
    if (galleryElement) {
      savedScrollTop = galleryElement.scrollTop;
    }

    state = newState;
    render();

    // Restore scroll position after re-render
    if (galleryElement && savedScrollTop > 0) {
      requestAnimationFrame(() => {
        galleryElement.scrollTop = savedScrollTop;
      });
    }
  }

  function render() {
    container.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.className = 'deck-builder-wrapper';

    const gallery = renderCardGallery(state, availableCards, setState);
    const deckList = renderDeckList(state, setState);
    const startBtn = renderStartButton(state, onStartRun);

    // Add start button to deck list panel
    deckList.appendChild(startBtn);

    wrapper.appendChild(gallery);
    wrapper.appendChild(deckList);
    container.appendChild(wrapper);

    // Store reference to gallery element for scroll preservation
    galleryElement = gallery;
  }

  render();
}
