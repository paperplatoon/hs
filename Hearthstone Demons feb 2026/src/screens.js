// Screen router - renders the appropriate screen based on state.currentScreen

import { renderDeckBuilder } from './deckBuilder.js';
import { renderCombatUI } from './render/render.js';
import { renderStartMenu } from './startMenu.js';
import { initializeRun, initializeRunWithPlayerCharacter, startNextCombat, withState } from './state.js';
import { startGame } from './engine/actions.js';
import { generateShopInventory, setShopInventory, renderShop, renderRemoveCardScreen as renderRemoveCardUI } from './shop.js';

// Main screen router
export function renderCurrentScreen(state, setState, container) {
  container.innerHTML = '';

  switch (state.currentScreen) {
    case 'start-menu':
      renderStartMenuScreen(state, setState, container);
      break;

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

// Start menu screen - character selection
function renderStartMenuScreen(state, setState, container) {
  renderStartMenu(
    container,
    // onSelectCharacter callback
    (character) => {
      let s = initializeRunWithPlayerCharacter(state, character);
      s = startGame(s);
      setState(s);
    },
    // onBuildOwn callback
    () => {
      setState(withState(state, (ns) => {
        ns.currentScreen = 'deck-builder';
      }));
    }
  );
}

// Deck builder screen
function renderDeckBuilderScreen(state, setState, container) {
  renderDeckBuilder(container, (selectedDeck) => {
    // Deck selected, initialize run and go to combat
    let s = initializeRun(state, selectedDeck);
    // Start the first combat
    s = startGame(s);
    setState(s);
  });
}

// Combat screen
function renderCombatScreen(state, setState, container) {
  // Check if combat needs initialization (empty deck/hand means fresh combat state)
  const needsInit = state.players.player.deck.length === 0 && state.players.player.hand.length === 0;

  if (needsInit) {
    // Initialize combat state and trigger re-render
    let s = startGame(state);
    setState(s);
    return;
  }

  // Render combat UI (pure function, rebuilds DOM every time)
  renderCombatUI(container, state, setState);
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
