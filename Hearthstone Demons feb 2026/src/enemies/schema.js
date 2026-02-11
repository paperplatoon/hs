/**
 * Enemy Definitions
 *
 * Each enemy has a hero power and a deck of cards.
 * Deck is a flat array - list duplicates explicitly.
 */

export const ENEMIES = {
  'enemy:goblin-horde': {
    id: 'enemy:goblin-horde',
    name: 'Goblin Horde',
    description: 'A swarm of goblins that overwhelms with numbers.',
    heroPower: 'power:summon-wisp',
    tier: 1,
    startingLife: 20,
    goldReward: 50,
    art: null,
    deck: [
      // Basic creatures (2 of each)
      'minion:wisp-1-1', 'minion:wisp-1-1',
      'minion:sprite-1-1', 'minion:sprite-1-1',
      'minion:vanilla-2-3', 'minion:vanilla-2-3',
      'minion:taunt-2-2', 'minion:taunt-2-2',
      // Synergy creatures (2 of each)
      'minion:deathrattle-wisp', 'minion:deathrattle-wisp',
      'minion:war-banner', 'minion:war-banner',
      'minion:ember-herald', 'minion:ember-herald',
    ],
  },

  'enemy:fire-cult': {
    id: 'enemy:fire-cult',
    name: 'Fire Cult',
    description: 'Pyromancers who burn everything in their path.',
    heroPower: 'power:sting',
    tier: 1,
    startingLife: 20,
    goldReward: 50,
    art: null,
    deck: [
      // Basic creatures (2 of each)
      'minion:vanilla-2-3', 'minion:vanilla-2-3',
      'minion:berserker', 'minion:berserker',
      'minion:taunt-2-2', 'minion:taunt-2-2',
      'minion:shield-3-1', 'minion:shield-3-1',
      // Synergy creatures (2 of each)
      'minion:flame-sniper', 'minion:flame-sniper',
      'minion:ember-herald', 'minion:ember-herald',
      'minion:pyre-champion', 'minion:pyre-champion',
    ],
  },

  'enemy:forest-spirits': {
    id: 'enemy:forest-spirits',
    name: 'Forest Spirits',
    description: 'Ancient spirits that grow stronger over time.',
    heroPower: 'power:summon-growth',
    tier: 1,
    startingLife: 20,
    goldReward: 50,
    art: null,
    deck: [
      // Basic creatures (2 of each)
      'minion:vanilla-2-3', 'minion:vanilla-2-3',
      'minion:earth-guardian', 'minion:earth-guardian',
      'minion:taunt-2-2', 'minion:taunt-2-2',
      'minion:deathrattle-wisp', 'minion:deathrattle-wisp',
      // Synergy creatures (2 of each)
      'minion:growing-sprite', 'minion:growing-sprite',
      'minion:hearty-weed', 'minion:hearty-weed',
      'minion:moss-creeper', 'minion:moss-creeper',
    ],
  },

  'enemy:stone-legion': {
    id: 'enemy:stone-legion',
    name: 'Stone Legion',
    description: 'An army of stone warriors with impenetrable defenses.',
    heroPower: 'power:small-shield',
    tier: 1,
    startingLife: 20,
    goldReward: 50,
    art: null,
    deck: [
      // Basic creatures (2 of each)
      'minion:taunt-2-2', 'minion:taunt-2-2',
      'minion:earth-guardian', 'minion:earth-guardian',
      'minion:vanilla-2-3', 'minion:vanilla-2-3',
      'minion:shield-3-1', 'minion:shield-3-1',
      // Synergy creatures (2 of each)
      'minion:stone-sentinel', 'minion:stone-sentinel',
      'minion:war-banner', 'minion:war-banner',
      'minion:rallying-cry', 'minion:rallying-cry',
    ],
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get all enemies of a specific tier
 */
export function getEnemiesByTier(tier) {
  return Object.values(ENEMIES).filter((e) => e.tier === tier);
}

/**
 * Get all enemies at or above a tier
 */
export function getEnemiesMinTier(minTier) {
  return Object.values(ENEMIES).filter((e) => e.tier >= minTier);
}

/**
 * Get a random enemy from a specific tier
 */
export function getRandomEnemyByTier(tier) {
  const pool = getEnemiesByTier(tier);
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Get an enemy by ID
 */
export function getEnemy(enemyId) {
  return ENEMIES[enemyId] || null;
}
