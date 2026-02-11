// Shop business logic - pure functions for purchasing and removing cards

import { CARDS } from './cards/schema.js';
import { withState } from './state.js';
import { renderFullCard } from './deckBuilder.js';

const CARD_PURCHASE_COST = 10;
const CARD_REMOVE_COST = 25;
const SHOP_SIZE = 6;

// ========== SHOP INVENTORY ==========

// Generate shop inventory - random selection of collectible cards
export function generateShopInventory(count = SHOP_SIZE) {
  const availableCardIds = Object.keys(CARDS).filter(id => CARDS[id].collectible !== false);
  const inventory = [];

  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * availableCardIds.length);
    inventory.push(availableCardIds[randomIndex]);
  }

  return inventory;
}

// Set shop inventory in state
export function setShopInventory(state, cardIds) {
  return withState(state, (ns) => {
    ns.shop.availableCards = cardIds;
  });
}

// ========== PURCHASE LOGIC ==========

// Check if player can afford to purchase a card
export function canPurchaseCard(state) {
  return state.run.gold >= CARD_PURCHASE_COST;
}

// Purchase a card - deduct gold, add to deck, and remove from shop
export function purchaseCard(state, cardId) {
  if (!canPurchaseCard(state)) return state;

  // Check if card is still available in shop
  const cardIndex = state.shop.availableCards.indexOf(cardId);
  if (cardIndex === -1) return state; // Card already purchased

  return withState(state, (ns) => {
    ns.run.gold -= CARD_PURCHASE_COST;
    ns.run.playerDeck.push(cardId);
    // Remove from shop so it can't be bought again
    ns.shop.availableCards.splice(cardIndex, 1);
  });
}

// ========== REMOVE LOGIC ==========

// Check if player can afford to remove a card
export function canRemoveCard(state) {
  return state.run.gold >= CARD_REMOVE_COST && state.run.playerDeck.length > 0;
}

// Remove one occurrence of a card from deck - deduct gold
export function removeCardFromDeck(state, cardId) {
  if (!canRemoveCard(state)) return state;

  // Find first occurrence of this card
  const index = state.run.playerDeck.indexOf(cardId);
  if (index === -1) return state; // Card not in deck

  return withState(state, (ns) => {
    ns.run.gold -= CARD_REMOVE_COST;
    ns.run.playerDeck.splice(index, 1); // Remove one copy
  });
}

// ========== DECK DISPLAY HELPERS ==========

// Get card counts in deck for display
// Returns: { cardId: count }
export function getDeckCardCounts(state) {
  const counts = {};

  state.run.playerDeck.forEach(cardId => {
    counts[cardId] = (counts[cardId] || 0) + 1;
  });

  return counts;
}

// Get deck grouped by cost for rendering
// Returns: [{ cost, cards: [{ id, name, count }] }]
export function getDeckGroupedByCost(state) {
  const counts = getDeckCardCounts(state);
  const groups = {}; // { cost: [{ id, name, count }] }

  Object.entries(counts).forEach(([cardId, count]) => {
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

// Get total deck size
export function getDeckSize(state) {
  return state.run.playerDeck.length;
}

// ========== SHOP UI RENDERING ==========

import { createCardInstance } from './cards/schema.js';
import { createInitialState } from './state.js';

// Render a card footer with tier badge and evolve preview
function renderShopFooter(cardDef) {
  const tier = cardDef.tier || 1;
  const evolveInfo = cardDef.keywords?.evolve;

  const footer = document.createElement('div');
  footer.className = 'cm-footer';

  const tierBadge = document.createElement('span');
  tierBadge.className = 'cm-tier';
  tierBadge.dataset.tier = tier;
  tierBadge.textContent = `Tier ${tier}`;
  footer.appendChild(tierBadge);

  if (evolveInfo?.cardId) {
    const evolveDef = CARDS[evolveInfo.cardId];
    if (evolveDef) {
      const evolvePreview = document.createElement('span');
      evolvePreview.className = 'cm-evolve';

      const label = document.createElement('span');
      label.textContent = 'Add to hand:';

      const thumb = document.createElement('img');
      thumb.className = 'cm-evolve-thumb';
      thumb.src = evolveDef.art || 'img/plant1.png';
      thumb.alt = evolveDef.name;

      evolvePreview.append(label, thumb);
      footer.appendChild(evolvePreview);

      evolvePreview.addEventListener('mouseenter', () => {
        const existing = document.querySelector('.evolve-popup');
        if (existing) existing.remove();

        const popup = document.createElement('div');
        popup.className = 'evolve-popup';
        const popupCard = renderFullCard(evolveInfo.cardId);
        if (popupCard) popup.appendChild(popupCard);
        document.body.appendChild(popup);

        const rect = evolvePreview.getBoundingClientRect();
        popup.style.left = `${rect.left}px`;
        popup.style.top = `${rect.top - popup.offsetHeight - 8}px`;
        if (popup.getBoundingClientRect().top < 0) {
          popup.style.top = `${rect.bottom + 8}px`;
        }
      });

      evolvePreview.addEventListener('mouseleave', () => {
        const existing = document.querySelector('.evolve-popup');
        if (existing) existing.remove();
      });
    }
  }

  return footer;
}

// Render a shop card with price and purchase handler
function renderShopCard(cardId, state, setState) {
  const cardDef = CARDS[cardId];
  if (!cardDef) return null;

  const canAfford = canPurchaseCard(state);

  // Create card wrapper
  const wrap = document.createElement('div');
  wrap.className = 'card-wrap shop-card-wrap';
  if (!canAfford) wrap.classList.add('card-disabled');

  // Create card element (similar to deck builder)
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

  // Keywords chips
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

  // Text
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

  // Footer with tier and evolve preview
  card.appendChild(renderShopFooter(cardDef));

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

  // Price badge
  const priceBadge = document.createElement('div');
  priceBadge.className = 'shop-price-badge';
  priceBadge.textContent = `${CARD_PURCHASE_COST} gold`;
  card.appendChild(priceBadge);

  wrap.appendChild(card);

  // Click handler to purchase
  if (canAfford) {
    wrap.style.cursor = 'pointer';
    wrap.addEventListener('click', () => {
      setState(purchaseCard(state, cardId));
    });
  }

  return wrap;
}

// Main shop rendering function
export function renderShop(state, setState, onRemoveCard, onNextFight) {
  const container = document.createElement('div');
  container.className = 'shop-container';

  // Header section
  const header = document.createElement('div');
  header.className = 'shop-header';

  const title = document.createElement('h1');
  title.textContent = 'Shop';

  const stats = document.createElement('div');
  stats.className = 'shop-stats';
  stats.innerHTML = `
    <div class="shop-stat">
      <span class="shop-stat-label">Round:</span>
      <span class="shop-stat-value">${state.run.round}</span>
    </div>
    <div class="shop-stat">
      <span class="shop-stat-label">Gold:</span>
      <span class="shop-stat-value gold">${state.run.gold}</span>
    </div>
    <div class="shop-stat">
      <span class="shop-stat-label">Deck Size:</span>
      <span class="shop-stat-value">${state.run.playerDeck.length}</span>
    </div>
  `;

  header.appendChild(title);
  header.appendChild(stats);
  container.appendChild(header);

  // Cards grid
  const cardsSection = document.createElement('div');
  cardsSection.className = 'shop-cards-section';

  const cardsTitle = document.createElement('h2');
  cardsTitle.textContent = 'Available Cards';
  cardsTitle.style.marginBottom = '16px';

  const cardsGrid = document.createElement('div');
  cardsGrid.className = 'shop-cards-grid';

  state.shop.availableCards.forEach(cardId => {
    const cardEl = renderShopCard(cardId, state, setState);
    if (cardEl) cardsGrid.appendChild(cardEl);
  });

  cardsSection.appendChild(cardsTitle);
  cardsSection.appendChild(cardsGrid);
  container.appendChild(cardsSection);

  // Actions section
  const actions = document.createElement('div');
  actions.className = 'shop-actions';

  // Remove card button
  const removeBtn = document.createElement('button');
  removeBtn.className = 'btn btn--remove';
  removeBtn.textContent = `Remove Card (${CARD_REMOVE_COST} gold)`;
  removeBtn.disabled = !canRemoveCard(state);
  if (!canRemoveCard(state)) {
    removeBtn.classList.add('disabled');
  }
  removeBtn.addEventListener('click', () => {
    if (canRemoveCard(state)) {
      onRemoveCard();
    }
  });

  // Next fight button
  const nextBtn = document.createElement('button');
  nextBtn.className = 'btn btn--next-fight';
  nextBtn.textContent = 'Go to Next Fight';
  nextBtn.addEventListener('click', onNextFight);

  actions.appendChild(removeBtn);
  actions.appendChild(nextBtn);
  container.appendChild(actions);

  return container;
}

// ========== REMOVE CARD SCREEN ==========

// Render confirmation modal for card removal
function renderConfirmationModal(cardName, onConfirm, onCancel) {
  // Backdrop
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.addEventListener('click', onCancel);

  // Modal container
  const modal = document.createElement('div');
  modal.className = 'modal-container';
  modal.addEventListener('click', (e) => e.stopPropagation()); // Prevent backdrop click

  const title = document.createElement('h2');
  title.textContent = 'Confirm Removal';
  title.style.marginBottom = '16px';

  const message = document.createElement('p');
  message.innerHTML = `Remove <strong>${cardName}</strong> for <span style="color: #ffd451">${CARD_REMOVE_COST} gold</span>?`;
  message.style.marginBottom = '24px';
  message.style.fontSize = '16px';

  const buttons = document.createElement('div');
  buttons.className = 'modal-buttons';

  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'btn btn--modal-cancel';
  cancelBtn.textContent = 'Cancel';
  cancelBtn.addEventListener('click', onCancel);

  const confirmBtn = document.createElement('button');
  confirmBtn.className = 'btn btn--modal-confirm';
  confirmBtn.textContent = 'Confirm';
  confirmBtn.addEventListener('click', onConfirm);

  buttons.appendChild(cancelBtn);
  buttons.appendChild(confirmBtn);

  modal.appendChild(title);
  modal.appendChild(message);
  modal.appendChild(buttons);

  backdrop.appendChild(modal);
  return backdrop;
}

// Render a deck card for removal selection
function renderRemovableCard(cardId, count, state, onSelect) {
  const cardDef = CARDS[cardId];
  if (!cardDef) return null;

  return renderFullCard(cardId, {
    badge: count > 1 ? `×${count}` : null,
    onClick: () => onSelect(cardId, cardDef.name)
  });
}

// Main remove card screen
export function renderRemoveCardScreen(state, setState, onBackToShop) {
  const container = document.createElement('div');
  container.className = 'remove-card-container';

  // Modal state (managed locally within this render)
  let modalElement = null;

  function showModal(cardId, cardName) {
    // Remove existing modal if any
    if (modalElement) {
      modalElement.remove();
      modalElement = null;
    }

    modalElement = renderConfirmationModal(
      cardName,
      // onConfirm
      () => {
        // Remove card and deduct gold
        const newState = removeCardFromDeck(state, cardId);
        modalElement.remove();
        modalElement = null;

        // If successful removal, go back to shop
        if (newState !== state) {
          setState(withState(newState, ns => {
            ns.currentScreen = 'shop';
          }));
        }
      },
      // onCancel
      () => {
        modalElement.remove();
        modalElement = null;
      }
    );

    document.body.appendChild(modalElement);
  }

  // Header
  const header = document.createElement('div');
  header.className = 'remove-card-header';

  const title = document.createElement('h1');
  title.textContent = 'Remove Card';

  const subtitle = document.createElement('p');
  subtitle.textContent = `Select a card to remove for ${CARD_REMOVE_COST} gold`;
  subtitle.style.color = 'var(--muted)';
  subtitle.style.marginTop = '8px';

  header.appendChild(title);
  header.appendChild(subtitle);
  container.appendChild(header);

  // Deck display
  const deckSection = document.createElement('div');
  deckSection.className = 'remove-card-deck';

  const groups = getDeckGroupedByCost(state);

  if (groups.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'remove-card-empty';
    empty.textContent = 'Your deck is empty.';
    deckSection.appendChild(empty);
  } else {
    groups.forEach(({ cost, cards }) => {
      // Cost header
      const costHeader = document.createElement('div');
      costHeader.className = 'remove-card-cost-header';
      costHeader.textContent = `Cost ${cost}`;
      deckSection.appendChild(costHeader);

      // Cards grid
      const cardsGrid = document.createElement('div');
      cardsGrid.className = 'card-gallery-grid';

      cards.forEach(({ id, count }) => {
        const entry = renderRemovableCard(id, count, state, showModal);
        if (entry) cardsGrid.appendChild(entry);
      });

      deckSection.appendChild(cardsGrid);
    });
  }

  container.appendChild(deckSection);

  // Back button
  const backBtn = document.createElement('button');
  backBtn.className = 'btn btn--back-to-shop';
  backBtn.textContent = 'Back to Shop';
  backBtn.addEventListener('click', onBackToShop);

  container.appendChild(backBtn);

  return container;
}

