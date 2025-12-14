// Centralized trigger registry and dispatcher
import { Players, withState, pushLog } from '../state.js';
import { createCardInstance } from '../cards/schema.js';

// Helper: Calculate how many times battlecries should trigger
// Combines permanent buffs, combat buffs, and auras from minions
function getBattlecryTriggerCount(state, playerId) {
  const player = state.players[playerId];
  let count = 1; // Base: battlecries trigger once

  // Add permanent buffs (from meta-progression, survives across combats)
  count += player.effects.permanent?.battlecryBonus || 0;

  // Add combat buffs (from spells/effects this combat, reset between fights)
  count += player.effects.combat?.battlecryBonus || 0;

  // Add aura from minions on board with 'amplify' keyword
  player.board.forEach(m => {
    if (m.keywords?.amplify) count += 1;
  });

  return count;
}

// Helper: Calculate how many times deathrattles should trigger
// Combines permanent buffs, combat buffs, and auras from minions
function getDeathTriggerCount(state, playerId) {
  const player = state.players[playerId];
  let count = 1; // Base: deathrattles trigger once

  // Add permanent buffs (from meta-progression, survives across combats)
  count += player.effects.permanent?.deathBonus || 0;

  // Add combat buffs (from spells/effects this combat, reset between fights)
  count += player.effects.combat?.deathBonus || 0;

  // Add aura from minions on board with 'reanimator' keyword
  player.board.forEach(m => {
    if (m.keywords?.reanimator) count += 1;
  });

  return count;
}

// Keyword handlers receive (state, { ownerId, minionIndex, amount, ... }) and return new state
export const KeywordHandlers = {
  // Growing: at end of owner's turn, gain +X/+Y
  growing: (state, ctx) => {
    const { ownerId, minionIndex, attack = 1, health = 1 } = ctx;
    const mult = state.players[ownerId].effects.multipliers.growing || 1;
    const a = attack * mult;
    const h = health * mult;
    return withState(state, (s) => {
      const m = s.players[ownerId].board[minionIndex];
      if (!m) return;
      m.attack += a;
      m.health += h;
      m.maxHealth += h;
      pushLog(s, `${m.name} grows by +${a}/+${h}`);
    });
  },
  // Gain: immediate stat change on the minion
  // ctx: { ownerId, minionIndex, attack=0, health=0 }
  gain: (state, ctx) => {
    const { ownerId, minionIndex, attack = 0, health = 0 } = ctx;
    return withState(state, (s) => {
      const m = s.players[ownerId].board[minionIndex];
      if (!m) return;
      if (attack) m.attack += attack;
      if (health) {
        m.health += health;
        m.maxHealth += health;
      }
      pushLog(s, `${m.name} gains ${attack ? `+${attack} atk ` : ''}${health ? `+${health} hp` : ''}`.trim());
    });
  },
  // Spawn: create one or more token minions for owner
  // ctx: { ownerId, cardId, count = 1 }
  spawn: (state, ctx) => {
    const { ownerId, cardId, count = 1 } = ctx;
    return withState(state, (s) => {
      for (let i = 0; i < count; i++) {
        if (s.players[ownerId].board.length >= 6) { pushLog(s, `Board full; cannot spawn more.`); break; }
        const inst = createCardInstance(cardId);
        const m = { ...inst, owner: ownerId, summoningSickness: true, canAttack: false };
        s.players[ownerId].board.push(m);
        pushLog(s, `${s.players[ownerId].name} summons ${m.name} (spawn)`);
      }
    });
  },
  // Warcry: when played, give a random friendly minion +X attack (excluding self)
  // ctx: { ownerId, minionIndex, attack }
  warcry: (state, ctx) => {
    const { ownerId, minionIndex, attack = 0 } = ctx;
    return withState(state, (s) => {
      const board = s.players[ownerId].board;
      // Get valid targets (all minions except the one that triggered this)
      const validIndices = board
        .map((_, idx) => idx)
        .filter(idx => idx !== minionIndex);

      if (validIndices.length === 0) {
        pushLog(s, `Warcry fizzles (no other allies)`);
        return;
      }

      const randomIndex = validIndices[Math.floor(Math.random() * validIndices.length)];
      const target = board[randomIndex];
      if (target) {
        target.attack += attack;
        pushLog(s, `Warcry: ${target.name} gains +${attack} attack!`);
      }
    });
  },
  // Snipe: when played, deal X damage to the lowest HP enemy (including hero)
  // ctx: { ownerId, damage }
  snipe: (state, ctx) => {
    const { ownerId, damage = 0 } = ctx;
    const enemyId = ownerId === Players.PLAYER ? Players.OPPONENT : Players.PLAYER;

    let deadMinion = null;
    let s = withState(state, (ns) => {
      // Build target list: all enemy minions + enemy hero
      const targets = [];

      ns.players[enemyId].board.forEach((m, idx) => {
        targets.push({ type: 'minion', index: idx, hp: m.health, name: m.name });
      });

      targets.push({
        type: 'hero',
        hp: ns.players[enemyId].life,
        name: ns.players[enemyId].name
      });

      if (targets.length === 0) return;

      // Find minimum HP
      const minHp = Math.min(...targets.map(t => t.hp));
      const lowestTargets = targets.filter(t => t.hp === minHp);

      // Pick one randomly if tied
      const target = lowestTargets[Math.floor(Math.random() * lowestTargets.length)];

      // Deal damage
      if (target.type === 'hero') {
        ns.players[enemyId].life -= damage;
        pushLog(ns, `Snipe: ${damage} damage to ${target.name}`);
      } else {
        const minion = ns.players[enemyId].board[target.index];
        minion.health -= damage;
        pushLog(ns, `Snipe: ${damage} damage to ${minion.name}`);

        // Check for death
        if (minion.health <= 0) {
          const [removed] = ns.players[enemyId].board.splice(target.index, 1);
          deadMinion = removed;
          pushLog(ns, `${removed.name} is destroyed`);
        }
      }
    });

    // Run death triggers if minion died
    if (deadMinion) {
      s = runOnDeathTriggers(s, enemyId, deadMinion);
    }

    return s;
  },
  // Deluge: when played, deal X damage to all enemy minions
  // ctx: { ownerId, damage }
  deluge: (state, ctx) => {
    const { ownerId, damage = 0 } = ctx;
    const enemyId = ownerId === Players.PLAYER ? Players.OPPONENT : Players.PLAYER;

    const deadMinions = [];
    let s = withState(state, (ns) => {
      // Damage all enemy minions
      ns.players[enemyId].board.forEach((minion) => {
        minion.health -= damage;
        pushLog(ns, `Deluge: ${damage} damage to ${minion.name}`);
      });

      // Collect dead minions before removing
      ns.players[enemyId].board.forEach((minion) => {
        if (minion.health <= 0) {
          deadMinions.push(minion);
        }
      });

      // Remove dead minions
      ns.players[enemyId].board = ns.players[enemyId].board.filter(m => m.health > 0);

      deadMinions.forEach(m => pushLog(ns, `${m.name} is destroyed`));
    });

    // Run death triggers for each dead minion
    deadMinions.forEach(minion => {
      s = runOnDeathTriggers(s, enemyId, minion);
    });

    return s;
  },
  // Bolster: when played, give all other friendly minions +X/+Y
  // ctx: { ownerId, minionIndex, attack, health }
  bolster: (state, ctx) => {
    const { ownerId, minionIndex, attack = 0, health = 0 } = ctx;
    return withState(state, (s) => {
      const board = s.players[ownerId].board;

      // Buff all minions except the one that triggered this
      let buffedCount = 0;
      board.forEach((m, idx) => {
        if (idx === minionIndex) return; // Skip self

        if (attack) m.attack += attack;
        if (health) {
          m.health += health;
          m.maxHealth += health;
        }
        buffedCount++;
      });

      if (buffedCount > 0) {
        pushLog(s, `Bolster: ${buffedCount} allies gain +${attack}/+${health}`);
      } else {
        pushLog(s, `Bolster fizzles (no other allies)`);
      }
    });
  },
};

// Dispatch a specific trigger type across all minions
export function runEndOfTurnTriggers(state, ownerId) {
  let next = state;
  const owner = next.players[ownerId];
  owner.board.forEach((m, idx) => {
    const triggers = m.triggers?.endOfTurn || [];
    triggers.forEach((t) => {
      if (t.ownerOnly && m.owner !== ownerId) return;
      const handler = KeywordHandlers[t.keyword];
      if (!handler) return;
      next = handler(next, { ownerId, minionIndex: idx, ...(m.keywords?.[t.keyword] || {}), ...(t.params || {}) });
    });
  });
  return next;
}

export function runStartOfTurnTriggers(state, ownerId) {
  // Placeholder for future keywords
  return state;
}

export function runOnSummonTriggers(state, ownerId, minionIndex) {
  let next = state;
  const triggerCount = getBattlecryTriggerCount(next, ownerId);

  // Loop N times based on battlecry bonuses (can stack)
  for (let i = 0; i < triggerCount; i++) {
    // Re-fetch minion each iteration in case it was modified during triggers
    const m = next.players[ownerId].board[minionIndex];
    if (!m) break; // Minion died or was removed during triggers

    const triggers = m.triggers?.onSummon || [];
    triggers.forEach((t) => {
      const handler = KeywordHandlers[t.keyword];
      if (!handler) return;
      next = handler(next, { ownerId, minionIndex, ...(m.keywords?.[t.keyword] || {}), ...(t.params || {}) });
    });
  }

  return next;
}

export function runOnDeathTriggers(state, ownerId, minion) {
  let next = state;
  const triggerCount = getDeathTriggerCount(next, ownerId);

  // Loop N times based on death bonuses (can stack)
  for (let i = 0; i < triggerCount; i++) {
    const triggers = minion?.triggers?.onDeath || [];
    triggers.forEach((t) => {
      const handler = KeywordHandlers[t.keyword];
      if (!handler) return;
      next = handler(next, { ownerId, ...(minion.keywords?.[t.keyword] || {}), ...(t.params || {}) });
    });
  }

  return next;
}

export function runOnAttackTriggers(state, ownerId, attackerIndex) {
  let next = state;
  const m = next.players[ownerId].board[attackerIndex];
  const triggers = m?.triggers?.onAttack || [];
  triggers.forEach((t) => {
    const handler = KeywordHandlers[t.keyword];
    if (!handler) return;
    next = handler(next, { ownerId, minionIndex: attackerIndex, ...(m.keywords?.[t.keyword] || {}), ...(t.params || {}) });
  });
  return next;
}

export function runOnDamageTriggers(state, ownerId, minionIndex) {
  let next = state;
  const m = next.players[ownerId].board[minionIndex];
  if (!m) return next;
  const triggers = m?.triggers?.onDamage || [];
  triggers.forEach((t) => {
    const handler = KeywordHandlers[t.keyword];
    if (!handler) return;
    next = handler(next, { ownerId, minionIndex, ...(m.keywords?.[t.keyword] || {}), ...(t.params || {}) });
  });
  return next;
}
