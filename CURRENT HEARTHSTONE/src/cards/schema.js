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
    stats: { attack: 1, health: 2, cost: 1 },
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
    stats: { cost: 1 },
    keywords: {},
    triggers: {},
    text: (state, owner, zone, index) => 'Deal 2 damage',
    effect: { kind: 'damage', amount: 2, target: 'enemyMinionOrHero' },
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
    keywords: cardDef.keywords || {},
    triggers: cardDef.triggers || {},
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
