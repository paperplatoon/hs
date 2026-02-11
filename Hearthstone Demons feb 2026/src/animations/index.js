/**
 * Animation System
 *
 * Central export for all animation utilities.
 *
 * Usage:
 *   import { createAnimationQueue, shake, findMinionElement } from './animations/index.js';
 */

// Queue system
export { createAnimationQueue, sortByBoardPosition } from './queue.js';

// Animation player (interprets descriptors)
export {
  playAnimation,
  attackDescriptor,
  summonDescriptor,
  deathDescriptor,
  growDescriptor,
  buffDescriptor,
  damageDescriptor,
  spellDescriptor,
} from './player.js';

// Combat animations (high-level wrappers)
export {
  animatedAttack,
  animatedPlayCard,
  animatedEnemyTurn,
  animatedEndTurn,
  animatedEndOfTurnTriggers,
  animateDeaths,
  animateWarcry,
  animateSnipe,
  animateBolster,
  animateDeluge,
  animateInferno,
  animateFlock,
  animateGust,
  animateRejuvenate,
  animateMend,
  animateSpellCast,
  animateShieldBreak,
  animateLifesteal,
  animatedHeroPower,
  getAnimationQueue,
  resetAnimationQueue,
  createAnimatedSetState,
} from './combat.js';

// CSS animation primitives
export {
  DURATIONS,
  animateClass,
  shake,
  pulse,
  glow,
  fadeIn,
  fadeOut,
  grow,
  bounce,
  flash,
  buffGlow,
  damageFlash,
  highlightStat,
  parallel,
  sequence,
  wait,
} from './primitives.js';

// DOM geometry utilities
export {
  getElementCenter,
  getElementTop,
  getRelativePosition,
  findMinionElement,
  findMinionByUid,
  findHeroElement,
  findBattlefield,
  animateToward,
  animateReturn,
  createGhost,
  createProjectile,
  animateProjectile,
} from './geometry.js';
