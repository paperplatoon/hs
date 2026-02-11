import { createInitialState } from './state.js';
import { renderCurrentScreen } from './screens.js';

const root = document.getElementById('app');
let state = createInitialState();

function setState(newStateOrFn) {
  if (typeof newStateOrFn === 'function') {
    state = newStateOrFn(state);
  } else {
    state = newStateOrFn;
  }
  render();
}

function getState() {
  return state;
}

function render() {
  renderCurrentScreen(state, setState, root);
}

// Initial render
render();

// Expose for quick debugging in console
window.__getState = getState;
window.__setState = setState;

