/**
 * DOM Geometry Utilities
 *
 * Functions for calculating positions and animating elements
 * between positions. Used for attack lunges, projectiles, etc.
 */

/**
 * Get the center point of an element relative to a container
 * @param {HTMLElement} el - The element to measure
 * @param {HTMLElement} [container] - Optional container (defaults to viewport)
 * @returns {{ x: number, y: number }}
 */
export function getElementCenter(el, container = null) {
  if (!el) return { x: 0, y: 0 };

  const rect = el.getBoundingClientRect();
  const containerRect = container?.getBoundingClientRect() || { left: 0, top: 0 };

  return {
    x: rect.left - containerRect.left + rect.width / 2,
    y: rect.top - containerRect.top + rect.height / 2,
  };
}

/**
 * Get the top-center point of an element (useful for card "head" position)
 * @param {HTMLElement} el
 * @param {HTMLElement} [container]
 * @returns {{ x: number, y: number }}
 */
export function getElementTop(el, container = null) {
  if (!el) return { x: 0, y: 0 };

  const rect = el.getBoundingClientRect();
  const containerRect = container?.getBoundingClientRect() || { left: 0, top: 0 };

  return {
    x: rect.left - containerRect.left + rect.width / 2,
    y: rect.top - containerRect.top + rect.height * 0.2,
  };
}

/**
 * Calculate the relative position between two elements
 * @param {HTMLElement} from
 * @param {HTMLElement} to
 * @param {HTMLElement} [container]
 * @returns {{ dx: number, dy: number, distance: number, angle: number }}
 */
export function getRelativePosition(from, to, container = null) {
  const fromPos = getElementCenter(from, container);
  const toPos = getElementCenter(to, container);

  const dx = toPos.x - fromPos.x;
  const dy = toPos.y - fromPos.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx);

  return { dx, dy, distance, angle };
}

/**
 * Find a minion DOM element by player ID and board index
 * @param {string} playerId - 'player' or 'opponent'
 * @param {number} index - Board index
 * @returns {HTMLElement | null}
 */
export function findMinionElement(playerId, index) {
  return document.querySelector(
    `[data-card-owner="${playerId}"][data-card-index="${index}"][data-zone="board"]`
  );
}

/**
 * Find a minion DOM element by its unique ID
 * @param {string} uid
 * @returns {HTMLElement | null}
 */
export function findMinionByUid(uid) {
  return document.querySelector(`[data-uid="${uid}"]`);
}

/**
 * Find the hero avatar element
 * @param {string} playerId - 'player' or 'opponent'
 * @returns {HTMLElement | null}
 */
export function findHeroElement(playerId) {
  const className = playerId === 'opponent' ? 'enemy' : 'player';
  return document.querySelector(`.hero-avatar.${className}`);
}

/**
 * Find the battlefield container
 * @returns {HTMLElement | null}
 */
export function findBattlefield() {
  return document.getElementById('battlefield-v2');
}

/**
 * Animate an element toward a target position using Web Animations API
 * @param {HTMLElement} el - Element to animate (usually a clone/ghost)
 * @param {{ x: number, y: number }} from - Start position
 * @param {{ x: number, y: number }} to - End position
 * @param {Object} options
 * @param {number} [options.duration=250] - Animation duration in ms
 * @param {number} [options.travelPercent=0.7] - How far to travel (0-1)
 * @param {boolean} [options.rotate=true] - Whether to rotate toward target
 * @param {string} [options.easing='cubic-bezier(.2,.7,.2,1)']
 * @returns {Promise<void>}
 */
export function animateToward(el, from, to, options = {}) {
  return new Promise((resolve) => {
    if (!el) return resolve();

    const {
      duration = 250,
      travelPercent = 0.7,
      rotate = true,
      easing = 'cubic-bezier(.2,.7,.2,1)',
    } = options;

    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const angle = rotate ? Math.atan2(dy, dx) : 0;

    // Calculate intermediate and end positions
    const midX = from.x + dx * 0.5;
    const midY = from.y + dy * 0.5;
    const endX = from.x + dx * travelPercent;
    const endY = from.y + dy * travelPercent;

    const keyframes = [
      { transform: `translate(${from.x}px, ${from.y}px) rotate(${angle - 0.2}rad) scale(1)` },
      { transform: `translate(${midX}px, ${midY}px) rotate(${angle}rad) scale(1.02)` },
      { transform: `translate(${endX}px, ${endY}px) rotate(${angle}rad) scale(1.02)` },
    ];

    const anim = el.animate(keyframes, { duration, easing });

    anim.onfinish = () => resolve();
    anim.oncancel = () => resolve();
  });
}

/**
 * Animate an element returning to its original position
 * @param {HTMLElement} el
 * @param {{ x: number, y: number }} current - Current position
 * @param {{ x: number, y: number }} origin - Original position
 * @param {number} duration
 * @returns {Promise<void>}
 */
export function animateReturn(el, current, origin, duration = 150) {
  return new Promise((resolve) => {
    if (!el) return resolve();

    const keyframes = [
      { transform: `translate(${current.x}px, ${current.y}px)` },
      { transform: `translate(${origin.x}px, ${origin.y}px) scale(1)` },
    ];

    const anim = el.animate(keyframes, {
      duration,
      easing: 'ease-out',
    });

    anim.onfinish = () => resolve();
    anim.oncancel = () => resolve();
  });
}

/**
 * Create a "ghost" clone of an element for animation
 * @param {HTMLElement} el - Element to clone
 * @param {HTMLElement} container - Container to append ghost to
 * @param {{ x: number, y: number }} [initialPos] - Initial position (prevents flicker at 0,0)
 * @returns {HTMLElement}
 */
export function createGhost(el, container, initialPos = null) {
  const ghost = el.cloneNode(true);
  ghost.style.position = 'absolute';
  ghost.style.left = '0px';
  ghost.style.top = '0px';
  ghost.style.pointerEvents = 'none';
  ghost.style.willChange = 'transform, opacity';
  ghost.style.opacity = '0.95';
  ghost.style.zIndex = '100';

  // Set initial position BEFORE appending to prevent flicker at (0,0)
  if (initialPos) {
    ghost.style.transform = `translate(${initialPos.x}px, ${initialPos.y}px)`;
  }

  // Remove interactive classes
  ghost.classList.remove('ready', 'u-breathe', 'u-aim-target', 'u-aim-invalid');

  container.appendChild(ghost);
  return ghost;
}

/**
 * Create a projectile element for spell/ability animations
 * @param {'fireball' | 'bolt' | 'heal' | 'buff'} type
 * @param {HTMLElement} container
 * @returns {HTMLElement}
 */
export function createProjectile(type, container) {
  const projectile = document.createElement('div');
  projectile.className = `projectile projectile--${type}`;
  projectile.style.position = 'absolute';
  projectile.style.left = '0px';
  projectile.style.top = '0px';
  projectile.style.pointerEvents = 'none';
  projectile.style.zIndex = '100';

  container.appendChild(projectile);
  return projectile;
}

/**
 * Animate a projectile from source to target
 * @param {HTMLElement} projectile
 * @param {{ x: number, y: number }} from
 * @param {{ x: number, y: number }} to
 * @param {number} duration
 * @returns {Promise<void>}
 */
export function animateProjectile(projectile, from, to, duration = 300) {
  return new Promise((resolve) => {
    if (!projectile) return resolve();

    const angle = Math.atan2(to.y - from.y, to.x - from.x);

    const keyframes = [
      {
        transform: `translate(${from.x}px, ${from.y}px) rotate(${angle}rad) scale(0.5)`,
        opacity: 1,
      },
      {
        transform: `translate(${to.x}px, ${to.y}px) rotate(${angle}rad) scale(1)`,
        opacity: 1,
      },
    ];

    const anim = projectile.animate(keyframes, {
      duration,
      easing: 'ease-in',
    });

    anim.onfinish = () => {
      projectile.remove();
      resolve();
    };
    anim.oncancel = () => {
      projectile.remove();
      resolve();
    };
  });
}
