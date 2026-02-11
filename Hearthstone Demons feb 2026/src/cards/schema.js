// Card schema and simple registry
import { uid } from '../state.js';

export const CardType = {
  MINION: 'minion',
  SPELL: 'spell',
  HERO_POWER: 'heroPower',
};

// Static card definitions by id
// Triggers are declarative; keywords map to trigger handlers in trigger registry.
export const CARDS = {
  'minion:growing-sprite': {
    id: 'minion:growing-sprite',
    name: 'Growing Sprite',
    type: CardType.MINION,
    tier: 1,
    stats: { attack: 0, health: 1, cost: 1 },
    keywords: { growing: { attack: 1, health: 1 } },
    triggers: {
      endOfTurn: [{ keyword: 'growing', ownerOnly: true }],
    },
    text: (state, owner, zone, index) => 'At the end of your turn, gain +1/+1',
    art: 'img/plant1.png',
  },
  'minion:vanilla-2-3': {
    id: 'minion:vanilla-2-3',
    name: 'Footman',
    type: CardType.MINION,
    tier: 1,
    stats: { attack: 2, health: 3, cost: 2 },
    keywords: {},
    triggers: {},
    text: (state, owner, zone, index) => '',
    art: 'img/fireMonster.png',
  },
  'minion:taunt-2-2': {
    id: 'minion:taunt-2-2',
    name: 'Shieldbearer',
    type: CardType.MINION,
    tier: 1,
    stats: { attack: 2, health: 2, cost: 2 },
    keywords: { taunt: true },
    triggers: {},
    text: (state, owner, zone, index) => 'Taunt',
    art: 'img/firebaby.png',
  },
  'minion:lifesteal-2-2': {
    id: 'minion:lifesteal-2-2',
    name: 'Blood Adept',
    type: CardType.MINION,
    tier: 1,
    stats: { attack: 2, health: 2, cost: 3 },
    keywords: { lifesteal: true },
    triggers: {},
    text: (state, owner, zone, index) => 'Lifesteal',
    art: 'img/flamingbaby.png',
  },
  'minion:windfury-1-3': {
    id: 'minion:windfury-1-3',
    name: 'Gale Striker',
    type: CardType.MINION,
    tier: 1,
    stats: { attack: 1, health: 3, cost: 2 },
    keywords: { windfury: true },
    triggers: {},
    text: (state, owner, zone, index) => 'Windfury',
    art: 'img/waterpuddle.png',
  },
  'minion:shield-3-1': {
    id: 'minion:shield-3-1',
    name: 'Aegis Initiate',
    type: CardType.MINION,
    tier: 1,
    stats: { attack: 3, health: 1, cost: 2 },
    keywords: { divineShield: true },
    triggers: {},
    text: (state, owner, zone, index) => 'Divine Shield',
    art: 'img/waterpuddle.png',
  },
  'minion:spellpower-1': {
    id: 'minion:spellpower-1',
    name: 'Arcane Familiar',
    type: CardType.MINION,
    tier: 1,
    stats: { attack: 1, health: 2, cost: 2 },
    keywords: { spellDamage: 1 },
    triggers: {},
    text: (state, owner, zone, index) => 'Spell Damage +1',
    art: 'img/waterpuddle.png',
  },
  'minion:berserker': {
    id: 'minion:berserker',
    name: 'Raging Berserker',
    type: CardType.MINION,
    tier: 1,
    stats: { attack: 2, health: 3, cost: 2 },
    keywords: { },
    triggers: {
      onDamage: [{ keyword: 'gain', params: { attack: 1 } }],
    },
    text: (state, owner, zone, index) => 'Whenever this minion takes damage, gain +1 attack',
    art: 'img/fireMonster.png',
  },
  'minion:wisp-1-1': {
    id: 'minion:wisp-1-1',
    name: 'Wisp',
    type: CardType.MINION,
    tier: 1,
    stats: { attack: 1, health: 1, cost: 0 },
    keywords: {},
    triggers: {},
    text: (state, owner, zone, index) => '',
    art: 'img/plant1.png',
  },
  'minion:sprite-1-1': {
    id: 'minion:sprite-1-1',
    name: 'Sprite',
    type: CardType.MINION,
    tier: 1,
    stats: { attack: 1, health: 1, cost: 0 },
    keywords: {},
    triggers: {},
    text: (state, owner, zone, index) => '',
    art: 'img/waterpuddle.png',
  },
  'minion:sprite-2-2': {
    id: 'minion:sprite-2-2',
    name: 'Greater Sprite',
    type: CardType.MINION,
    tier: 1,
    stats: { attack: 2, health: 2, cost: 0 },
    keywords: {},
    triggers: {},
    text: (state, owner, zone, index) => '',
    art: 'img/waterpuddle.png',
  },
  'minion:deathrattle-wisp': {
    id: 'minion:deathrattle-wisp',
    name: 'Brittle Summoner',
    type: CardType.MINION,
    tier: 1,
    stats: { attack: 2, health: 1, cost: 2 },
    keywords: {},
    triggers: {
      onDeath: [{ keyword: 'spawn', params: { cardId: 'minion:wisp-1-1', count: 1 } }],
    },
    text: (state, owner, zone, index) => 'Deathrattle: Summon a 1/1 Wisp',
    art: 'img/plant1.png',
  },
  'minion:hearty-weed': {
    id: 'minion:hearty-weed',
    name: 'Hearty Weed',
    type: CardType.MINION,
    tier: 1,
    stats: { attack: 0, health: 3, cost: 1 },
    keywords: { growing: { attack: 1, health: 1 } },
    triggers: {
      endOfTurn: [{ keyword: 'growing', ownerOnly: true }],
    },
    text: (state, owner, zone, index) => 'At the end of your turn, gain +1/+1',
    art: 'img/plant1.png',
  },
  'minion:moss-creeper': {
    id: 'minion:moss-creeper',
    name: 'Moss Creeper',
    type: CardType.MINION,
    tier: 1,
    stats: { attack: 2, health: 2, cost: 2 },
    keywords: { growing: { attack: 1, health: 1 } },
    triggers: {
      endOfTurn: [{ keyword: 'growing', ownerOnly: true }],
    },
    text: (state, owner, zone, index) => 'At the end of your turn, gain +1/+1',
    art: 'img/plant1.png',
  },
  'minion:ember-herald': {
    id: 'minion:ember-herald',
    name: 'Ember Herald',
    type: CardType.MINION,
    tier: 1,
    stats: { attack: 2, health: 1, cost: 1 },
    keywords: { warcry: { attack: 2 } },
    triggers: {
      onSummon: [{ keyword: 'warcry' }],
    },
    text: (state, owner, zone, index) => 'Battlecry: Give a random friendly minion +2 attack',
    art: 'img/fireMonster.png',
  },
  'minion:pyre-champion': {
    id: 'minion:pyre-champion',
    name: 'Pyre Champion',
    type: CardType.MINION,
    tier: 2,
    stats: { attack: 4, health: 3, cost: 3 },
    keywords: { warcry: { attack: 3 } },
    triggers: {
      onSummon: [{ keyword: 'warcry' }],
    },
    text: (state, owner, zone, index) => 'Battlecry: Give a random friendly minion +3 attack',
    art: 'img/fireMonster.png',
  },
  'minion:flame-sniper': {
    id: 'minion:flame-sniper',
    name: 'Flame Sniper',
    type: CardType.MINION,
    tier: 1,
    stats: { attack: 3, health: 2, cost: 2 },
    keywords: { snipe: { damage: 2 } },
    triggers: {
      onSummon: [{ keyword: 'snipe' }],
    },
    text: (state, owner, zone, index) => 'Battlecry: Deal 2 damage to the lowest health enemy',
    art: 'img/fireMonster.png',
  },
  'minion:blazing-marksman': {
    id: 'minion:blazing-marksman',
    name: 'Blazing Marksman',
    type: CardType.MINION,
    tier: 2,
    stats: { attack: 3, health: 3, cost: 3 },
    keywords: { snipe: { damage: 3 } },
    triggers: {
      onSummon: [{ keyword: 'snipe' }],
    },
    text: (state, owner, zone, index) => 'Battlecry: Deal 3 damage to the lowest health enemy',
    art: 'img/fireMonster.png',
  },
  'minion:water-conjurer': {
    id: 'minion:water-conjurer',
    name: 'Water Conjurer',
    type: CardType.MINION,
    tier: 1,
    stats: { attack: 1, health: 4, cost: 3 },
    keywords: {},
    triggers: {
      endOfTurn: [{ keyword: 'spawn', ownerOnly: true, params: { cardId: 'minion:sprite-1-1', count: 1 } }],
    },
    text: (state, owner, zone, index) => 'At the end of your turn, summon a 1/1 Sprite',
    art: 'img/waterpuddle.png',
  },
  'minion:tidal-summoner': {
    id: 'minion:tidal-summoner',
    name: 'Tidal Summoner',
    type: CardType.MINION,
    tier: 2,
    stats: { attack: 2, health: 3, cost: 4 },
    keywords: {},
    triggers: {
      endOfTurn: [{ keyword: 'spawn', ownerOnly: true, params: { cardId: 'minion:sprite-2-2', count: 1 } }],
    },
    text: (state, owner, zone, index) => 'At the end of your turn, summon a 2/2 Greater Sprite',
    art: 'img/waterpuddle.png',
  },
  'minion:riptide': {
    id: 'minion:riptide',
    name: 'Riptide',
    type: CardType.MINION,
    tier: 1,
    stats: { attack: 1, health: 4, cost: 3 },
    text: (state, owner, zone, index) => 'Battlecry: Deal 2 damage to all enemies',
    keywords: { deluge: { damage: 2 } },
    triggers: {
      onSummon: [{ keyword: 'deluge' }],
    },
    art: 'img/waterpuddle.png',
  },
  'minion:tsunami': {
    id: 'minion:tsunami',
    name: 'Tsunami',
    type: CardType.MINION,
    tier: 2,
    stats: { attack: 2, health: 4, cost: 5 },
    text: (state, owner, zone, index) => 'Battlecry: Deal 3 damage to all enemies',
    keywords: { deluge: { damage: 3 } },
    triggers: {
      onSummon: [{ keyword: 'deluge' }],
    },
    art: 'img/waterpuddle.png',
  },
  'minion:earth-guardian': {
    id: 'minion:earth-guardian',
    name: 'Earth Guardian',
    type: CardType.MINION,
    tier: 1,
    stats: { attack: 2, health: 3, cost: 2 },
    keywords: { taunt: true },
    triggers: {},
    text: (state, owner, zone, index) => 'Enemies must attack this creature',
    art: 'img/plant1.png',
  },
  'minion:stone-sentinel': {
    id: 'minion:stone-sentinel',
    name: 'Stone Sentinel',
    type: CardType.MINION,
    tier: 2,
    stats: { attack: 2, health: 5, cost: 3 },
    keywords: { taunt: true },
    triggers: {},
    text: (state, owner, zone, index) => 'Enemies must attack this creature',
    art: 'img/plant1.png',
  },
  'minion:war-banner': {
    id: 'minion:war-banner',
    name: 'War Banner',
    type: CardType.MINION,
    tier: 1,
    stats: { attack: 2, health: 2, cost: 3 },
    keywords: { bolster: { attack: 1, health: 1 } },
    triggers: {
      onSummon: [{ keyword: 'bolster' }],
    },
    text: (state, owner, zone, index) => 'Battlecry: Give all other friendly minions +1/+1',
    art: 'img/plant1.png',
  },
  'minion:rallying-cry': {
    id: 'minion:rallying-cry',
    name: 'Rallying Cry',
    type: CardType.MINION,
    tier: 2,
    stats: { attack: 3, health: 3, cost: 5 },
    keywords: { bolster: { attack: 2, health: 2 } },
    triggers: {
      onSummon: [{ keyword: 'bolster' }],
    },
    text: (state, owner, zone, index) => 'Battlecry: Give all other friendly minions +2/+2',
    art: 'img/fireMonster.png',
  },
  'spell:bolt': {
    id: 'spell:bolt',
    name: 'Arcane Bolt',
    type: CardType.SPELL,
    tier: 1,
    stats: { cost: 1 },
    keywords: {},
    triggers: {},
    text: (state, owner, zone, index) => 'Deal 2 damage',
    effect: { kind: 'damage', amount: 2, target: 'enemyMinionOrHero' },
  },

  // =========================================================================
  // WIND CREATURES
  // =========================================================================

  'minion:wind-sprite': {
    id: 'minion:wind-sprite',
    name: 'Wind Sprite',
    type: CardType.MINION,
    tier: 1,
    element: 'wind',
    stats: { attack: 1, health: 2, cost: 1 },
    keywords: { flock: { attack: 1 } },
    triggers: {
      onSummon: [{ keyword: 'flock' }],
    },
    text: (state, owner, zone, index) => 'Battlecry: Give all other Wind allies +1 attack',
    art: 'img/waterpuddle.png',
  },

  'minion:gale-rider': {
    id: 'minion:gale-rider',
    name: 'Gale Rider',
    type: CardType.MINION,
    tier: 1,
    element: 'wind',
    stats: { attack: 2, health: 3, cost: 2 },
    keywords: { gust: { attack: 1, health: 1 } },
    triggers: {
      endOfTurn: [{ keyword: 'gust', ownerOnly: true }],
    },
    text: (state, owner, zone, index) => 'At the end of your turn, give a random other ally +1/+1',
    art: 'img/waterpuddle.png',
  },

  'minion:storm-herald': {
    id: 'minion:storm-herald',
    name: 'Storm Herald',
    type: CardType.MINION,
    tier: 2,
    element: 'wind',
    stats: { attack: 3, health: 3, cost: 3 },
    keywords: { flock: { attack: 2 } },
    triggers: {
      onSummon: [{ keyword: 'flock' }],
    },
    text: (state, owner, zone, index) => 'Battlecry: Give all other Wind allies +2 attack',
    art: 'img/waterpuddle.png',
  },

  'minion:tempest-caller': {
    id: 'minion:tempest-caller',
    name: 'Tempest Caller',
    type: CardType.MINION,
    tier: 2,
    element: 'wind',
    stats: { attack: 2, health: 4, cost: 4 },
    keywords: { gust: { attack: 2, health: 1 } },
    triggers: {
      endOfTurn: [{ keyword: 'gust', ownerOnly: true }],
    },
    text: (state, owner, zone, index) => 'At the end of your turn, give a random other ally +2/+1',
    art: 'img/waterpuddle.png',
  },

  // =========================================================================
  // EARTH CREATURES
  // =========================================================================

  'minion:grove-tender': {
    id: 'minion:grove-tender',
    name: 'Grove Tender',
    type: CardType.MINION,
    tier: 1,
    element: 'earth',
    stats: { attack: 1, health: 3, cost: 2 },
    keywords: { rejuvenate: { amount: 1 } },
    triggers: {
      endOfTurn: [{ keyword: 'rejuvenate', ownerOnly: true }],
    },
    text: (state, owner, zone, index) => 'At the end of your turn, heal all friendly characters 1',
    art: 'img/plant1.png',
  },

  'minion:earthen-healer': {
    id: 'minion:earthen-healer',
    name: 'Earthen Healer',
    type: CardType.MINION,
    tier: 1,
    element: 'earth',
    stats: { attack: 2, health: 4, cost: 3 },
    keywords: { mend: { amount: 3 } },
    triggers: {
      endOfTurn: [{ keyword: 'mend', ownerOnly: true }],
    },
    text: (state, owner, zone, index) => 'At the end of your turn, heal the most damaged ally 3',
    art: 'img/plant1.png',
  },

  'minion:life-warden': {
    id: 'minion:life-warden',
    name: 'Life Warden',
    type: CardType.MINION,
    tier: 2,
    element: 'earth',
    stats: { attack: 2, health: 5, cost: 4 },
    keywords: { rejuvenate: { amount: 2 } },
    triggers: {
      endOfTurn: [{ keyword: 'rejuvenate', ownerOnly: true }],
    },
    text: (state, owner, zone, index) => 'At the end of your turn, heal all friendly characters 2',
    art: 'img/plant1.png',
  },

  'minion:ancient-mender': {
    id: 'minion:ancient-mender',
    name: 'Ancient Mender',
    type: CardType.MINION,
    tier: 2,
    element: 'earth',
    stats: { attack: 3, health: 6, cost: 5 },
    keywords: { mend: { amount: 5 } },
    triggers: {
      endOfTurn: [{ keyword: 'mend', ownerOnly: true }],
    },
    text: (state, owner, zone, index) => 'At the end of your turn, heal the most damaged ally 5',
    art: 'img/plant1.png',
  },

  // =========================================================================
  // INFERNO CREATURES
  // =========================================================================

  'minion:smoldering-ember': {
    id: 'minion:smoldering-ember',
    name: 'Smoldering Ember',
    type: CardType.MINION,
    tier: 1,
    stats: { attack: 0, health: 3, cost: 2 },
    keywords: { inferno: { damage: 1 } },
    triggers: {
      endOfTurn: [{ keyword: 'inferno', ownerOnly: true }],
    },
    text: (state, owner, zone, index) => 'At the end of your turn, deal 1 damage to all enemies',
    art: 'img/fireMonster.png',
  },

  'minion:burning-sentinel': {
    id: 'minion:burning-sentinel',
    name: 'Burning Sentinel',
    type: CardType.MINION,
    tier: 1,
    stats: { attack: 1, health: 4, cost: 3 },
    keywords: { inferno: { damage: 1 } },
    triggers: {
      endOfTurn: [{ keyword: 'inferno', ownerOnly: true }],
    },
    text: (state, owner, zone, index) => 'At the end of your turn, deal 1 damage to all enemies',
    art: 'img/fireMonster.png',
  },

  'minion:pyroclasm': {
    id: 'minion:pyroclasm',
    name: 'Pyroclasm',
    type: CardType.MINION,
    tier: 2,
    stats: { attack: 1, health: 5, cost: 4 },
    keywords: { inferno: { damage: 1, grows: true } },
    triggers: {
      endOfTurn: [{ keyword: 'inferno', ownerOnly: true }],
    },
    text: (state, owner, zone, index) => {
      // Show current damage if on board
      if (zone === 'board' && state) {
        const board = state.players[owner]?.board;
        const minion = board?.[index];
        const dmg = minion?.keywords?.inferno?.damage || 1;
        return `At the end of your turn, deal ${dmg} damage to all enemies. Damage increases each turn.`;
      }
      return 'At the end of your turn, deal 1 damage to all enemies. Damage increases each turn.';
    },
    art: 'img/fireMonster.png',
  },

  // =========================================================================
  // HERO POWER TOKENS
  // =========================================================================

  'minion:shield-token': {
    id: 'minion:shield-token',
    name: 'Shield',
    type: CardType.MINION,
    tier: 1,
    stats: { attack: 0, health: 2, cost: 0 },
    keywords: { taunt: true },
    triggers: {},
    text: (state, owner, zone, index) => 'Taunt',
    art: 'img/firebaby.png',
  },

  'minion:seedling-token': {
    id: 'minion:seedling-token',
    name: 'Seedling',
    type: CardType.MINION,
    tier: 1,
    stats: { attack: 0, health: 1, cost: 0 },
    keywords: { growing: { attack: 1, health: 1 } },
    triggers: {
      endOfTurn: [{ keyword: 'growing', ownerOnly: true }],
    },
    text: (state, owner, zone, index) => 'At the end of your turn, gain +1/+1',
    art: 'img/plant1.png',
  },

  // =========================================================================
  // EVOLUTION CHAINS
  // =========================================================================

  // Fire Imp → Fire Demon → Fire Lord
  'minion:fire-imp': {
    id: 'minion:fire-imp',
    name: 'Fire Imp',
    type: CardType.MINION,
    tier: 1,
    stats: { attack: 1, health: 2, cost: 1 },
    keywords: { evolve: { cardId: 'minion:fire-demon' } },
    triggers: {
      onSummon: [{ keyword: 'evolve' }],
    },
    text: (state, owner, zone, index) => 'Battlecry: Add a Fire Demon to your hand',
    art: 'img/fireMonster.png',
  },
  'minion:fire-demon': {
    id: 'minion:fire-demon',
    name: 'Fire Demon',
    type: CardType.MINION,
    tier: 2,
    collectible: false,
    stats: { attack: 4, health: 5, cost: 4 },
    keywords: { snipe: { damage: 3 }, evolve: { cardId: 'minion:fire-lord' } },
    triggers: {
      onSummon: [{ keyword: 'snipe' }, { keyword: 'evolve' }],
    },
    text: (state, owner, zone, index) => 'Battlecry: Deal 3 to lowest enemy. Add a Fire Lord to your hand',
    art: 'img/fireMonster.png',
  },
  'minion:fire-lord': {
    id: 'minion:fire-lord',
    name: 'Fire Lord',
    type: CardType.MINION,
    tier: 3,
    collectible: false,
    stats: { attack: 8, health: 8, cost: 8 },
    keywords: { deluge: { damage: 4 } },
    triggers: {
      onSummon: [{ keyword: 'deluge' }],
    },
    text: (state, owner, zone, index) => 'Battlecry: Deal 4 damage to all enemies',
    art: 'img/fireMonster.png',
  },

  // Thorn Sprout → Thorn Beast → Thorn Titan
  'minion:thorn-sprout': {
    id: 'minion:thorn-sprout',
    name: 'Thorn Sprout',
    type: CardType.MINION,
    tier: 1,
    stats: { attack: 1, health: 3, cost: 2 },
    keywords: { taunt: true, evolve: { cardId: 'minion:thorn-beast' } },
    triggers: {
      onSummon: [{ keyword: 'evolve' }],
    },
    text: (state, owner, zone, index) => 'Taunt. Battlecry: Add a Thorn Beast to your hand',
    art: 'img/plant1.png',
  },
  'minion:thorn-beast': {
    id: 'minion:thorn-beast',
    name: 'Thorn Beast',
    type: CardType.MINION,
    tier: 2,
    collectible: false,
    stats: { attack: 3, health: 5, cost: 4 },
    keywords: { taunt: true, evolve: { cardId: 'minion:thorn-titan' } },
    triggers: {
      onSummon: [{ keyword: 'evolve' }],
    },
    text: (state, owner, zone, index) => 'Taunt. Battlecry: Add a Thorn Titan to your hand',
    art: 'img/plant1.png',
  },
  'minion:thorn-titan': {
    id: 'minion:thorn-titan',
    name: 'Thorn Titan',
    type: CardType.MINION,
    tier: 3,
    collectible: false,
    stats: { attack: 6, health: 10, cost: 7 },
    keywords: { taunt: true, bolster: { attack: 2, health: 2 } },
    triggers: {
      onSummon: [{ keyword: 'bolster' }],
    },
    text: (state, owner, zone, index) => 'Taunt. Battlecry: Give all other friendly minions +2/+2',
    art: 'img/plant1.png',
  },

  // Tide Caller → Tide Shaper → Tide Leviathan
  'minion:tide-caller': {
    id: 'minion:tide-caller',
    name: 'Tide Caller',
    type: CardType.MINION,
    tier: 1,
    stats: { attack: 2, health: 2, cost: 1 },
    keywords: { evolve: { cardId: 'minion:tide-shaper' } },
    triggers: {
      onSummon: [{ keyword: 'evolve' }],
    },
    text: (state, owner, zone, index) => 'Battlecry: Add a Tide Shaper to your hand',
    art: 'img/waterpuddle.png',
  },
  'minion:tide-shaper': {
    id: 'minion:tide-shaper',
    name: 'Tide Shaper',
    type: CardType.MINION,
    tier: 2,
    collectible: false,
    stats: { attack: 3, health: 4, cost: 3 },
    keywords: { warcry: { attack: 2 }, evolve: { cardId: 'minion:tide-leviathan' } },
    triggers: {
      onSummon: [{ keyword: 'warcry' }, { keyword: 'evolve' }],
    },
    text: (state, owner, zone, index) => 'Battlecry: Give a random ally +2 attack. Add a Tide Leviathan to your hand',
    art: 'img/waterpuddle.png',
  },
  'minion:tide-leviathan': {
    id: 'minion:tide-leviathan',
    name: 'Tide Leviathan',
    type: CardType.MINION,
    tier: 3,
    collectible: false,
    stats: { attack: 7, health: 7, cost: 7 },
    keywords: { windfury: true, lifesteal: true },
    triggers: {},
    text: (state, owner, zone, index) => 'Windfury. Lifesteal',
    art: 'img/waterpuddle.png',
  },

  // Tide Dancer → Undertow → Maelstrom
  'minion:tide-dancer': {
    id: 'minion:tide-dancer',
    name: 'Tide Dancer',
    type: CardType.MINION,
    tier: 1,
    element: 'water',
    stats: { attack: 1, health: 1, cost: 1 },
    keywords: { recall: { costReduction: 0 }, evolve: { cardId: 'minion:undertow' } },
    triggers: {
      onSummon: [{ keyword: 'recall' }, { keyword: 'evolve' }],
    },
    text: (s, o, z, i) => 'Battlecry: Return a random friendly minion to your hand. Add an Undertow to your hand',
    art: 'img/waterpuddle.png',
  },
  'minion:undertow': {
    id: 'minion:undertow',
    name: 'Undertow',
    type: CardType.MINION,
    tier: 2,
    collectible: false,
    element: 'water',
    stats: { attack: 2, health: 2, cost: 2 },
    keywords: { recall: { costReduction: 2 }, evolve: { cardId: 'minion:maelstrom' } },
    triggers: {
      onSummon: [{ keyword: 'recall' }, { keyword: 'evolve' }],
    },
    text: (s, o, z, i) => 'Battlecry: Return a random friendly minion to your hand. It costs 2 less. Add a Maelstrom to your hand',
    art: 'img/waterpuddle.png',
  },
  'minion:maelstrom': {
    id: 'minion:maelstrom',
    name: 'Maelstrom',
    type: CardType.MINION,
    tier: 3,
    collectible: false,
    element: 'water',
    stats: { attack: 4, health: 4, cost: 4 },
    keywords: { recallAll: { setCostTo: 0 } },
    triggers: {
      onSummon: [{ keyword: 'recallAll' }],
    },
    text: (s, o, z, i) => 'Battlecry: Return all friendly minions to your hand. They cost 0',
    art: 'img/waterpuddle.png',
  },

  // Tidecrest Spawner → Tidecrest Swarmer → Tidecrest Flood (Water: token swarm)
  'minion:tidecrest-spawner': {
    id: 'minion:tidecrest-spawner',
    name: 'Tidecrest Spawner',
    type: CardType.MINION,
    tier: 1,
    stats: { attack: 1, health: 2, cost: 2 },
    keywords: { evolve: { cardId: 'minion:tidecrest-swarmer' } },
    triggers: {
      onSummon: [{ keyword: 'spawn', params: { cardId: 'minion:sprite-1-1', count: 1 } }, { keyword: 'evolve' }],
    },
    text: (state, owner, zone, index) => 'Battlecry: Summon a 1/1 Sprite. Add a Tidecrest Swarmer to your hand',
    art: 'img/waterpuddle.png',
  },
  'minion:tidecrest-swarmer': {
    id: 'minion:tidecrest-swarmer',
    name: 'Tidecrest Swarmer',
    type: CardType.MINION,
    tier: 2,
    collectible: false,
    stats: { attack: 2, health: 3, cost: 4 },
    keywords: { evolve: { cardId: 'minion:tidecrest-flood' } },
    triggers: {
      onSummon: [{ keyword: 'spawn', params: { cardId: 'minion:sprite-1-1', count: 2 } }, { keyword: 'evolve' }],
    },
    text: (state, owner, zone, index) => 'Battlecry: Summon 2 1/1 Sprites. Add a Tidecrest Flood to your hand',
    art: 'img/waterpuddle.png',
  },
  'minion:tidecrest-flood': {
    id: 'minion:tidecrest-flood',
    name: 'Tidecrest Flood',
    type: CardType.MINION,
    tier: 3,
    collectible: false,
    stats: { attack: 1, health: 1, cost: 2 },
    keywords: {},
    triggers: {
      onSummon: [{ keyword: 'spawn', params: { cardId: 'minion:sprite-1-1', count: 4 } }],
    },
    text: (state, owner, zone, index) => 'Battlecry: Summon 4 1/1 Sprites',
    art: 'img/waterpuddle.png',
  },

  // Songbird → Storm Raptor → Sky Sovereign (Wind: flock buffing)
  'minion:songbird': {
    id: 'minion:songbird',
    name: 'Songbird',
    type: CardType.MINION,
    tier: 1,
    stats: { attack: 0, health: 2, cost: 1 },
    keywords: { gust: { attack: 1, health: 1 }, evolve: { cardId: 'minion:storm-raptor' } },
    triggers: {
      endOfTurn: [{ keyword: 'gust', ownerOnly: true }],
      onSummon: [{ keyword: 'evolve' }],
    },
    text: (state, owner, zone, index) => 'End of turn: Give a random other ally +1/+1. Battlecry: Add a Storm Raptor to your hand',
    art: 'img/waterpuddle.png',
  },
  'minion:storm-raptor': {
    id: 'minion:storm-raptor',
    name: 'Storm Raptor',
    type: CardType.MINION,
    tier: 2,
    collectible: false,
    stats: { attack: 1, health: 4, cost: 3 },
    keywords: { gust: { attack: 2, health: 2 }, evolve: { cardId: 'minion:sky-sovereign' } },
    triggers: {
      endOfTurn: [{ keyword: 'gust', ownerOnly: true }],
      onSummon: [{ keyword: 'evolve' }],
    },
    text: (state, owner, zone, index) => 'End of turn: Give a random other ally +2/+2. Battlecry: Add a Sky Sovereign to your hand',
    art: 'img/waterpuddle.png',
  },
  'minion:sky-sovereign': {
    id: 'minion:sky-sovereign',
    name: 'Sky Sovereign',
    type: CardType.MINION,
    tier: 3,
    collectible: false,
    stats: { attack: 2, health: 5, cost: 4 },
    keywords: { bolster: { attack: 2, health: 2 } },
    triggers: {
      endOfTurn: [{ keyword: 'bolster', ownerOnly: true }],
    },
    text: (state, owner, zone, index) => 'End of turn: Give all other friendly minions +2/+2',
    art: 'img/waterpuddle.png',
  },

  // Ember Shot → Flame Cannon → Infernal Barrage (Fire: hero damage)
  'minion:ember-shot': {
    id: 'minion:ember-shot',
    name: 'Ember Shot',
    type: CardType.MINION,
    tier: 1,
    stats: { attack: 1, health: 2, cost: 1 },
    keywords: { scorch: { damage: 2 }, evolve: { cardId: 'minion:flame-cannon' } },
    triggers: {
      onSummon: [{ keyword: 'scorch' }, { keyword: 'evolve' }],
    },
    text: (state, owner, zone, index) => 'Battlecry: Deal 2 damage to enemy hero. Add a Flame Cannon to your hand',
    art: 'img/fireMonster.png',
  },
  'minion:flame-cannon': {
    id: 'minion:flame-cannon',
    name: 'Flame Cannon',
    type: CardType.MINION,
    tier: 2,
    collectible: false,
    stats: { attack: 3, health: 4, cost: 3 },
    keywords: { scorch: { damage: 4 }, evolve: { cardId: 'minion:infernal-barrage' } },
    triggers: {
      onSummon: [{ keyword: 'scorch' }, { keyword: 'evolve' }],
    },
    text: (state, owner, zone, index) => 'Battlecry: Deal 4 damage to enemy hero. Add an Infernal Barrage to your hand',
    art: 'img/fireMonster.png',
  },
  'minion:infernal-barrage': {
    id: 'minion:infernal-barrage',
    name: 'Infernal Barrage',
    type: CardType.MINION,
    tier: 3,
    collectible: false,
    stats: { attack: 6, health: 6, cost: 6 },
    keywords: { scorch: { damage: 6 } },
    triggers: {
      onSummon: [{ keyword: 'scorch' }],
    },
    text: (state, owner, zone, index) => 'Battlecry: Deal 6 damage to enemy hero',
    art: 'img/fireMonster.png',
  },

  // Zephyr Haggler → Gale Sovereign
  'minion:zephyr-haggler': {
    id: 'minion:zephyr-haggler',
    name: 'Zephyr Haggler',
    type: CardType.MINION,
    tier: 1,
    element: 'wind',
    stats: { attack: 0, health: 2, cost: 1 },
    keywords: { discount: { amount: 1 }, evolve: { cardId: 'minion:gale-sovereign' } },
    triggers: {
      endOfTurn: [{ keyword: 'discount', ownerOnly: true }],
      onSummon: [{ keyword: 'evolve' }],
    },
    text: (state, owner, zone, index) =>
      'End of turn: A random minion in hand costs 1 less. Battlecry: Add a Gale Sovereign to your hand',
    art: 'img/waterpuddle.png',
  },
  'minion:gale-sovereign': {
    id: 'minion:gale-sovereign',
    name: 'Gale Sovereign',
    type: CardType.MINION,
    tier: 2,
    collectible: false,
    element: 'wind',
    stats: { attack: 2, health: 3, cost: 4 },
    keywords: { windfall: true },
    triggers: {
      onSummon: [{ keyword: 'windfall' }],
    },
    text: (state, owner, zone, index) =>
      'Battlecry: Non-tier 1 minions cost 1 less (permanent)',
    art: 'img/waterpuddle.png',
  },
};

export function createMinionInstance(cardDef) {
  return {
    cardId: cardDef.id,
    name: cardDef.name,
    attack: cardDef.stats.attack,
    health: cardDef.stats.health,
    maxHealth: cardDef.stats.health,
    cost: cardDef.stats.cost,
    tier: cardDef.tier || 1,
    keywords: cardDef.keywords || {},
    triggers: cardDef.triggers || {},
    element: cardDef.element || null,  // e.g., 'wind', 'earth', 'fire', 'water'
    art: cardDef.art || null,
    uid: uid(),
    canAttack: false,
    summoningSickness: true,
    owner: null,
  };
}

export function createSpellInstance(cardDef) {
  return {
    cardId: cardDef.id,
    name: cardDef.name,
    cost: cardDef.stats.cost,
    tier: cardDef.tier || 1,
    effect: cardDef.effect,
    owner: null,
  };
}

export function createCardInstance(cardId) {
  const def = CARDS[cardId];
  if (!def) throw new Error(`Unknown card id: ${cardId}`);
  if (def.type === CardType.MINION) return createMinionInstance(def);
  if (def.type === CardType.SPELL) return createSpellInstance(def);
  return { cardId: def.id, name: def.name };
}
