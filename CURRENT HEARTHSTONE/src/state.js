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
    // Screen management
    currentScreen: 'deck-builder', // 'deck-builder' | 'combat' | 'shop' | 'remove-card'

    // Run progression (meta-game state that persists across combats)
    run: {
      gold: 0,
      round: 1,
      playerDeck: [], // Array of card IDs that persist between fights
    },

    // Shop state (regenerated each visit)
    shop: {
      availableCards: [], // 6 card IDs available for purchase
    },

    // Combat state (reset between fights)
    turn: 1,
    activePlayer: Players.PLAYER,
    phase: Phases.START,
    viewMode: 'battle', // 'battle' | 'gallery'
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
      permanent: {
        // Persistent buffs that survive across combats (from meta-progression)
        battlecryBonus: 0,
        deathBonus: 0,
      },
      combat: {
        // Combat-only buffs that reset between fights
        battlecryBonus: 0,
        deathBonus: 0,
        fatigueCount: 0, // How many times player has fatigued (next fatigue = count + 1)
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
  console.log(`[Game Log] ${message}`);
}

export function resetCombatModifiers(state) {
  // Reset all combat-specific effects (called between fights)
  // Permanent effects are preserved
  return withState(state, (ns) => {
    [Players.PLAYER, Players.OPPONENT].forEach(playerId => {
      ns.players[playerId].effects.combat = {
        battlecryBonus: 0,
        deathBonus: 0,
        fatigueCount: 0,
      };
    });
  });
}

// ========== RUN PROGRESSION & SCREEN TRANSITIONS ==========

// Initialize a new run after deck builder completes
export function initializeRun(state, playerDeck) {
  return withState(state, (ns) => {
    ns.run.playerDeck = playerDeck; // Array of card IDs
    ns.run.gold = 0;
    ns.run.round = 1;
    ns.currentScreen = 'combat';
  });
}

// Reset combat state between fights (preserve run progression)
export function resetCombatState(state) {
  return withState(state, (ns) => {
    ns.turn = 1;
    ns.activePlayer = Players.PLAYER;
    ns.phase = Phases.START;
    ns.viewMode = 'battle';
    ns.log = [];
    ns.pending = {
      selection: null,
      aiDoneTurn: false,
    };

    // Reset player states
    [Players.PLAYER, Players.OPPONENT].forEach(playerId => {
      ns.players[playerId].life = 20;
      ns.players[playerId].mana = { current: 1, max: 1 };
      ns.players[playerId].deck = [];
      ns.players[playerId].hand = [];
      ns.players[playerId].board = [];
      ns.players[playerId].graveyard = [];
    });

    // Reset combat modifiers
    [Players.PLAYER, Players.OPPONENT].forEach(playerId => {
      ns.players[playerId].effects.combat = {
        battlecryBonus: 0,
        deathBonus: 0,
        fatigueCount: 0,
      };
    });
  });
}

// Handle combat victory - award gold and transition to shop
export function onCombatVictory(state) {
  return withState(state, (ns) => {
    ns.run.gold += 50;
    ns.run.round += 1;
    ns.currentScreen = 'shop';
    // Clear shop inventory so it regenerates with new cards
    ns.shop.availableCards = [];
    pushLog(ns, `Victory! Earned 50 gold. Total: ${ns.run.gold}`);
  });
}

// Start the next combat with player's current deck
export function startNextCombat(state) {
  let s = resetCombatState(state);
  s = withState(s, (ns) => {
    ns.currentScreen = 'combat';
  });
  return s;
}
