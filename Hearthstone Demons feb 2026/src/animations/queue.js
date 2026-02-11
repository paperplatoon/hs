/**
 * Animation Queue System
 *
 * Collects animation descriptors and processes them sequentially.
 * Animations are purely cosmetic - state changes happen independently.
 *
 * Usage:
 *   const queue = createAnimationQueue();
 *   queue.add({ type: 'attack', ... });
 *   queue.add({ type: 'grow', ... });
 *   await queue.drain(); // Plays animations one by one
 */

// Default timeout per animation (prevents soft-locks)
const DEFAULT_TIMEOUT = 3000;

/**
 * Creates a new animation queue instance
 * @returns {AnimationQueue}
 */
export function createAnimationQueue() {
  const queue = [];
  let isProcessing = false;
  let isPaused = false;

  return {
    /**
     * Add an animation descriptor to the queue
     * @param {AnimationDescriptor} descriptor
     */
    add(descriptor) {
      if (descriptor) {
        queue.push(descriptor);
      }
    },

    /**
     * Add multiple animation descriptors
     * @param {AnimationDescriptor[]} descriptors
     */
    addAll(descriptors) {
      if (Array.isArray(descriptors)) {
        descriptors.forEach(d => d && queue.push(d));
      }
    },

    /**
     * Process all queued animations sequentially
     * @param {AnimationPlayer} player - Function that plays a single animation
     * @returns {Promise<void>}
     */
    async drain(player) {
      if (isProcessing) {
        console.warn('[AnimationQueue] Already processing, ignoring drain call');
        return;
      }

      isProcessing = true;

      while (queue.length > 0 && !isPaused) {
        const descriptor = queue.shift();
        if (!descriptor) continue;

        try {
          await withTimeout(
            player(descriptor),
            descriptor.timeout || DEFAULT_TIMEOUT
          );
        } catch (err) {
          // Animation failed or timed out - log and continue
          console.warn('[AnimationQueue] Animation failed:', descriptor.type, err);
        }
      }

      isProcessing = false;
    },

    /**
     * Clear all pending animations
     */
    clear() {
      queue.length = 0;
    },

    /**
     * Skip remaining animations (resolve immediately)
     */
    skip() {
      isPaused = true;
      queue.length = 0;
      // Reset after a tick to allow future animations
      setTimeout(() => { isPaused = false; }, 0);
    },

    /**
     * Get current queue length
     */
    get length() {
      return queue.length;
    },

    /**
     * Check if queue is currently processing
     */
    get processing() {
      return isProcessing;
    },

    /**
     * Get a copy of current queue (for debugging)
     */
    peek() {
      return [...queue];
    }
  };
}

/**
 * Wrap a promise with a timeout
 * @param {Promise} promise
 * @param {number} ms
 * @returns {Promise}
 */
function withTimeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      resolve(); // Resolve (don't reject) on timeout - animation is cosmetic
    }, ms);

    Promise.resolve(promise)
      .then(result => {
        clearTimeout(timer);
        resolve(result);
      })
      .catch(err => {
        clearTimeout(timer);
        resolve(); // Resolve on error too - don't break the game
      });
  });
}

/**
 * Helper to sort animation descriptors by board position (left to right)
 * @param {AnimationDescriptor[]} descriptors
 * @returns {AnimationDescriptor[]}
 */
export function sortByBoardPosition(descriptors) {
  return [...descriptors].sort((a, b) => {
    const posA = a.sourceIndex ?? a.minionIndex ?? 0;
    const posB = b.sourceIndex ?? b.minionIndex ?? 0;
    return posA - posB;
  });
}

/**
 * Animation Descriptor Types (for documentation)
 *
 * @typedef {Object} AnimationDescriptor
 * @property {string} type - Animation type: 'attack', 'summon', 'death', 'grow', 'buff', 'damage', 'spell', 'trigger'
 * @property {string} [playerId] - 'player' or 'opponent'
 * @property {number} [sourceIndex] - Board index of source minion
 * @property {number} [targetIndex] - Board index of target minion
 * @property {string} [targetType] - 'minion' or 'hero'
 * @property {string} [targetPlayerId] - Player ID of target
 * @property {Object} [minion] - Minion data (for death animations)
 * @property {number} [amount] - Damage/heal amount
 * @property {number} [duration] - Custom duration in ms
 * @property {number} [timeout] - Custom timeout in ms
 */

/**
 * @callback AnimationPlayer
 * @param {AnimationDescriptor} descriptor
 * @returns {Promise<void>}
 */
