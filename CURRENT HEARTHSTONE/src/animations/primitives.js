/**
 * Animation Primitives
 *
 * Low-level CSS animation helpers. Each function applies a CSS animation
 * to an element and returns a Promise that resolves when complete.
 *
 * These are the building blocks for higher-level animation sequences.
 */

// Default durations for each animation type
export const DURATIONS = {
  shake: 180,
  pulse: 400,
  glow: 500,
  fadeIn: 300,
  fadeOut: 300,
  grow: 400,
  bounce: 300,
  flash: 160,
  windup: 140,
  lunge: 250,
  buffGlow: 600,
  damageFlash: 200,
};

/**
 * Apply a CSS class animation and return a Promise
 * @param {HTMLElement} el - Element to animate
 * @param {string} className - CSS class with animation
 * @param {number} duration - Animation duration in ms
 * @returns {Promise<void>}
 */
export function animateClass(el, className, duration) {
  return new Promise((resolve) => {
    if (!el) return resolve();

    el.classList.add(className);

    setTimeout(() => {
      el.classList.remove(className);
      resolve();
    }, duration);
  });
}

/**
 * Shake animation - rapid left-right wiggle
 * Used for: taking damage, attacks landing
 */
export function shake(el, duration = DURATIONS.shake) {
  return animateClass(el, 'u-shake', duration);
}

/**
 * Pulse animation - brief scale up then down
 * Used for: triggers activating, general emphasis
 */
export function pulse(el, duration = DURATIONS.pulse) {
  return animateClass(el, 'u-pulse-once', duration);
}

/**
 * Glow animation - colored border/shadow
 * Used for: buffs, healing, highlighting
 * @param {HTMLElement} el
 * @param {string} color - CSS color value
 * @param {number} duration
 */
export function glow(el, color = 'var(--glow)', duration = DURATIONS.glow) {
  return new Promise((resolve) => {
    if (!el) return resolve();

    const originalBoxShadow = el.style.boxShadow;
    el.style.boxShadow = `0 0 20px ${color}, 0 0 40px ${color}`;
    el.style.transition = `box-shadow ${duration / 2}ms ease-out`;

    setTimeout(() => {
      el.style.boxShadow = originalBoxShadow || '';
      setTimeout(() => {
        el.style.transition = '';
        resolve();
      }, duration / 2);
    }, duration / 2);
  });
}

/**
 * Fade in animation - opacity 0 -> 1 with scale
 * Used for: summoning minions
 */
export function fadeIn(el, duration = DURATIONS.fadeIn) {
  return new Promise((resolve) => {
    if (!el) return resolve();

    el.style.opacity = '0';
    el.style.transform = 'scale(0.8)';
    el.style.transition = `opacity ${duration}ms ease-out, transform ${duration}ms ease-out`;

    // Force reflow
    el.offsetHeight;

    el.style.opacity = '1';
    el.style.transform = 'scale(1)';

    setTimeout(() => {
      el.style.transition = '';
      el.style.opacity = '';
      el.style.transform = '';
      resolve();
    }, duration);
  });
}

/**
 * Fade out animation - opacity 1 -> 0
 * Used for: death
 */
export function fadeOut(el, duration = DURATIONS.fadeOut) {
  return new Promise((resolve) => {
    if (!el) return resolve();

    el.style.transition = `opacity ${duration}ms ease-out, transform ${duration}ms ease-out`;
    el.style.opacity = '0';
    el.style.transform = 'scale(0.9)';

    setTimeout(() => {
      resolve();
    }, duration);
  });
}

/**
 * Grow animation - brief scale up
 * Used for: stat gains, growing keyword
 */
export function grow(el, duration = DURATIONS.grow) {
  return animateClass(el, 'u-grow', duration);
}

/**
 * Bounce animation - quick up-down
 * Used for: stat changes, emphasis
 */
export function bounce(el, duration = DURATIONS.bounce) {
  return animateClass(el, 'u-bounce', duration);
}

/**
 * Flash animation - white overlay flash
 * Used for: impact, damage taken
 */
export function flash(el, duration = DURATIONS.flash) {
  return animateClass(el, 'u-flash', duration);
}

/**
 * Buff glow - green/gold glow for positive effects
 * @param {HTMLElement} el
 * @param {'attack' | 'health' | 'both'} statType
 * @param {number} duration
 */
export function buffGlow(el, statType = 'both', duration = DURATIONS.buffGlow) {
  const colors = {
    attack: 'var(--atk)',
    health: 'var(--hp)',
    both: 'var(--shield)',
  };
  return glow(el, colors[statType] || colors.both, duration);
}

/**
 * Damage flash - red flash for damage
 */
export function damageFlash(el, duration = DURATIONS.damageFlash) {
  return new Promise((resolve) => {
    if (!el) return resolve();

    const originalBoxShadow = el.style.boxShadow;
    el.style.boxShadow = `0 0 20px var(--danger), inset 0 0 30px rgba(229, 57, 53, 0.3)`;

    setTimeout(() => {
      el.style.boxShadow = originalBoxShadow || '';
      resolve();
    }, duration);
  });
}

/**
 * Highlight a stat orb temporarily
 * @param {HTMLElement} cardEl - The card wrapper element
 * @param {'attack' | 'health'} stat - Which stat to highlight
 * @param {number} duration
 */
export function highlightStat(cardEl, stat, duration = 400) {
  return new Promise((resolve) => {
    if (!cardEl) return resolve();

    const orbClass = stat === 'attack' ? '.cm-orb.atk' : '.cm-orb.hp';
    const orb = cardEl.querySelector(orbClass);

    if (!orb) return resolve();

    orb.style.transform = 'scale(1.3)';
    orb.style.transition = `transform ${duration / 2}ms ease-out`;

    setTimeout(() => {
      orb.style.transform = 'scale(1)';
      setTimeout(() => {
        orb.style.transition = '';
        orb.style.transform = '';
        resolve();
      }, duration / 2);
    }, duration / 2);
  });
}

/**
 * Combine multiple animations in parallel
 * @param {Promise[]} animations
 * @returns {Promise<void>}
 */
export function parallel(...animations) {
  return Promise.all(animations).then(() => {});
}

/**
 * Combine multiple animations in sequence
 * @param {(() => Promise)[]} animationFns - Functions that return animation promises
 * @returns {Promise<void>}
 */
export async function sequence(...animationFns) {
  for (const fn of animationFns) {
    await fn();
  }
}

/**
 * Wait for a specified duration
 * @param {number} ms
 * @returns {Promise<void>}
 */
export function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
