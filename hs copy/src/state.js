// Core game state and helpers

export const Players = {
  PLAYER: 'player',
  OPPONENT: 'opponent',
};

export const Phases = {
  START: 'start',
  MAIN: 'main',
  COMBAT: 'combat',
  END: 'end',
};

let __uid = 1;
export function uid() { return `m${__uid++}`; }

export function createInitialState() {
  return {
    turn: 1,
    activePlayer: Players.PLAYER,
    phase: Phases.START,
    players: {
      [Players.PLAYER]: createPlayerState(Players.PLAYER),
      [Players.OPPONENT]: createPlayerState(Players.OPPONENT),
    },
    pending: {
      selection: null, // { type: 'attack', attackerIndex }
      aiDoneTurn: false,
    },
    log: [],
  };
}

function createPlayerState(id) {
  return {
    id,
    name: id,
    life: 20,
    mana: { current: 1, max: 1 },
    deck: [], // array of card instances (by id + runtime props)
    hand: [],
    board: [], // minion instances
    graveyard: [],
    heroPower: null,
    effects: {
      multipliers: {
        growing: 1,
      },
    },
  };
}

export function clone(obj) {
  // Use structuredClone when available; fallback to JSON for plain data
  if (typeof structuredClone === 'function') return structuredClone(obj);
  return JSON.parse(JSON.stringify(obj));
}

export function withState(state, fn) {
  const next = clone(state);
  fn(next);
  return next;
}

export function pushLog(state, message) {
  state.log.push({ t: Date.now(), message });
}
