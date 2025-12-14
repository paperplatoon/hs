import { Players, Phases, withState, pushLog, onCombatVictory } from '../state.js';
import { CARDS, createCardInstance } from '../cards/schema.js';
import { runEndOfTurnTriggers, runStartOfTurnTriggers, runOnSummonTriggers, runOnDeathTriggers, runOnAttackTriggers, runOnDamageTriggers } from '../triggers/registry.js';

export function startGame(state, playerDeckCardIds = null) {
  let s = state;
  // Seed decks
  s = withState(s, (ns) => {
    // Player deck: prioritize explicit param, then state.run.playerDeck, then default
    let deckSource = playerDeckCardIds || ns.run?.playerDeck;

    if (deckSource && deckSource.length > 0) {
      ns.players.player.deck = deckSource
        .map(cardId => createCardInstance(cardId))
        .map((c) => ({ ...c, owner: Players.PLAYER }));
    } else {
      // Default deck for testing (only if no deck source available)
      ns.players.player.deck = [
        createCardInstance('minion:growing-sprite'),
        createCardInstance('minion:taunt-2-2'),
        createCardInstance('minion:lifesteal-2-2'),
        createCardInstance('minion:deathrattle-wisp'),
        createCardInstance('minion:windfury-1-3'),
        createCardInstance('minion:shield-3-1'),
        createCardInstance('minion:spellpower-1'),
        createCardInstance('minion:berserker'),
        createCardInstance('spell:bolt'),
        createCardInstance('minion:vanilla-2-3'),
      ].map((c) => ({ ...c, owner: Players.PLAYER }));
    }

    // Opponent deck (always default for now)
    ns.players.opponent.deck = [
      createCardInstance('minion:vanilla-2-3'),
      createCardInstance('minion:taunt-2-2'),
      createCardInstance('minion:windfury-1-3'),
      createCardInstance('minion:shield-3-1'),
      createCardInstance('minion:vanilla-2-3'),
    ].map((c) => ({ ...c, owner: Players.OPPONENT }));

    // Simple shuffle
    ns.players.player.deck = shuffle(ns.players.player.deck);
    ns.players.opponent.deck = shuffle(ns.players.opponent.deck);
  });
  s = drawCards(s, Players.PLAYER, 5);
  s = drawCards(s, Players.OPPONENT, 5);
  s = beginTurn(s, s.activePlayer);
  return s;
}

export function drawCards(state, playerId, n = 1) {
  let s = state;
  for (let i = 0; i < n; i++) s = drawOne(s, playerId);
  return s;
}

export function drawOne(state, playerId) {
  const player = state.players[playerId];

  // Fatigue mechanic: if deck is empty, take increasing damage
  if (player.deck.length === 0) {
    const fatigueCount = player.effects.combat?.fatigueCount || 0;
    const damage = fatigueCount + 1;

    let s = dealDamageToHero(
      state,
      playerId,
      damage,
      `${playerId} takes ${damage} fatigue damage`
    );

    s = withState(s, (ns) => {
      ns.players[playerId].effects.combat.fatigueCount = damage;
    });

    // Check if game is over after fatigue damage
    s = checkGameOver(s);
    return s;
  }

  // Normal draw logic
  const top = player.deck.shift();
  return withState(state, (ns) => {
    ns.players[playerId].hand.push(top);
    pushLog(ns, `${playerId} draws ${top.name}`);
  });
}

export function beginTurn(state, playerId) {
  let s = withState(state, (ns) => {
    ns.activePlayer = playerId;
    ns.phase = Phases.START;
    const p = ns.players[playerId];
    p.mana.max = Math.min(10, p.mana.max + 1);
    p.mana.current = p.mana.max;
    // Refresh minions
    p.board.forEach((m) => {
      m.summoningSickness = false;
      // windfury grants 2 attacks; otherwise 1
      m.remainingAttacks = m.keywords?.windfury ? 2 : 1;
      m.canAttack = m.remainingAttacks > 0;
    });
    ns.pending.aiDoneTurn = false;
  });
  s = runStartOfTurnTriggers(s, playerId);
  // Draw a card at the start of turn (or take fatigue damage if deck is empty)
  s = drawOne(s, playerId);
  s = withState(s, (ns) => {
    ns.phase = Phases.MAIN;
  });
  return s;
}

export function endTurn(state) {
  const current = state.activePlayer;
  let s = withState(state, (ns) => {
    ns.phase = Phases.END;
  });
  s = runEndOfTurnTriggers(s, current);
  const nextPlayer = current === Players.PLAYER ? Players.OPPONENT : Players.PLAYER;
  s = withState(s, (ns) => {
    ns.turn += current === Players.OPPONENT ? 1 : 0; // increment on full round if desired
  });
  s = beginTurn(s, nextPlayer);
  return s;
}

export function canPlayCard(state, playerId, handIndex) {
  const p = state.players[playerId];
  const card = p.hand[handIndex];
  if (!card) return false;
  const cost = card.cost ?? card.stats?.cost ?? 0;
  return p.mana.current >= cost;
}

export function playCardFromHand(state, playerId, handIndex) {
  if (!canPlayCard(state, playerId, handIndex)) return state;
  const p = state.players[playerId];
  const card = p.hand[handIndex];
  const cost = card.cost ?? card.stats?.cost ?? 0;
  let s = withState(state, (ns) => {
    ns.players[playerId].mana.current -= cost;
    ns.players[playerId].hand.splice(handIndex, 1);
  });
  const def = CARDS[card.cardId];
  if (def.type === 'minion') {
    return summonMinion(s, playerId, card);
  }
  if (def.type === 'spell') {
    return resolveSpell(s, playerId, card);
  }
  return s;
}

export function summonMinion(state, playerId, minionInstance) {
  let s = withState(state, (ns) => {
    const m = { ...minionInstance, owner: playerId, summoningSickness: true, canAttack: false };
    ns.players[playerId].board.push(m);
    pushLog(ns, `${ns.players[playerId].name} summons ${m.name}`);
  });
  // Fire onSummon for the minion just placed
  const idx = s.players[playerId].board.length - 1;
  s = runOnSummonTriggers(s, playerId, idx);
  return s;
}

export function resolveSpell(state, playerId, spellInstance) {
  // Minimal: deal damage to enemy hero if no selection
  const base = spellInstance.effect?.amount ?? 0;
  const spellPower = state.players[playerId].board.reduce((sum, m) => sum + (m.keywords?.spellDamage || 0), 0);
  const amount = base + spellPower;
  const enemyId = playerId === Players.PLAYER ? Players.OPPONENT : Players.PLAYER;
  let s = dealDamageToHero(state, enemyId, amount, `${spellInstance.name} hits hero for ${amount}`);
  // Check if game is over after spell damage
  s = checkGameOver(s);
  return s;
}

export function dealDamageToHero(state, playerId, amount, msg) {
  return withState(state, (ns) => {
    ns.players[playerId].life -= amount;
    pushLog(ns, msg || `${playerId} takes ${amount} damage`);
  });
}

// Check if game is over (victory or defeat)
export function checkGameOver(state) {
  // Check if opponent is defeated (victory)
  if (state.players[Players.OPPONENT].life <= 0) {
    pushLog(state, '🎉 Victory! The opponent has been defeated!');
    return onCombatVictory(state);
  }

  // Check if player is defeated (defeat) - for now just log, could add defeat screen later
  if (state.players[Players.PLAYER].life <= 0) {
    pushLog(state, '💀 Defeat! You have been defeated.');
    // For now, just return state - could add defeat screen later
    return state;
  }

  // Game continues
  return state;
}

export function healHero(state, playerId, amount, msg) {
  return withState(state, (ns) => {
    ns.players[playerId].life += amount;
    pushLog(ns, msg || `${playerId} heals ${amount}`);
  });
}

export function canAttack(state, playerId, attackerIndex) {
  const m = state.players[playerId].board[attackerIndex];
  return Boolean(m && m.canAttack && !m.summoningSickness && m.attack > 0);
}

export function declareAttack(state, playerId, attackerIndex) {
  if (!canAttack(state, playerId, attackerIndex)) return state;
  return withState(state, (ns) => {
    ns.pending.selection = { type: 'attack', attackerIndex, playerId };
  });
}

export function attackTarget(state, playerId, attackerIndex, target) {
  // target: { type: 'minion'|'hero', index? }
  const enemyId = playerId === Players.PLAYER ? Players.OPPONENT : Players.PLAYER;
  let s = state;
  const attacker = s.players[playerId].board[attackerIndex];
  if (!attacker || !attacker.canAttack) return s;

  // Taunt enforcement: if enemy has any taunt minion, must target a taunt minion
  const enemyTaunts = s.players[enemyId].board.filter((m) => m.keywords?.taunt).length;
  if (enemyTaunts > 0) {
    if (!(target.type === 'minion' && s.players[enemyId].board[target.index]?.keywords?.taunt)) {
      return s; // illegal target when taunt is present
    }
  }

  // onAttack triggers for attacker
  s = runOnAttackTriggers(s, playerId, attackerIndex);

  if (target.type === 'hero') {
    const dmg = attacker.attack;
    s = dealDamageToHero(s, enemyId, dmg, `${attacker.name} hits ${enemyId} for ${dmg}`);
    // lifesteal
    if (attacker.keywords?.lifesteal) {
      s = healHero(s, playerId, dmg, `${attacker.name} lifesteals ${dmg}`);
    }
  } else if (target.type === 'minion') {
    s = withState(s, (ns) => {
      const a = ns.players[playerId].board[attackerIndex];
      const d = ns.players[enemyId].board[target.index];
      if (!a || !d) return;
      const aAtk = a.attack;
      const dAtk = d.attack;
      let dealtToD = aAtk;
      let dealtToA = dAtk;
      // Divine shield prevents first damage and pops the shield
      if (d.keywords?.divineShield) {
        dealtToD = 0;
        d.keywords.divineShield = false;
        pushLog(ns, `${d.name}'s shield breaks!`);
      }
      if (a.keywords?.divineShield) {
        dealtToA = 0;
        a.keywords.divineShield = false;
        pushLog(ns, `${a.name}'s shield breaks!`);
      }
      d.health -= dealtToD;
      a.health -= dealtToA;
      pushLog(ns, `${a.name} trades with ${d.name} (${a.attack}/${a.health} vs ${d.attack}/${d.health})`);
      // lifesteal heals equal to actual damage dealt
      if (a.keywords?.lifesteal && dealtToD > 0) {
        ns.players[playerId].life += dealtToD;
        pushLog(ns, `${a.name} lifesteals ${dealtToD}`);
      }
    });
    // onDamage triggers for both if they took damage and survived
    const dNow = s.players[enemyId].board[target.index];
    if (dNow) s = runOnDamageTriggers(s, enemyId, target.index);
    const aNow = s.players[playerId].board[attackerIndex];
    if (aNow) s = runOnDamageTriggers(s, playerId, attackerIndex);
    s = cleanupDead(s);
  }
  s = withState(s, (ns) => {
    const a = ns.players[playerId].board[attackerIndex];
    if (a) {
      a.remainingAttacks = Math.max(0, (a.remainingAttacks ?? 0) - 1);
      a.canAttack = a.remainingAttacks > 0;
    }
    ns.pending.selection = null;
  });
  // Check if game is over after attack
  s = checkGameOver(s);
  return s;
}

function runOnDamageIfAlive(state, ownerId, index) {
  if (!state.players[ownerId].board[index]) return state;
  return runOnDamageTriggers(state, ownerId, index);
}

export function cleanupDead(state) {
  let s = state;
  [Players.PLAYER, Players.OPPONENT].forEach((pid) => {
    // Collect dead first so onDeath triggers can reference the minion
    const dead = s.players[pid].board
      .map((m, i) => ({ m, i }))
      .filter(({ m }) => m.health <= 0)
      .map(({ m }) => m);
    dead.forEach((m) => {
      s = withState(s, (ns) => pushLog(ns, `${m.name} dies`));
      s = runOnDeathTriggers(s, pid, m);
    });
    // Remove dead
    s = withState(s, (ns) => {
      ns.players[pid].board = ns.players[pid].board.filter((m) => m.health > 0);
    });
  });
  return s;
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
