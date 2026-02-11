/**
 * Character & Hero Power Schema
 *
 * Characters have a starter deck and a hero power.
 * Hero powers are once-per-turn abilities that cost mana.
 */

// ============================================================================
// HERO POWER DEFINITIONS
// ============================================================================

export const HERO_POWERS = {
  // Defensive / Healing powers
  'power:restore': {
    id: 'power:restore',
    name: 'Restore',
    cost: 2,
    text: 'Restore 2 health to your hero.',
    effect: { type: 'healHero', amount: 2 },
  },

  'power:small-shield': {
    id: 'power:small-shield',
    name: 'Reinforce',
    cost: 2,
    text: 'Summon a 0/2 with Taunt.',
    effect: { type: 'summon', cardId: 'minion:shield-token' },
  },

  // Summoning powers
  'power:summon-wisp': {
    id: 'power:summon-wisp',
    name: 'Totemic Call',
    cost: 2,
    text: 'Summon a 1/1 Wisp.',
    effect: { type: 'summon', cardId: 'minion:wisp-1-1' },
  },

  'power:summon-growth': {
    id: 'power:summon-growth',
    name: 'Living Seed',
    cost: 2,
    text: 'Summon a 0/1 that gains +1/+1 at end of turn.',
    effect: { type: 'summon', cardId: 'minion:seedling-token' },
  },

  // Buff powers
  'power:strength': {
    id: 'power:strength',
    name: 'Empower',
    cost: 2,
    text: 'Give a random friendly minion +2 Attack.',
    effect: { type: 'buffRandomAlly', attack: 2, health: 0 },
  },

  // Damage powers
  'power:sting': {
    id: 'power:sting',
    name: 'Fireblast',
    cost: 2,
    text: 'Deal 1 damage to the enemy hero.',
    effect: { type: 'damageEnemyHero', amount: 1 },
  },

  'power:erase': {
    id: 'power:erase',
    name: 'Erase',
    cost: 2,
    text: 'Deal 2 damage to a random enemy minion.',
    effect: { type: 'damageRandomEnemy', amount: 2 },
  },

  // Utility powers
  'power:analyze': {
    id: 'power:analyze',
    name: 'Life Tap',
    cost: 2,
    text: 'Draw a card.',
    effect: { type: 'draw', count: 1 },
  },

  // Inferno power - deals damage to all enemies
  'power:inferno': {
    id: 'power:inferno',
    name: 'Hellfire',
    cost: 3,
    text: 'Deal 1 damage to all enemies.',
    effect: { type: 'damageAllEnemies', amount: 1 },
  },
};

// ============================================================================
// TOKEN MINIONS (for hero powers)
// ============================================================================

// These are added to CARDS in cards/schema.js
export const HERO_POWER_TOKENS = {
  'minion:shield-token': {
    id: 'minion:shield-token',
    name: 'Shield',
    type: 'minion',
    stats: { attack: 0, health: 2, cost: 0 },
    keywords: { taunt: true },
    triggers: {},
    text: () => 'Taunt',
    art: 'img/firebaby.png',
  },

  'minion:seedling-token': {
    id: 'minion:seedling-token',
    name: 'Seedling',
    type: 'minion',
    stats: { attack: 0, health: 1, cost: 0 },
    keywords: { growing: { attack: 1, health: 1 } },
    triggers: {
      endOfTurn: [{ keyword: 'growing', ownerOnly: true }],
    },
    text: () => 'At the end of your turn, gain +1/+1',
    art: 'img/plant1.png',
  },
};

// ============================================================================
// CHARACTER DEFINITIONS
// ============================================================================

export const CHARACTERS = {
  // -------------------------------------------------------------------------
  // PLAYER CHARACTERS
  // -------------------------------------------------------------------------

  'char:paladin': {
    id: 'char:paladin',
    name: 'Paladin',
    description: 'A stalwart defender who summons shields and protects allies.',
    heroPower: 'power:small-shield',
    starterDeck: [
      'minion:taunt-2-2',
      'minion:taunt-2-2',
      'minion:earth-guardian',
      'minion:stone-sentinel',
      'minion:shield-3-1',
      'minion:shield-3-1',
      'minion:war-banner',
      'minion:vanilla-2-3',
      'minion:vanilla-2-3',
      'minion:lifesteal-2-2',
    ],
  },

  'char:mage': {
    id: 'char:mage',
    name: 'Fire Mage',
    description: 'An aggressive spellcaster who burns enemies with battlecry damage.',
    heroPower: 'power:sting',
    starterDeck: [
      // Damage battlecries (6 cards)
      'minion:flame-sniper', 'minion:flame-sniper',       // 2 dmg to lowest HP
      'minion:blazing-marksman', 'minion:blazing-marksman', // 3 dmg to lowest HP
      'minion:riptide', 'minion:riptide',                 // 2 AoE damage
      // Aggressive support (4 cards)
      'minion:ember-herald', 'minion:ember-herald',       // Buff ally +2 attack
      'minion:berserker', 'minion:berserker',             // Gains attack when damaged
    ],
  },

  'char:druid': {
    id: 'char:druid',
    name: 'Grove Druid',
    description: 'A patient nature mage whose minions grow stronger each turn.',
    heroPower: 'power:summon-growth',
    starterDeck: [
      // Growing creatures (6 cards)
      'minion:growing-sprite', 'minion:growing-sprite',   // 1/2, gains +1/+1
      'minion:hearty-weed', 'minion:hearty-weed',         // 0/3, gains +1/+1
      'minion:moss-creeper', 'minion:moss-creeper',       // 2/2, gains +1/+1
      // Taunt defense (4 cards)
      'minion:taunt-2-2', 'minion:taunt-2-2',             // 2/2 taunt
      'minion:earth-guardian', 'minion:earth-guardian',   // 2/3 taunt
    ],
  },

  'char:warlock': {
    id: 'char:warlock',
    name: 'Warlock',
    description: 'A dark mage who sacrifices health for cards.',
    heroPower: 'power:analyze',
    starterDeck: [
      'minion:lifesteal-2-2',
      'minion:lifesteal-2-2',
      'minion:deathrattle-wisp',
      'minion:deathrattle-wisp',
      'minion:berserker',
      'minion:berserker',
      'minion:vanilla-2-3',
      'minion:vanilla-2-3',
      'minion:ember-herald',
      'minion:pyre-champion',
    ],
  },

  'char:shaman': {
    id: 'char:shaman',
    name: 'Shaman',
    description: 'A spiritual leader who summons totems and floods the board.',
    heroPower: 'power:summon-wisp',
    starterDeck: [
      'minion:water-conjurer',
      'minion:water-conjurer',
      'minion:riptide',
      'minion:tsunami',
      'minion:war-banner',
      'minion:rallying-cry',
      'minion:vanilla-2-3',
      'minion:vanilla-2-3',
      'minion:deathrattle-wisp',
      'minion:deathrattle-wisp',
    ],
  },

  'char:warrior': {
    id: 'char:warrior',
    name: 'Warrior',
    description: 'A battle-hardened fighter who empowers allies.',
    heroPower: 'power:strength',
    starterDeck: [
      'minion:berserker',
      'minion:berserker',
      'minion:ember-herald',
      'minion:ember-herald',
      'minion:pyre-champion',
      'minion:windfury-1-3',
      'minion:windfury-1-3',
      'minion:taunt-2-2',
      'minion:taunt-2-2',
      'minion:vanilla-2-3',
    ],
  },

  // NOTE: Enemy characters are now in src/enemies/schema.js
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get all player characters (for character selection screen)
 */
export function getPlayerCharacters() {
  return Object.values(CHARACTERS);
}

// NOTE: For enemies, use getEnemiesByTier() etc. from src/enemies/schema.js

/**
 * Get a character by ID
 */
export function getCharacter(characterId) {
  return CHARACTERS[characterId] || null;
}

/**
 * Get a hero power by ID
 */
export function getHeroPower(heroPowerId) {
  return HERO_POWERS[heroPowerId] || null;
}

/**
 * Get a character's hero power definition
 */
export function getCharacterHeroPower(characterId) {
  const char = CHARACTERS[characterId];
  if (!char) return null;
  return HERO_POWERS[char.heroPower] || null;
}
