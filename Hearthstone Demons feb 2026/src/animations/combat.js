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
import { attackTarget, endTurn, canPlayCard, playCardFromHand, beginTurn, useHeroPower, canUseHeroPower } from '../engine/actions.js';
import { HERO_POWERS } from '../characters/schema.js';
import { KeywordHandlers } from '../triggers/registry.js';
import { createAnimationQueue } from './queue.js';
import { playAnimation, attackDescriptor, growDescriptor, buffDescriptor } from './player.js';
import {
  findMinionElement,
  findHeroElement,
  findBattlefield,
  getElementTop,
  getElementCenter,
  createGhost,
  createProjectile,
  animateProjectile,
  animateToward,
  animateReturn,
} from './geometry.js';
import { shake, flash, wait, fadeIn, pulse, damageFlash } from './primitives.js';

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

  // Capture info for shield break / lifesteal animations
  const attacker = state.players[playerId].board[attackerIndex];
  const defenderPlayerId = playerId === Players.PLAYER ? Players.OPPONENT : Players.PLAYER;
  let defender = null;
  let defenderHadShield = false;
  let attackerHadShield = false;

  if (target.type === 'minion') {
    defender = state.players[defenderPlayerId].board[target.index];
    defenderHadShield = defender?.keywords?.divineShield || false;
    attackerHadShield = attacker?.keywords?.divineShield || false;
  }

  const attackerHasLifesteal = attacker?.keywords?.lifesteal || false;
  const attackerDamage = attacker?.attack || 0;

  // Apply damage but DON'T cleanup dead yet (we'll animate deaths)
  let newState = attackTarget(state, playerId, attackerIndex, target, { skipCleanup: true });

  // Check for divine shield breaks and animate
  if (target.type === 'minion') {
    const newDefender = newState.players[defenderPlayerId].board[target.index];
    const newAttacker = newState.players[playerId].board[attackerIndex];

    if (defenderHadShield && newDefender && !newDefender.keywords?.divineShield) {
      await animateShieldBreak(defenderPlayerId, target.index);
    }
    if (attackerHadShield && newAttacker && !newAttacker.keywords?.divineShield) {
      await animateShieldBreak(playerId, attackerIndex);
    }
  }

  // Animate lifesteal if applicable
  if (attackerHasLifesteal && attackerDamage > 0) {
    // Only animate if damage was actually dealt (not blocked by shield)
    const damageDealt = defenderHadShield ? 0 : attackerDamage;
    if (damageDealt > 0) {
      await animateLifesteal(playerId, attackerIndex, damageDealt);
    }
  }

  // Now animate any deaths, then cleanup
  newState = await animateDeaths(newState, setState);

  // Check game over
  const { checkGameOver } = await import('../engine/actions.js');
  newState = checkGameOver(newState);

  // Final state update
  if (setState) {
    setState(() => newState);
  }

  return newState;
}

/**
 * Animate deaths for any minions with health <= 0
 * Call this BEFORE cleanupDead to capture positions
 *
 * @param {Object} state - Current game state (before cleanup)
 * @param {Function} setState - State setter
 * @returns {Promise<Object>} - State after deaths processed
 */
export async function animateDeaths(state, setState) {
  const battlefield = findBattlefield();
  if (!battlefield) {
    // No battlefield, just do cleanup
    const { cleanupDead } = await import('../engine/actions.js');
    return cleanupDead(state);
  }

  // Find all dead minions and capture their elements/positions
  const deadInfos = [];

  [Players.PLAYER, Players.OPPONENT].forEach((playerId) => {
    state.players[playerId].board.forEach((m, idx) => {
      if (m.health <= 0) {
        const el = findMinionElement(playerId, idx);
        if (el) {
          const pos = getElementTop(el, battlefield);
          deadInfos.push({
            playerId,
            index: idx,
            minion: m,
            element: el,
            position: pos,
          });
        }
      }
    });
  });

  // If no deaths, just cleanup
  if (deadInfos.length === 0) {
    const { cleanupDead } = await import('../engine/actions.js');
    return cleanupDead(state);
  }

  // Create ghosts for dead minions BEFORE state update
  const ghosts = deadInfos.map(({ element, position }) => {
    const ghost = createGhost(element, battlefield, position);
    // Hide original immediately
    element.style.opacity = '0';
    return ghost;
  });

  // Now update state (removes dead minions, runs death triggers)
  const { cleanupDead } = await import('../engine/actions.js');
  const newState = cleanupDead(state);
  setState(() => newState);

  // Animate all death ghosts simultaneously
  await Promise.all(ghosts.map((ghost) => animateDeath(ghost)));

  // Clean up ghosts
  ghosts.forEach((g) => g.remove());

  return newState;
}

/**
 * Animate a single death ghost
 */
async function animateDeath(ghost) {
  // Red flash + shake + fade out
  await new Promise((resolve) => {
    const anim = ghost.animate([
      { opacity: 1, transform: ghost.style.transform + ' scale(1)', filter: 'brightness(1)' },
      { opacity: 1, transform: ghost.style.transform + ' scale(1.05)', filter: 'brightness(1.5) saturate(0.5)', offset: 0.2 },
      { opacity: 0.8, transform: ghost.style.transform + ' scale(1) translateX(-3px)', filter: 'brightness(1.2)', offset: 0.35 },
      { opacity: 0.6, transform: ghost.style.transform + ' scale(0.98) translateX(3px)', filter: 'brightness(1)', offset: 0.5 },
      { opacity: 0.3, transform: ghost.style.transform + ' scale(0.95) translateX(-2px)', offset: 0.7 },
      { opacity: 0, transform: ghost.style.transform + ' scale(0.9) translateY(10px)', offset: 1 },
    ], {
      duration: 400,
      easing: 'ease-out',
      fill: 'forwards',
    });
    anim.onfinish = resolve;
    anim.oncancel = resolve;
  });
}

/**
 * Animate a warcry effect (buff projectile to random ally)
 */
export async function animateWarcry(sourcePlayerId, sourceIndex, targetIndex) {
  const battlefield = findBattlefield();
  if (!battlefield) return;

  const sourceEl = findMinionElement(sourcePlayerId, sourceIndex);
  const targetEl = findMinionElement(sourcePlayerId, targetIndex);
  if (!sourceEl || !targetEl) return;

  // Pulse source
  pulse(sourceEl, 200);

  // Projectile from source to target
  const projectile = createProjectile('buff', battlefield);
  const fromPos = getElementCenter(sourceEl, battlefield);
  const toPos = getElementCenter(targetEl, battlefield);
  await animateProjectile(projectile, fromPos, toPos, 250);

  // Glow on target
  targetEl.style.boxShadow = '0 0 20px var(--shield), 0 0 40px var(--shield)';
  await wait(300);
  targetEl.style.boxShadow = '';
}

/**
 * Animate a snipe effect (damage projectile to enemy)
 */
export async function animateSnipe(sourcePlayerId, sourceIndex, targetPlayerId, targetIndex, targetType = 'minion') {
  const battlefield = findBattlefield();
  if (!battlefield) return;

  const sourceEl = findMinionElement(sourcePlayerId, sourceIndex);
  const targetEl = targetType === 'hero'
    ? findHeroElement(targetPlayerId)
    : findMinionElement(targetPlayerId, targetIndex);
  if (!sourceEl || !targetEl) return;

  // Flash source
  flash(sourceEl);

  // Projectile from source to target
  const projectile = createProjectile('fireball', battlefield);
  const fromPos = getElementCenter(sourceEl, battlefield);
  const toPos = getElementCenter(targetEl, battlefield);
  await animateProjectile(projectile, fromPos, toPos, 200);

  // Impact on target
  await Promise.all([flash(targetEl), shake(targetEl)]);
}

/**
 * Animate a bolster effect (expanding wave to all allies)
 */
export async function animateBolster(sourcePlayerId, sourceIndex) {
  const battlefield = findBattlefield();
  if (!battlefield) return;

  const sourceEl = findMinionElement(sourcePlayerId, sourceIndex);
  if (!sourceEl) return;

  // Create expanding ring from source
  const sourcePos = getElementCenter(sourceEl, battlefield);

  const ring = document.createElement('div');
  ring.style.cssText = `
    position: absolute;
    left: ${sourcePos.x}px;
    top: ${sourcePos.y}px;
    width: 0;
    height: 0;
    border: 3px solid var(--shield);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
    z-index: 100;
    box-shadow: 0 0 10px var(--shield);
  `;
  battlefield.appendChild(ring);

  // Animate ring expanding
  await new Promise((resolve) => {
    const anim = ring.animate([
      { width: '0px', height: '0px', opacity: 1 },
      { width: '400px', height: '400px', opacity: 0 },
    ], { duration: 400, easing: 'ease-out' });
    anim.onfinish = resolve;
  });

  ring.remove();

  // Glow all allies except source
  const board = document.querySelectorAll(`[data-card-owner="${sourcePlayerId}"][data-zone="board"]`);
  board.forEach((el, idx) => {
    if (idx !== sourceIndex) {
      el.style.boxShadow = '0 0 15px var(--shield)';
      setTimeout(() => { el.style.boxShadow = ''; }, 400);
    }
  });
  await wait(300);
}

/**
 * Animate a deluge effect (shockwave damaging all enemies)
 */
export async function animateDeluge(sourcePlayerId, sourceIndex) {
  const battlefield = findBattlefield();
  if (!battlefield) return;

  const sourceEl = findMinionElement(sourcePlayerId, sourceIndex);
  if (!sourceEl) return;

  const enemyId = sourcePlayerId === Players.PLAYER ? Players.OPPONENT : Players.PLAYER;

  // Create shockwave from source
  const sourcePos = getElementCenter(sourceEl, battlefield);

  const wave = document.createElement('div');
  wave.style.cssText = `
    position: absolute;
    left: ${sourcePos.x}px;
    top: ${sourcePos.y}px;
    width: 0;
    height: 0;
    border: 4px solid var(--danger);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
    z-index: 100;
    box-shadow: 0 0 15px var(--danger);
  `;
  battlefield.appendChild(wave);

  // Animate wave expanding
  await new Promise((resolve) => {
    const anim = wave.animate([
      { width: '0px', height: '0px', opacity: 1 },
      { width: '500px', height: '500px', opacity: 0 },
    ], { duration: 350, easing: 'ease-out' });
    anim.onfinish = resolve;
  });

  wave.remove();

  // Shake all enemies
  const enemyBoard = document.querySelectorAll(`[data-card-owner="${enemyId}"][data-zone="board"]`);
  await Promise.all([...enemyBoard].map((el) => shake(el)));
}

/**
 * Animate an inferno effect (shockwave damaging all enemies including hero)
 */
export async function animateInferno(sourcePlayerId, sourceIndex) {
  const battlefield = findBattlefield();
  if (!battlefield) return;

  const sourceEl = findMinionElement(sourcePlayerId, sourceIndex);
  if (!sourceEl) return;

  const enemyId = sourcePlayerId === Players.PLAYER ? Players.OPPONENT : Players.PLAYER;

  // Create fiery shockwave from source
  const sourcePos = getElementCenter(sourceEl, battlefield);

  const wave = document.createElement('div');
  wave.style.cssText = `
    position: absolute;
    left: ${sourcePos.x}px;
    top: ${sourcePos.y}px;
    width: 0;
    height: 0;
    border: 4px solid #ff4500;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
    z-index: 100;
    box-shadow: 0 0 20px #ff4500, 0 0 40px #ff6600;
    background: radial-gradient(circle, rgba(255,69,0,0.3) 0%, transparent 70%);
  `;
  battlefield.appendChild(wave);

  // Animate wave expanding with a more fiery effect
  await new Promise((resolve) => {
    const anim = wave.animate([
      { width: '0px', height: '0px', opacity: 1 },
      { width: '600px', height: '600px', opacity: 0 },
    ], { duration: 400, easing: 'ease-out' });
    anim.onfinish = resolve;
  });

  wave.remove();

  // Shake all enemies (minions AND hero)
  const enemyBoard = document.querySelectorAll(`[data-card-owner="${enemyId}"][data-zone="board"]`);
  const heroEl = findHeroElement(enemyId);

  const shakePromises = [...enemyBoard].map((el) => shake(el));
  if (heroEl) shakePromises.push(shake(heroEl));

  await Promise.all(shakePromises);
}

/**
 * Animate a flock effect (buff spreading to same-tribe minions)
 */
export async function animateFlock(sourcePlayerId, sourceIndex, element) {
  const battlefield = findBattlefield();
  if (!battlefield) return;

  const sourceEl = findMinionElement(sourcePlayerId, sourceIndex);
  if (!sourceEl) return;

  // Create wind swirl from source
  const sourcePos = getElementCenter(sourceEl, battlefield);

  const swirl = document.createElement('div');
  swirl.style.cssText = `
    position: absolute;
    left: ${sourcePos.x}px;
    top: ${sourcePos.y}px;
    width: 30px;
    height: 30px;
    border: 3px solid #87ceeb;
    border-radius: 50%;
    border-top-color: transparent;
    transform: translate(-50%, -50%);
    pointer-events: none;
    z-index: 100;
    box-shadow: 0 0 15px #87ceeb;
  `;
  battlefield.appendChild(swirl);

  // Spin and expand
  await new Promise((resolve) => {
    const anim = swirl.animate([
      { width: '30px', height: '30px', opacity: 1, transform: 'translate(-50%, -50%) rotate(0deg)' },
      { width: '200px', height: '200px', opacity: 0, transform: 'translate(-50%, -50%) rotate(720deg)' },
    ], { duration: 400, easing: 'ease-out' });
    anim.onfinish = resolve;
  });

  swirl.remove();

  // Glow all same-tribe minions
  const allMinions = document.querySelectorAll(`[data-card-owner="${sourcePlayerId}"][data-zone="board"]`);
  const glowPromises = [...allMinions].map((el, idx) => {
    if (idx !== sourceIndex) {
      el.style.boxShadow = '0 0 15px #87ceeb';
      return new Promise((r) => setTimeout(() => { el.style.boxShadow = ''; r(); }, 400));
    }
    return Promise.resolve();
  });

  await Promise.all(glowPromises);
}

/**
 * Animate a gust effect (wind swirl to random ally)
 */
export async function animateGust(sourcePlayerId, sourceIndex, targetIndex) {
  const battlefield = findBattlefield();
  if (!battlefield) return;

  const sourceEl = findMinionElement(sourcePlayerId, sourceIndex);
  const targetEl = findMinionElement(sourcePlayerId, targetIndex);
  if (!sourceEl || !targetEl) return;

  const sourcePos = getElementCenter(sourceEl, battlefield);
  const targetPos = getElementCenter(targetEl, battlefield);

  // Create wind particle
  const particle = document.createElement('div');
  particle.style.cssText = `
    position: absolute;
    left: ${sourcePos.x}px;
    top: ${sourcePos.y}px;
    width: 20px;
    height: 20px;
    background: radial-gradient(circle, rgba(135,206,235,0.8) 0%, transparent 70%);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
    z-index: 100;
  `;
  battlefield.appendChild(particle);

  // Animate swirl to target
  await new Promise((resolve) => {
    const anim = particle.animate([
      { left: `${sourcePos.x}px`, top: `${sourcePos.y}px`, transform: 'translate(-50%, -50%) scale(1) rotate(0deg)' },
      { left: `${targetPos.x}px`, top: `${targetPos.y}px`, transform: 'translate(-50%, -50%) scale(1.5) rotate(360deg)' },
    ], { duration: 300, easing: 'ease-in-out' });
    anim.onfinish = resolve;
  });

  particle.remove();

  // Buff glow on target
  targetEl.style.boxShadow = '0 0 20px #87ceeb, 0 0 40px #87ceeb';
  await wait(300);
  targetEl.style.boxShadow = '';
}

/**
 * Animate a rejuvenate effect (green healing pulse across all friendlies + hero)
 */
export async function animateRejuvenate(sourcePlayerId, sourceIndex) {
  const battlefield = findBattlefield();
  if (!battlefield) return;

  const sourceEl = findMinionElement(sourcePlayerId, sourceIndex);
  if (!sourceEl) return;

  const sourcePos = getElementCenter(sourceEl, battlefield);

  // Create green healing wave
  const wave = document.createElement('div');
  wave.style.cssText = `
    position: absolute;
    left: ${sourcePos.x}px;
    top: ${sourcePos.y}px;
    width: 0;
    height: 0;
    border: 3px solid #2ecc71;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
    z-index: 100;
    box-shadow: 0 0 15px #2ecc71;
    background: radial-gradient(circle, rgba(46,204,113,0.2) 0%, transparent 70%);
  `;
  battlefield.appendChild(wave);

  // Animate wave expanding
  await new Promise((resolve) => {
    const anim = wave.animate([
      { width: '0px', height: '0px', opacity: 1 },
      { width: '500px', height: '500px', opacity: 0 },
    ], { duration: 400, easing: 'ease-out' });
    anim.onfinish = resolve;
  });

  wave.remove();

  // Green glow on all friendlies + hero
  const friendlyMinions = document.querySelectorAll(`[data-card-owner="${sourcePlayerId}"][data-zone="board"]`);
  const heroEl = findHeroElement(sourcePlayerId);

  const glowPromises = [...friendlyMinions].map((el) => {
    el.style.boxShadow = '0 0 15px #2ecc71';
    return new Promise((r) => setTimeout(() => { el.style.boxShadow = ''; r(); }, 300));
  });

  if (heroEl) {
    heroEl.style.boxShadow = '0 0 15px #2ecc71';
    glowPromises.push(new Promise((r) => setTimeout(() => { heroEl.style.boxShadow = ''; r(); }, 300)));
  }

  await Promise.all(glowPromises);
}

/**
 * Animate a mend effect (targeted heal to most damaged)
 */
export async function animateMend(sourcePlayerId, sourceIndex, targetIndex) {
  const battlefield = findBattlefield();
  if (!battlefield) return;

  const sourceEl = findMinionElement(sourcePlayerId, sourceIndex);
  const targetEl = findMinionElement(sourcePlayerId, targetIndex);
  if (!sourceEl || !targetEl) return;

  const sourcePos = getElementCenter(sourceEl, battlefield);
  const targetPos = getElementCenter(targetEl, battlefield);

  // Create healing particle
  const particle = document.createElement('div');
  particle.style.cssText = `
    position: absolute;
    left: ${sourcePos.x}px;
    top: ${sourcePos.y}px;
    width: 15px;
    height: 15px;
    background: #2ecc71;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
    z-index: 100;
    box-shadow: 0 0 10px #2ecc71, 0 0 20px #2ecc71;
  `;
  battlefield.appendChild(particle);

  // Animate to target
  await new Promise((resolve) => {
    const anim = particle.animate([
      { left: `${sourcePos.x}px`, top: `${sourcePos.y}px`, transform: 'translate(-50%, -50%) scale(1)' },
      { left: `${targetPos.x}px`, top: `${targetPos.y}px`, transform: 'translate(-50%, -50%) scale(1.5)' },
    ], { duration: 250, easing: 'ease-in-out' });
    anim.onfinish = resolve;
  });

  particle.remove();

  // Strong green glow on healed target
  targetEl.style.boxShadow = '0 0 25px #2ecc71, inset 0 0 20px rgba(46,204,113,0.3)';
  await wait(400);
  targetEl.style.boxShadow = '';
}

/**
 * Animate a spell being cast
 */
export async function animateSpellCast(casterId, targetPlayerId, targetType, targetIndex, spellType = 'bolt') {
  const battlefield = findBattlefield();
  if (!battlefield) return;

  const casterEl = findHeroElement(casterId);
  const targetEl = targetType === 'hero'
    ? findHeroElement(targetPlayerId)
    : findMinionElement(targetPlayerId, targetIndex);

  if (!casterEl || !targetEl) return;

  // Create projectile
  const projectile = createProjectile(spellType, battlefield);
  const fromPos = getElementCenter(casterEl, battlefield);
  const toPos = getElementCenter(targetEl, battlefield);

  await animateProjectile(projectile, fromPos, toPos, 300);

  // Impact
  await Promise.all([flash(targetEl), shake(targetEl)]);
}

/**
 * Animate divine shield breaking
 */
export async function animateShieldBreak(playerId, minionIndex) {
  const minionEl = findMinionElement(playerId, minionIndex);
  if (!minionEl) return;

  // Golden shatter effect
  minionEl.style.boxShadow = '0 0 30px var(--shield), inset 0 0 20px var(--shield)';
  await wait(150);
  minionEl.style.boxShadow = '';

  // Could add particles here in the future
}

/**
 * Animate lifesteal (green healing flow)
 */
export async function animateLifesteal(sourcePlayerId, sourceIndex, amount) {
  const battlefield = findBattlefield();
  if (!battlefield) return;

  const sourceEl = findMinionElement(sourcePlayerId, sourceIndex);
  const heroEl = findHeroElement(sourcePlayerId);
  if (!sourceEl || !heroEl) return;

  // Green projectile from source to hero
  const projectile = createProjectile('heal', battlefield);
  const fromPos = getElementCenter(sourceEl, battlefield);
  const toPos = getElementCenter(heroEl, battlefield);

  await animateProjectile(projectile, fromPos, toPos, 300);

  // Hero glows green
  heroEl.style.boxShadow = '0 0 20px var(--hp), inset 0 0 10px var(--hp)';
  await wait(300);
  heroEl.style.boxShadow = '';
}

/**
 * Play a card from hand with animation
 *
 * @param {Object} state - Current game state
 * @param {string} playerId - Player playing the card
 * @param {number} handIndex - Index of card in hand
 * @param {Function} setState - State setter function
 * @returns {Promise<Object>} - New state after playing card
 */
export async function animatedPlayCard(state, playerId, handIndex, setState) {
  const card = state.players[playerId].hand[handIndex];
  if (!card) return state;

  // Get the board length before playing (to know where new minion will be)
  const boardLengthBefore = state.players[playerId].board.length;
  const isMinion = card.cardId?.startsWith('minion');
  const isSpell = card.cardId?.startsWith('spell');

  // Capture card info for battlecry animations
  const keywords = card.keywords || {};
  const triggers = card.triggers || {};

  // Update state (plays the card)
  const newState = playCardFromHand(state, playerId, handIndex);

  // Trigger re-render
  setState(() => newState);

  // Wait a frame for DOM to update
  await wait(20);

  // If it was a minion, animate the new card appearing
  if (isMinion) {
    const newMinionIndex = boardLengthBefore; // New minion is at end of board
    const minionEl = findMinionElement(playerId, newMinionIndex);

    if (minionEl) {
      // Start invisible
      minionEl.style.opacity = '0';
      minionEl.style.transform = 'scale(0.5)';

      // Animate in
      await new Promise((resolve) => {
        const anim = minionEl.animate([
          { opacity: 0, transform: 'scale(0.5) translateY(20px)' },
          { opacity: 1, transform: 'scale(1.05) translateY(-5px)', offset: 0.7 },
          { opacity: 1, transform: 'scale(1) translateY(0)' },
        ], {
          duration: 350,
          easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)', // Bouncy ease-out
          fill: 'forwards',
        });
        anim.onfinish = () => {
          minionEl.style.opacity = '';
          minionEl.style.transform = '';
          resolve();
        };
        anim.oncancel = resolve;
      });

      // Play battlecry animations based on triggers
      const onSummonTriggers = triggers.onSummon || [];

      for (const t of onSummonTriggers) {
        if (t.keyword === 'warcry' && keywords.warcry) {
          // Find which ally got buffed (compare old state to new state)
          // For now, just animate a generic buff effect on all other allies
          const newBoard = newState.players[playerId].board;
          for (let i = 0; i < newBoard.length; i++) {
            if (i !== newMinionIndex) {
              const ally = newBoard[i];
              const oldAlly = state.players[playerId].board[i];
              if (oldAlly && ally.attack > oldAlly.attack) {
                await animateWarcry(playerId, newMinionIndex, i);
                break; // Warcry only hits one target
              }
            }
          }
        } else if (t.keyword === 'bolster' && keywords.bolster) {
          await animateBolster(playerId, newMinionIndex);
        } else if (t.keyword === 'flock' && keywords.flock) {
          // Flock buffs same-tribe minions
          const summonedMinion = newState.players[playerId].board[newMinionIndex];
          await animateFlock(playerId, newMinionIndex, summonedMinion?.element);
        } else if (t.keyword === 'snipe' && keywords.snipe) {
          // Find which enemy got hit
          const enemyId = playerId === Players.PLAYER ? Players.OPPONENT : Players.PLAYER;
          const oldEnemyBoard = state.players[enemyId].board;
          const newEnemyBoard = newState.players[enemyId].board;
          const oldEnemyLife = state.players[enemyId].life;
          const newEnemyLife = newState.players[enemyId].life;

          // Check if hero was hit
          if (newEnemyLife < oldEnemyLife) {
            await animateSnipe(playerId, newMinionIndex, enemyId, 0, 'hero');
          } else {
            // Check minions for damage
            for (let i = 0; i < oldEnemyBoard.length; i++) {
              const newMinion = newEnemyBoard.find(m => m.uid === oldEnemyBoard[i].uid);
              if (newMinion && newMinion.health < oldEnemyBoard[i].health) {
                const newIdx = newEnemyBoard.indexOf(newMinion);
                await animateSnipe(playerId, newMinionIndex, enemyId, newIdx, 'minion');
                break;
              }
            }
          }
        } else if (t.keyword === 'deluge' && keywords.deluge) {
          await animateDeluge(playerId, newMinionIndex);
        }
      }
    }
  }

  // If it was a spell, animate the cast
  if (isSpell) {
    const enemyId = playerId === Players.PLAYER ? Players.OPPONENT : Players.PLAYER;
    await animateSpellCast(playerId, enemyId, 'hero', 0, 'bolt');
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
      } else if (t.keyword === 'inferno' && m.keywords?.inferno) {
        await animateInferno(playerId, idx);
      } else if (t.keyword === 'gust' && m.keywords?.gust) {
        // Find target for animation (same logic as handler)
        const board = s.players[playerId].board;
        const validIndices = board.map((_, i) => i).filter(i => i !== idx);
        if (validIndices.length > 0) {
          const targetIdx = validIndices[Math.floor(Math.random() * validIndices.length)];
          await animateGust(playerId, idx, targetIdx);
        }
      } else if (t.keyword === 'rejuvenate' && m.keywords?.rejuvenate) {
        await animateRejuvenate(playerId, idx);
      } else if (t.keyword === 'mend' && m.keywords?.mend) {
        // Find most damaged minion for animation (same logic as handler)
        const board = s.players[playerId].board;
        const damagedMinions = board
          .map((minion, i) => ({ minion, i, damage: minion.maxHealth - minion.health }))
          .filter(({ i, damage }) => i !== idx && damage > 0);
        if (damagedMinions.length > 0) {
          damagedMinions.sort((a, b) => a.minion.health - b.minion.health);
          await animateMend(playerId, idx, damagedMinions[0].i);
        }
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

  // Phase 1: Play cards with summon animations
  s = await playEnemyCardsAnimated(s, setState);

  // Phase 2: Use hero power if available
  s = await useEnemyHeroPower(s, setState);

  // Phase 3: Execute attacks with animations (left to right)
  s = await executeEnemyAttacks(s, setState);

  // Phase 4: End turn with animations (triggers end-of-turn effects)
  s = await animatedEndTurn(s, setState);

  return s;
}

/**
 * Use enemy hero power if available (simple AI: always use if possible)
 */
async function useEnemyHeroPower(state, setState) {
  if (!canUseHeroPower(state, Players.OPPONENT)) return state;

  const player = state.players[Players.OPPONENT];
  const power = HERO_POWERS[player.heroPower];

  if (!power) return state;

  const battlefield = findBattlefield();
  const heroEl = findHeroElement(Players.OPPONENT);

  // Hero glows to indicate power activation
  if (heroEl) {
    const effect = power.effect;
    let glowColor = 'var(--gold)';
    if (effect.type === 'healHero') glowColor = 'var(--hp)';
    else if (effect.type === 'damageEnemyHero' || effect.type === 'damageRandomEnemy' || effect.type === 'damageAllEnemies') glowColor = 'var(--orange)';
    else if (effect.type === 'summon') glowColor = 'var(--highlight)';

    heroEl.style.boxShadow = `0 0 25px ${glowColor}, inset 0 0 15px ${glowColor}`;
    await wait(300);
  }

  // Execute hero power
  const newState = useHeroPower(state, Players.OPPONENT);
  setState(() => newState);

  await wait(100);

  // Animate based on effect
  const effect = power.effect;

  if (effect.type === 'summon' && battlefield) {
    const boardLength = newState.players[Players.OPPONENT].board.length;
    const newMinionEl = findMinionElement(Players.OPPONENT, boardLength - 1);
    if (newMinionEl) {
      newMinionEl.style.transform = 'scale(0)';
      newMinionEl.style.opacity = '0';
      await wait(30);
      newMinionEl.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
      newMinionEl.style.transform = 'scale(1)';
      newMinionEl.style.opacity = '1';
      await wait(300);
      newMinionEl.style.transition = '';
    }
  } else if (effect.type === 'damageEnemyHero' && battlefield) {
    const playerHeroEl = findHeroElement(Players.PLAYER);
    if (heroEl && playerHeroEl) {
      const projectile = createProjectile('bolt', battlefield);
      const fromPos = getElementCenter(heroEl, battlefield);
      const toPos = getElementCenter(playerHeroEl, battlefield);
      await animateProjectile(projectile, fromPos, toPos, 250);
      flash(playerHeroEl);
      shake(playerHeroEl);
    }
  } else if (effect.type === 'damageRandomEnemy' && battlefield) {
    const playerBoard = newState.players[Players.PLAYER].board;
    if (playerBoard.length > 0) {
      const targetIdx = Math.floor(Math.random() * playerBoard.length);
      const targetEl = findMinionElement(Players.PLAYER, targetIdx);
      if (heroEl && targetEl) {
        const projectile = createProjectile('bolt', battlefield);
        const fromPos = getElementCenter(heroEl, battlefield);
        const toPos = getElementCenter(targetEl, battlefield);
        await animateProjectile(projectile, fromPos, toPos, 250);
        damageFlash(targetEl);
        shake(targetEl);
      }
    }
  } else if (effect.type === 'damageAllEnemies' && battlefield) {
    // Inferno effect from enemy - shockwave to all player units
    const heroPos = getElementCenter(heroEl, battlefield);

    const wave = document.createElement('div');
    wave.style.cssText = `
      position: absolute;
      left: ${heroPos.x}px;
      top: ${heroPos.y}px;
      width: 0;
      height: 0;
      border: 4px solid #ff4500;
      border-radius: 50%;
      transform: translate(-50%, -50%);
      pointer-events: none;
      z-index: 100;
      box-shadow: 0 0 20px #ff4500, 0 0 40px #ff6600;
      background: radial-gradient(circle, rgba(255,69,0,0.3) 0%, transparent 70%);
    `;
    battlefield.appendChild(wave);

    await new Promise((resolve) => {
      const anim = wave.animate([
        { width: '0px', height: '0px', opacity: 1 },
        { width: '600px', height: '600px', opacity: 0 },
      ], { duration: 400, easing: 'ease-out' });
      anim.onfinish = resolve;
    });

    wave.remove();

    // Shake all player units (minions AND hero)
    const playerMinions = document.querySelectorAll(`[data-card-owner="${Players.PLAYER}"][data-zone="board"]`);
    const playerHeroEl = findHeroElement(Players.PLAYER);

    const shakePromises = [...playerMinions].map((el) => shake(el));
    if (playerHeroEl) shakePromises.push(shake(playerHeroEl));

    await Promise.all(shakePromises);
  } else if (effect.type === 'healHero' && heroEl) {
    pulse(heroEl);
  }

  // Clean up glow
  if (heroEl) {
    heroEl.style.boxShadow = '';
  }

  await wait(200);
  return newState;
}

/**
 * Play all affordable cards for enemy with animations
 */
async function playEnemyCardsAnimated(state, setState) {
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

    // Use animated play card
    s = await animatedPlayCard(s, Players.OPPONENT, pick.i, setState);
    played = true;

    // Brief pause between cards
    await wait(200);
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

/**
 * Use hero power with animation
 *
 * @param {Object} state - Current game state
 * @param {Function} setState - State setter function
 * @returns {Promise<void>}
 */
export async function animatedHeroPower(state, setState) {
  const playerId = Players.PLAYER;
  const player = state.players[playerId];
  const power = HERO_POWERS[player.heroPower];

  if (!power) return;

  const battlefield = findBattlefield();
  const heroEl = findHeroElement(playerId);

  // Animate hero power button glow
  const powerBtn = document.querySelector('.hero-avatar.player .btn--power');
  if (powerBtn) {
    powerBtn.classList.add('activating');
    await wait(150);
  }

  // Hero glows based on power type
  if (heroEl) {
    const effect = power.effect;
    let glowColor = 'var(--gold)'; // Default gold

    if (effect.type === 'healHero') {
      glowColor = 'var(--hp)'; // Green for heal
    } else if (effect.type === 'damageEnemyHero' || effect.type === 'damageRandomEnemy' || effect.type === 'damageAllEnemies') {
      glowColor = 'var(--orange)'; // Orange for damage
    } else if (effect.type === 'summon') {
      glowColor = 'var(--highlight)'; // Blue for summon
    } else if (effect.type === 'draw') {
      glowColor = 'var(--purple, #9b59b6)'; // Purple for draw
    } else if (effect.type === 'buffRandomAlly') {
      glowColor = 'var(--gold)'; // Gold for buff
    }

    heroEl.style.boxShadow = `0 0 25px ${glowColor}, inset 0 0 15px ${glowColor}`;
    await wait(250);
  }

  // Execute the hero power
  const newState = useHeroPower(state, playerId);

  // Update state (triggers re-render)
  setState(() => newState);

  // Wait for render
  await wait(50);

  // Animate based on effect type
  const effect = power.effect;

  if (effect.type === 'summon' && battlefield) {
    // Animate the new minion popping in
    const boardLength = newState.players[playerId].board.length;
    const newMinionEl = findMinionElement(playerId, boardLength - 1);
    if (newMinionEl) {
      newMinionEl.style.transform = 'scale(0)';
      newMinionEl.style.opacity = '0';
      await wait(30);
      newMinionEl.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
      newMinionEl.style.transform = 'scale(1)';
      newMinionEl.style.opacity = '1';
      await wait(300);
      newMinionEl.style.transition = '';
    }
  } else if (effect.type === 'damageEnemyHero' && battlefield) {
    // Projectile to enemy hero
    const enemyHeroEl = findHeroElement(Players.OPPONENT);
    if (heroEl && enemyHeroEl) {
      const projectile = createProjectile('bolt', battlefield);
      const fromPos = getElementCenter(heroEl, battlefield);
      const toPos = getElementCenter(enemyHeroEl, battlefield);
      await animateProjectile(projectile, fromPos, toPos, 250);
      flash(enemyHeroEl);
      shake(enemyHeroEl);
    }
  } else if (effect.type === 'damageRandomEnemy') {
    // Find which minion got hit (check for damaged minion)
    const enemyBoard = newState.players[Players.OPPONENT].board;
    // We just need to shake a random enemy minion for visual feedback
    if (enemyBoard.length > 0 && battlefield) {
      const targetIdx = Math.floor(Math.random() * enemyBoard.length);
      const targetEl = findMinionElement(Players.OPPONENT, targetIdx);
      if (heroEl && targetEl) {
        const projectile = createProjectile('bolt', battlefield);
        const fromPos = getElementCenter(heroEl, battlefield);
        const toPos = getElementCenter(targetEl, battlefield);
        await animateProjectile(projectile, fromPos, toPos, 250);
        damageFlash(targetEl);
        shake(targetEl);
      }
    }
  } else if (effect.type === 'damageAllEnemies' && battlefield) {
    // Inferno hero power - fiery shockwave from hero to all enemies
    const heroPos = getElementCenter(heroEl, battlefield);

    const wave = document.createElement('div');
    wave.style.cssText = `
      position: absolute;
      left: ${heroPos.x}px;
      top: ${heroPos.y}px;
      width: 0;
      height: 0;
      border: 4px solid #ff4500;
      border-radius: 50%;
      transform: translate(-50%, -50%);
      pointer-events: none;
      z-index: 100;
      box-shadow: 0 0 20px #ff4500, 0 0 40px #ff6600;
      background: radial-gradient(circle, rgba(255,69,0,0.3) 0%, transparent 70%);
    `;
    battlefield.appendChild(wave);

    await new Promise((resolve) => {
      const anim = wave.animate([
        { width: '0px', height: '0px', opacity: 1 },
        { width: '600px', height: '600px', opacity: 0 },
      ], { duration: 400, easing: 'ease-out' });
      anim.onfinish = resolve;
    });

    wave.remove();

    // Shake all enemies (minions AND hero)
    const enemyMinions = document.querySelectorAll(`[data-card-owner="${Players.OPPONENT}"][data-zone="board"]`);
    const enemyHeroEl = findHeroElement(Players.OPPONENT);

    const shakePromises = [...enemyMinions].map((el) => shake(el));
    if (enemyHeroEl) shakePromises.push(shake(enemyHeroEl));

    await Promise.all(shakePromises);
  } else if (effect.type === 'buffRandomAlly') {
    // Find a random ally and make it glow
    const friendlyBoard = newState.players[playerId].board;
    if (friendlyBoard.length > 0) {
      const targetIdx = Math.floor(Math.random() * friendlyBoard.length);
      const targetEl = findMinionElement(playerId, targetIdx);
      if (targetEl) {
        await playAnimation(buffDescriptor(playerId, targetIdx, effect.attack || 0, effect.health || 0));
      }
    }
  } else if (effect.type === 'healHero' && heroEl) {
    // Green pulse on hero
    pulse(heroEl);
  }

  // Clean up hero glow
  if (heroEl) {
    heroEl.style.boxShadow = '';
  }

  // Remove activating class
  if (powerBtn) {
    powerBtn.classList.remove('activating');
  }

  await wait(100);
}
