// Screen router - renders the appropriate screen based on state.currentScreen

import { renderDeckBuilder } from './deckBuilder.js';
import { mount } from './render/render.js';
import { initializeRun, startNextCombat, withState } from './state.js';
import { startGame } from './engine/actions.js';
import { generateShopInventory, setShopInventory, renderShop, renderRemoveCardScreen as renderRemoveCardUI } from './shop.js';

// Track if combat has been initialized for current fight
let combatInitialized = false;
let combatUI = null;

// Main screen router
export function renderCurrentScreen(state, setState, container) {
  container.innerHTML = '';

  switch (state.currentScreen) {
    case 'deck-builder':
      renderDeckBuilderScreen(state, setState, container);
      break;

    case 'combat':
      renderCombatScreen(state, setState, container);
      break;

    case 'shop':
      renderShopScreen(state, setState, container);
      break;

    case 'remove-card':
      renderRemoveCardScreen(state, setState, container);
      break;

    default:
      console.error(`Unknown screen: ${state.currentScreen}`);
      container.innerHTML = `<div>Error: Unknown screen "${state.currentScreen}"</div>`;
  }
}

// Deck builder screen
function renderDeckBuilderScreen(state, setState, container) {
  renderDeckBuilder(container, (selectedDeck) => {
    // Deck selected, initialize run and go to combat
    let s = initializeRun(state, selectedDeck);
    // Start the first combat
    s = startGame(s);
    combatInitialized = true;
    setState(s);
  });
}

// Combat screen
function renderCombatScreen(state, setState, container) {
  // Initialize combat if entering for the first time this fight
  if (!combatInitialized) {
    let s = startGame(state);
    combatInitialized = true;
    setState(s);
    return;
  }

  // Mount combat UI if not already mounted
  if (!combatUI) {
    combatUI = mount(container, () => state, setState);
  }
  combatUI.rerender();
}

// Reset combat flag when leaving combat (called from shop/next fight)
export function resetCombatFlag() {
  combatInitialized = false;
}

// Shop screen
function renderShopScreen(state, setState, container) {
  // Generate shop inventory if it doesn't exist yet
  if (!state.shop.availableCards || state.shop.availableCards.length === 0) {
    const inventory = generateShopInventory();
    const newState = setShopInventory(state, inventory);
    setState(newState);
    return; // Will re-render with new inventory
  }

  const shopUI = renderShop(
    state,
    setState,
    // onRemoveCard callback
    () => {
      setState(withState(state, ns => {
        ns.currentScreen = 'remove-card';
      }));
    },
    // onNextFight callback
    () => {
      resetCombatFlag();
      setState(startNextCombat(state));
    }
  );

  container.appendChild(shopUI);
}

// Remove card screen
function renderRemoveCardScreen(state, setState, container) {
  const removeUI = renderRemoveCardUI(
    state,
    setState,
    // onBackToShop callback
    () => {
      setState(withState(state, ns => {
        ns.currentScreen = 'shop';
      }));
    }
  );

  container.appendChild(removeUI);
}
