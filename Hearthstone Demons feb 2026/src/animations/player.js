/**
 * Animation Player
 *
 * Interprets animation descriptors and plays them using primitives + geometry.
 * This is the bridge between the queue and actual DOM animations.
 */

import {
  shake,
  pulse,
  glow,
  fadeIn,
  fadeOut,
  grow,
  flash,
  buffGlow,
  damageFlash,
  highlightStat,
  parallel,
  wait,
  DURATIONS,
} from './primitives.js';

import {
  getElementTop,
  getElementCenter,
  findMinionElement,
  findHeroElement,
  findBattlefield,
  createGhost,
  animateToward,
  createProjectile,
  animateProjectile,
} from './geometry.js';

/**
 * Play a single animation based on its descriptor
 * @param {AnimationDescriptor} descriptor
 * @returns {Promise<void>}
 */
export async function playAnimation(descriptor) {
  if (!descriptor || !descriptor.type) return;

  const handlers = {
    attack: playAttack,
    summon: playSummon,
    death: playDeath,
    grow: playGrow,
    buff: playBuff,
    damage: playDamage,
    spell: playSpell,
    trigger: playTrigger,
    shieldBreak: playShieldBreak,
    lifesteal: playLifesteal,
  };

  const handler = handlers[descriptor.type];
  if (handler) {
    await handler(descriptor);
  } else {
    console.warn('[AnimationPlayer] Unknown animation type:', descriptor.type);
  }
}

/**
 * Attack animation - attacker lunges toward target, target shakes
 */
async function playAttack(desc) {
  const { playerId, sourceIndex, targetType, targetIndex, targetPlayerId } = desc;

  const battlefield = findBattlefield();
  if (!battlefield) return;

  // Find attacker element
  const attackerEl = findMinionElement(playerId, sourceIndex);
  if (!attackerEl) return;

  // Find target element
  let targetEl;
  if (targetType === 'hero') {
    targetEl = findHeroElement(targetPlayerId || (playerId === 'player' ? 'opponent' : 'player'));
  } else {
    targetEl = findMinionElement(targetPlayerId || (playerId === 'player' ? 'opponent' : 'player'), targetIndex);
  }

  if (!targetEl) return;

  // Windup animation on attacker
  attackerEl.classList.add('u-windup');
  await wait(140);
  attackerEl.classList.remove('u-windup');

  // Create ghost and animate lunge
  const ghost = createGhost(attackerEl, battlefield);
  const fromPos = getElementTop(attackerEl, battlefield);
  const toPos = getElementTop(targetEl, battlefield);

  await animateToward(ghost, fromPos, toPos, {
    duration: 220,
    travelPercent: 0.7,
    rotate: true,
  });

  // Impact effects
  ghost.remove();
  await parallel(
    flash(targetEl),
    shake(targetEl)
  );
}

/**
 * Summon animation - minion fades in with pulse
 */
async function playSummon(desc) {
  const { playerId, minionIndex } = desc;

  const minionEl = findMinionElement(playerId, minionIndex);
  if (!minionEl) return;

  await fadeIn(minionEl, 300);
  await pulse(minionEl, 200);
}

/**
 * Death animation - minion shakes, flashes red, fades out
 */
async function playDeath(desc) {
  const { playerId, minionIndex, uid } = desc;

  // Try to find by UID first (more reliable if board shifted), then by index
  let minionEl = uid ? document.querySelector(`[data-uid="${uid}"]`) : null;
  if (!minionEl) {
    minionEl = findMinionElement(playerId, minionIndex);
  }

  if (!minionEl) return;

  await damageFlash(minionEl, 150);
  await parallel(
    shake(minionEl, 250),
    fadeOut(minionEl, 300)
  );
}

/**
 * Grow animation - minion scales up briefly, stat orbs highlight
 */
async function playGrow(desc) {
  const { playerId, minionIndex, attack, health } = desc;

  const minionEl = findMinionElement(playerId, minionIndex);
  if (!minionEl) return;

  // Glow and scale
  await parallel(
    grow(minionEl, 400),
    buffGlow(minionEl, 'both', 500)
  );

  // Highlight stat orbs if specified
  const highlights = [];
  if (attack) highlights.push(highlightStat(minionEl, 'attack', 300));
  if (health) highlights.push(highlightStat(minionEl, 'health', 300));

  if (highlights.length) {
    await parallel(...highlights);
  }
}

/**
 * Buff animation - source glows, projectile to target, target glows
 */
async function playBuff(desc) {
  const { playerId, sourceIndex, targetIndex, targetPlayerId, attack, health } = desc;

  const battlefield = findBattlefield();
  if (!battlefield) return;

  const sourceEl = findMinionElement(playerId, sourceIndex);
  const actualTargetPlayerId = targetPlayerId || playerId;
  const targetEl = findMinionElement(actualTargetPlayerId, targetIndex);

  if (!sourceEl || !targetEl) {
    // If no source, just glow the target
    if (targetEl) {
      await buffGlow(targetEl, attack && health ? 'both' : attack ? 'attack' : 'health', 500);
    }
    return;
  }

  // Source pulses
  pulse(sourceEl, 200);

  // Projectile from source to target
  const projectile = createProjectile('buff', battlefield);
  const fromPos = getElementCenter(sourceEl, battlefield);
  const toPos = getElementCenter(targetEl, battlefield);

  await animateProjectile(projectile, fromPos, toPos, 250);

  // Target glows
  await buffGlow(targetEl, attack && health ? 'both' : attack ? 'attack' : 'health', 400);
}

/**
 * Damage animation - target flashes and shakes
 */
async function playDamage(desc) {
  const { playerId, minionIndex, targetType } = desc;

  let targetEl;
  if (targetType === 'hero') {
    targetEl = findHeroElement(playerId);
  } else {
    targetEl = findMinionElement(playerId, minionIndex);
  }

  if (!targetEl) return;

  await parallel(
    damageFlash(targetEl, 200),
    shake(targetEl, 180)
  );
}

/**
 * Spell animation - projectile from caster to target with impact
 */
async function playSpell(desc) {
  const { playerId, targetPlayerId, targetType, targetIndex, spellType } = desc;

  const battlefield = findBattlefield();
  if (!battlefield) return;

  // Spell originates from hero
  const casterEl = findHeroElement(playerId);
  if (!casterEl) return;

  // Find target
  let targetEl;
  const actualTargetPlayerId = targetPlayerId || (playerId === 'player' ? 'opponent' : 'player');

  if (targetType === 'hero') {
    targetEl = findHeroElement(actualTargetPlayerId);
  } else {
    targetEl = findMinionElement(actualTargetPlayerId, targetIndex);
  }

  if (!targetEl) return;

  // Create and animate projectile
  const projectileType = spellType || 'bolt';
  const projectile = createProjectile(projectileType, battlefield);
  const fromPos = getElementCenter(casterEl, battlefield);
  const toPos = getElementCenter(targetEl, battlefield);

  await animateProjectile(projectile, fromPos, toPos, 300);

  // Impact
  await parallel(
    flash(targetEl),
    shake(targetEl)
  );
}

/**
 * Generic trigger animation - brief highlight/pulse
 */
async function playTrigger(desc) {
  const { playerId, minionIndex } = desc;

  const minionEl = findMinionElement(playerId, minionIndex);
  if (!minionEl) return;

  await pulse(minionEl, 300);
}

/**
 * Divine Shield break animation
 */
async function playShieldBreak(desc) {
  const { playerId, minionIndex } = desc;

  const minionEl = findMinionElement(playerId, minionIndex);
  if (!minionEl) return;

  // Golden flash for shield break
  await glow(minionEl, 'var(--shield)', 400);
}

/**
 * Lifesteal animation - green particles flow from target to attacker
 */
async function playLifesteal(desc) {
  const { playerId, sourceIndex, amount } = desc;

  const battlefield = findBattlefield();
  if (!battlefield) return;

  const sourceEl = findMinionElement(playerId, sourceIndex);
  const heroEl = findHeroElement(playerId);

  if (!sourceEl || !heroEl) return;

  // Create heal projectile from source to hero
  const projectile = createProjectile('heal', battlefield);
  const fromPos = getElementCenter(sourceEl, battlefield);
  const toPos = getElementCenter(heroEl, battlefield);

  await animateProjectile(projectile, fromPos, toPos, 300);

  // Hero glows green
  await glow(heroEl, 'var(--hp)', 300);
}

/**
 * Helper: Create an attack animation descriptor
 */
export function attackDescriptor(playerId, sourceIndex, targetType, targetIndex, targetPlayerId) {
  return {
    type: 'attack',
    playerId,
    sourceIndex,
    targetType,
    targetIndex,
    targetPlayerId,
  };
}

/**
 * Helper: Create a summon animation descriptor
 */
export function summonDescriptor(playerId, minionIndex) {
  return {
    type: 'summon',
    playerId,
    minionIndex,
  };
}

/**
 * Helper: Create a death animation descriptor
 */
export function deathDescriptor(playerId, minionIndex, uid) {
  return {
    type: 'death',
    playerId,
    minionIndex,
    uid,
  };
}

/**
 * Helper: Create a grow animation descriptor
 */
export function growDescriptor(playerId, minionIndex, attack, health) {
  return {
    type: 'grow',
    playerId,
    minionIndex,
    attack,
    health,
  };
}

/**
 * Helper: Create a buff animation descriptor
 */
export function buffDescriptor(playerId, sourceIndex, targetIndex, targetPlayerId, attack, health) {
  return {
    type: 'buff',
    playerId,
    sourceIndex,
    targetIndex,
    targetPlayerId,
    attack,
    health,
  };
}

/**
 * Helper: Create a damage animation descriptor
 */
export function damageDescriptor(playerId, minionIndex, targetType = 'minion') {
  return {
    type: 'damage',
    playerId,
    minionIndex,
    targetType,
  };
}

/**
 * Helper: Create a spell animation descriptor
 */
export function spellDescriptor(playerId, targetPlayerId, targetType, targetIndex, spellType) {
  return {
    type: 'spell',
    playerId,
    targetPlayerId,
    targetType,
    targetIndex,
    spellType,
  };
}
