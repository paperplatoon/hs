import { createInitialState, withState } from './state.js';
import { mount } from './render/render.js';
import { startGame } from './engine/actions.js';

const root = document.getElementById('app');
let state = createInitialState();

function setState(updater) {
  state = typeof updater === 'function' ? updater(state) : updater;
  ui.rerender();
}

function getState() {
  return state;
}

const ui = mount(root, getState, setState);

// Kick off a new game
state = startGame(state);
ui.rerender();

// Expose for quick debugging in console
window.__getState = getState;
window.__setState = setState;

