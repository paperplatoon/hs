/**
 * Animated Combat
 *
 * Wraps game actions with animations. This module handles the choreography
 * of playing animations before/after state changes.
 *
 * Key insight: We capture element positions BEFORE state changes,
 * then animate using those positions even after DOM updates.
 */

import { Players } from '../state.js';
import { attackTarget, endTurn, canPlayCard, playCardFromHand, beginTurn } from '../engine/actions.js';
import { KeywordHandlers } from '../triggers/registry.js';
import { createAnimationQueue } from './queue.js';
import { playAnimation, attackDescriptor, growDescriptor, buffDescriptor } from './player.js';
import {
  findMinionElement,
  findHeroElement,
  findBattlefield,
  getElementTop,
  createGhost,
  animateToward,
  animateReturn,
} from './geometry.js';
import { shake, flash, wait } from './primitives.js';

// Module-level queue for animations
let animationQueue = createAnimationQueue();

/**
 * Get the current animation queue (for external access if needed)
 */
export function getAnimationQueue() {
  return animationQueue;
}

/**
 * Reset the animation queue (call between combats)
 */
export function resetAnimationQueue() {
  animationQueue = createAnimationQueue();
}

/**
 * Perform an attack with animation
 * This captures positions, plays animation, then returns updated state
 *
 * @param {Object} state - Current game state
 * @param {string} playerId - Attacker's player ID
 * @param {number} attackerIndex - Index of attacking minion
 * @param {Object} target - Target { type: 'minion'|'hero', index? }
 * @param {Function} setState - State setter function
 * @returns {Promise<Object>} - New state after attack
 */
export async function animatedAttack(state, playerId, attackerIndex, target, setState) {
  const enemyId = playerId === Players.PLAYER ? Players.OPPONENT : Players.PLAYER;
  const battlefield = findBattlefield();

  // Find elements and capture positions BEFORE state change
  const attackerEl = findMinionElement(playerId, attackerIndex);
  let targetEl;
  if (target.type === 'hero') {
    targetEl = findHeroElement(enemyId);
  } else {
    targetEl = findMinionElement(enemyId, target.index);
  }

  if (attackerEl && targetEl && battlefield) {
    // Capture positions
    const attackerPos = getElementTop(attackerEl, battlefield);
    const targetPos = getElementTop(targetEl, battlefield);

    // Play attack animation (using captured positions)
    await playAttackAnimation(attackerEl, targetEl, attackerPos, targetPos, battlefield);
  }

  // Now update state
  const newState = attackTarget(state, playerId, attackerIndex, target);

  // Use setState to trigger re-render
  if (setState) {
    setState(() => newState);
  }

  return newState;
}

/**
 * Play attack animation using captured positions
 * This creates a ghost that animates independently of DOM updates
 */
async function playAttackAnimation(attackerEl, targetEl, attackerPos, targetPos, battlefield) {
  // Windup
  attackerEl.classList.add('u-windup');
  await wait(140);
  attackerEl.classList.remove('u-windup');

  // Hide the original card so it looks like the ghost IS the card
  attackerEl.style.opacity = '0';

  // Create ghost at attacker position
  const ghost = createGhost(attackerEl, battlefield, attackerPos);

  // Calculate attack path
  const dx = targetPos.x - attackerPos.x;
  const dy = targetPos.y - attackerPos.y;
  const travelPercent = 0.65;
  const peakX = attackerPos.x + dx * travelPercent;
  const peakY = attackerPos.y + dy * travelPercent;

  // Very slight tilt toward target (max ~5 degrees)
  const angle = Math.atan2(dy, dx);
  const tilt = Math.max(-0.08, Math.min(0.08, angle * 0.1));

  // Single smooth animation: lunge out and back
  await new Promise((resolve) => {
    const anim = ghost.animate([
      // Start position
      { transform: `translate(${attackerPos.x}px, ${attackerPos.y}px) rotate(0rad) scale(1)`, offset: 0 },
      // Lunge toward target (with slight tilt and scale up)
      { transform: `translate(${peakX}px, ${peakY}px) rotate(${tilt}rad) scale(1.05)`, offset: 0.4 },
      // Hold at peak briefly for impact
      { transform: `translate(${peakX}px, ${peakY}px) rotate(${tilt}rad) scale(1.05)`, offset: 0.5 },
      // Return to start
      { transform: `translate(${attackerPos.x}px, ${attackerPos.y}px) rotate(0rad) scale(1)`, offset: 1 },
    ], {
      duration: 450,
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      fill: 'forwards',
    });

    // Trigger impact effects partway through
    setTimeout(() => {
      if (targetEl && document.body.contains(targetEl)) {
        flash(targetEl);
        shake(targetEl);
      }
    }, 450 * 0.45); // At the peak

    anim.onfinish = resolve;
    anim.oncancel = resolve;
  });

  // Remove ghost and show original card
  ghost.remove();
  attackerEl.style.opacity = '';
}

/**
 * Execute end-of-turn triggers with animations (left to right)
 *
 * @param {Object} state - Current game state
 * @param {string} playerId - Player whose turn is ending
 * @param {Function} setState - State setter function
 * @returns {Promise<Object>} - New state after triggers
 */
export async function animatedEndOfTurnTriggers(state, playerId, setState) {
  let s = state;
  const board = s.players[playerId].board;

  // Process each minion left to right
  for (let idx = 0; idx < board.length; idx++) {
    const m = s.players[playerId].board[idx];
    if (!m) continue;

    const triggers = m.triggers?.endOfTurn || [];
    if (triggers.length === 0) continue;

    for (const t of triggers) {
      if (t.ownerOnly && m.owner !== playerId) continue;

      const handler = KeywordHandlers[t.keyword];
      if (!handler) continue;

      // Play animation BEFORE state change
      if (t.keyword === 'growing' && m.keywords?.growing) {
        const { attack = 1, health = 1 } = m.keywords.growing;
        await playAnimation(growDescriptor(playerId, idx, attack, health));
      } else {
        // Generic trigger pulse for other effects
        await playAnimation({ type: 'trigger', playerId, minionIndex: idx });
      }

      // Apply the trigger effect
      const ctx = {
        ownerId: playerId,
        minionIndex: idx,
        ...(m.keywords?.[t.keyword] || {}),
        ...(t.params || {}),
      };
      s = handler(s, ctx);

      // Update state to reflect changes
      setState(() => s);

      // Brief pause between triggers
      await wait(150);
    }
  }

  return s;
}

/**
 * Animated end turn - processes end-of-turn triggers with animations, then switches player
 *
 * @param {Object} state - Current game state
 * @param {Function} setState - State setter function
 * @returns {Promise<Object>} - New state after turn ends
 */
export async function animatedEndTurn(state, setState) {
  const current = state.activePlayer;

  // Run end-of-turn triggers with animations
  let s = await animatedEndOfTurnTriggers(state, current, setState);

  // Switch to next player
  const nextPlayer = current === Players.PLAYER ? Players.OPPONENT : Players.PLAYER;
  s = beginTurn(s, nextPlayer);

  setState(() => s);
  return s;
}

/**
 * Execute enemy turn with animations
 * Plans all actions first, then executes them with sequential animations
 *
 * @param {Object} state - Current game state
 * @param {Function} setState - State setter function
 * @returns {Promise<Object>} - Final state after enemy turn
 */
export async function animatedEnemyTurn(state, setState) {
  if (state.activePlayer !== Players.OPPONENT) return state;
  if (state.pending.aiDoneTurn) return state;

  // Mark AI turn as started IMMEDIATELY to prevent re-triggering during async operations
  let s = { ...state, pending: { ...state.pending, aiDoneTurn: true } };
  setState(() => s);

  // Phase 1: Play cards (instant for now, could add summon animations later)
  s = playEnemyCards(s);

  // Intermediate render to show played cards
  setState(() => s);
  await wait(300); // Brief pause to see summoned minions

  // Phase 2: Execute attacks with animations (left to right)
  s = await executeEnemyAttacks(s, setState);

  // Phase 3: End turn with animations (triggers end-of-turn effects)
  s = await animatedEndTurn(s, setState);

  return s;
}

/**
 * Play all affordable cards for enemy (no animations yet)
 */
function playEnemyCards(state) {
  let s = state;
  let played = true;

  while (played) {
    played = false;
    const p = s.players[Players.OPPONENT];
    const choices = p.hand
      .map((c, i) => ({ c, i }))
      .filter(({ i }) => canPlayCard(s, Players.OPPONENT, i));

    if (choices.length === 0) break;

    // Prefer minions first
    const byType = choices.sort((a, b) => {
      const typeA = a.c.cardId.startsWith('minion') ? 0 : 1;
      const typeB = b.c.cardId.startsWith('minion') ? 0 : 1;
      return typeA - typeB || a.i - b.i;
    });

    const pick = byType[0];
    s = playCardFromHand(s, Players.OPPONENT, pick.i);
    played = true;
  }

  return s;
}

/**
 * Execute enemy attacks with sequential animations (left to right)
 */
async function executeEnemyAttacks(state, setState) {
  let s = state;
  const enemyId = Players.PLAYER;

  // Iterate through enemy minions left to right
  for (let idx = 0; idx < s.players[Players.OPPONENT].board.length; idx++) {
    let m = s.players[Players.OPPONENT].board[idx];

    // Each minion attacks while it can
    while (m && m.canAttack && !m.summoningSickness) {
      // Pick target
      const enemyBoard = s.players[enemyId].board;
      const taunts = enemyBoard
        .map((mm, ii) => ({ mm, ii }))
        .filter(({ mm }) => mm.keywords?.taunt);

      let target;
      if (taunts.length > 0) {
        const t = taunts.sort((a, b) => a.mm.health - b.mm.health)[0];
        target = { type: 'minion', index: t.ii };
      } else if (enemyBoard.length > 0) {
        const t = enemyBoard
          .map((mm, ii) => ({ mm, ii }))
          .sort((a, b) => a.mm.health - b.mm.health)[0];
        target = { type: 'minion', index: t.ii };
      } else {
        target = { type: 'hero' };
      }

      // Execute attack with animation
      s = await animatedAttack(s, Players.OPPONENT, idx, target, setState);

      // Brief pause between attacks
      await wait(200);

      // Re-fetch minion (may have died or changed)
      m = s.players[Players.OPPONENT].board[idx];
      if (!m) break;
    }
  }

  return s;
}

/**
 * Create a wrapped setState that allows animation insertion
 * This is used to coordinate animations with state updates
 */
export function createAnimatedSetState(baseSetState) {
  return async (updater, animations = []) => {
    // If animations provided, play them first
    if (animations.length > 0) {
      for (const anim of animations) {
        await playAnimation(anim);
      }
    }

    // Then update state
    baseSetState(updater);
  };
}
