// Centralized trigger registry and dispatcher
import { Players, withState, pushLog } from '../state.js';
import { createCardInstance } from '../cards/schema.js';

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
        if (s.players[ownerId].board.length >= 7) { pushLog(s, `Board full; cannot spawn more.`); break; }
        const inst = createCardInstance(cardId);
        const m = { ...inst, owner: ownerId, summoningSickness: true, canAttack: false };
        s.players[ownerId].board.push(m);
        pushLog(s, `${s.players[ownerId].name} summons ${m.name} (spawn)`);
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
      next = handler(next, { ownerId, minionIndex: idx, ...(m.keywords?.[t.keyword] || {}) });
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
  const m = next.players[ownerId].board[minionIndex];
  const triggers = m?.triggers?.onSummon || [];
  triggers.forEach((t) => {
    const handler = KeywordHandlers[t.keyword];
    if (!handler) return;
    next = handler(next, { ownerId, minionIndex, ...(m.keywords?.[t.keyword] || {}), ...(t.params || {}) });
  });
  return next;
}

export function runOnDeathTriggers(state, ownerId, minion) {
  let next = state;
  const triggers = minion?.triggers?.onDeath || [];
  triggers.forEach((t) => {
    const handler = KeywordHandlers[t.keyword];
    if (!handler) return;
    next = handler(next, { ownerId, ...(minion.keywords?.[t.keyword] || {}), ...(t.params || {}) });
  });
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
