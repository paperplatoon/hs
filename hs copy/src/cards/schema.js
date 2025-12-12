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
    art: 'img/plant1.png',
  },
  'minion:vanilla-2-3': {
    id: 'minion:vanilla-2-3',
    name: 'Footman',
    type: CardType.MINION,
    stats: { attack: 2, health: 3, cost: 2 },
    keywords: {},
    triggers: {},
    art: 'img/fireMonster.png',
  },
  'minion:taunt-2-2': {
    id: 'minion:taunt-2-2',
    name: 'Shieldbearer',
    type: CardType.MINION,
    stats: { attack: 2, health: 2, cost: 2 },
    keywords: { taunt: true },
    triggers: {},
    art: 'img/firebaby.png',
  },
  'minion:lifesteal-2-2': {
    id: 'minion:lifesteal-2-2',
    name: 'Blood Adept',
    type: CardType.MINION,
    stats: { attack: 2, health: 2, cost: 3 },
    keywords: { lifesteal: true },
    triggers: {},
    art: 'img/flamingbaby.png',
  },
  'minion:windfury-1-3': {
    id: 'minion:windfury-1-3',
    name: 'Gale Striker',
    type: CardType.MINION,
    stats: { attack: 1, health: 3, cost: 2 },
    keywords: { windfury: true },
    triggers: {},
    art: 'img/waterpuddle.png',
  },
  'minion:shield-3-1': {
    id: 'minion:shield-3-1',
    name: 'Aegis Initiate',
    type: CardType.MINION,
    stats: { attack: 3, health: 1, cost: 2 },
    keywords: { divineShield: true },
    triggers: {},
    art: 'img/waterpuddle.png',
  },
  'minion:spellpower-1': {
    id: 'minion:spellpower-1',
    name: 'Arcane Familiar',
    type: CardType.MINION,
    stats: { attack: 1, health: 2, cost: 2 },
    keywords: { spellDamage: 1 },
    triggers: {},
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
    art: 'img/fireMonster.png',
  },
  'minion:wisp-1-1': {
    id: 'minion:wisp-1-1',
    name: 'Wisp',
    type: CardType.MINION,
    stats: { attack: 1, health: 1, cost: 0 },
    keywords: {},
    triggers: {},
    art: 'img/plant1.png',
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
    art: 'img/plant1.png',
  },
  'spell:bolt': {
    id: 'spell:bolt',
    name: 'Arcane Bolt',
    type: CardType.SPELL,
    stats: { cost: 1 },
    keywords: {},
    triggers: {},
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
