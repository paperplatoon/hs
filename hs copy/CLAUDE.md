# Claude Code Guidelines for Hearthstone-style Card Game

## Project Philosophy

This is a **Hearthstone-style card battler** built with vanilla JavaScript, focusing on functional programming, clean architecture, and minimal dependencies.

### Core Principles

1. **Small, focused, reusable functions** - Each function does one thing well
2. **State-driven rendering** - UI is always derived from game state, never stores internal state
3. **Immutability** - Use `withState()` for all state updates, never mutate directly
4. **Computed over stored** - Derive values from state at use-time rather than storing cached/derived state
5. **Single source of truth** - Each piece of data lives in exactly one place
6. **No over-engineering** - Only add complexity when explicitly needed, avoid premature abstractions

## Architecture Patterns

### State Management

```javascript
// ALWAYS use withState for mutations
import { withState, pushLog } from '../state.js';

let s = withState(state, (ns) => {
  ns.players[playerId].mana.current -= cost;
  pushLog(ns, 'Spent mana');
});
```

**Key state locations:**
- `state.players[playerId].board` - Array of minions on battlefield (max 6)
- `state.players[playerId].hand` - Array of cards in hand
- `state.players[playerId].deck` - Array of cards in deck
- `state.players[playerId].effects.permanent.*` - Persistent buffs (survive across combats)
- `state.players[playerId].effects.combat.*` - Combat-only buffs (reset between fights)
- `state.players[playerId].effects.multipliers.*` - Numeric multipliers for mechanics

### Keyword/Trigger System

Cards are **declarative**. Keywords store parameters, triggers define when handlers fire:

```javascript
{
  keywords: { growing: { attack: 1, health: 1 } },  // Parameters
  triggers: {
    endOfTurn: [{ keyword: 'growing', ownerOnly: true }]  // When to fire
  }
}
```

**Handlers** live in `src/triggers/registry.js`:
- Pure functions: `(state, ctx) => newState`
- Context includes: `{ ownerId, minionIndex, ...keywordParams, ...triggerParams }`
- Never mutate state directly, always return new state

**Trigger types:**
- `onSummon` - When minion enters battlefield
- `endOfTurn` - At end of owner's turn
- `onDeath` - When minion dies
- `onDamage` - When minion takes damage
- `onAttack` - When minion attacks

### Card Text as Functions

**ALL card text must be functions** with signature `(state, owner, zone, index)`:

```javascript
{
  text: (state, owner, zone, index) => 'Battlecry: Deal 2 damage',
}
```

**Why:** Enables dynamic text based on game state, position, or future effects. Even static text uses functions for consistency.

**Parameters:**
- `state` - Full game state
- `owner` - Player ID ('player' or 'opponent')
- `zone` - Where card is ('hand', 'board', or null for gallery)
- `index` - Position in array (enables positional effects)

### Computed Derived State

**Prefer computing values on-demand** over storing flags:

```javascript
// GOOD: Compute when needed
function getProtectedMinionIndices(state, playerId) {
  const board = state.players[playerId].board;
  const protected = new Set();
  board.forEach((minion, idx) => {
    if (minion.keywords?.bubble) {
      if (idx > 0) protected.add(idx - 1);
      if (idx < board.length - 1) protected.add(idx + 1);
    }
  });
  return protected;
}

// BAD: Store flags that can get out of sync
minion.protectedByBubble = true; // DON'T DO THIS
```

**Benefits:**
- Always accurate, can't desync
- No maintenance burden when board changes
- Single source of truth
- Easy to test

## File Organization

```
src/
├── state.js              # Game state structure, Players/Phases constants
├── engine/
│   └── actions.js        # Core game actions (attack, play card, etc.)
├── cards/
│   └── schema.js         # Card definitions (CARDS object)
├── triggers/
│   └── registry.js       # KeywordHandlers and trigger runners
├── render/
│   └── render.js         # UI rendering (NO internal state)
└── ui.css                # All styles (CSS custom properties for theming)
```

## Naming Conventions

- **File names**: kebab-case (`schema.js`, `trigger-registry.js`)
- **Card IDs**: `'type:name'` format (`'minion:growing-sprite'`, `'spell:bolt'`)
- **Properties**: camelCase (`summoningSickness`, `maxHealth`)
- **Constants**: UPPER_SNAKE_CASE exported objects (`Players.PLAYER`, `Phases.MAIN`)
- **Functions**: camelCase verbs (`attackTarget`, `runOnSummonTriggers`)

## Game Constants

- **Board limit**: 6 minions maximum per player
- **Starting hand**: 5 cards
- **Max mana**: 10
- **Player IDs**: `Players.PLAYER` and `Players.OPPONENT` (never hardcode strings)
- **Start of turn**: Players draw 1 card and gain 1 max mana (capped at 10)

## Fatigue Mechanic

When a player's deck is empty and they try to draw a card:
- They take damage instead of drawing
- First fatigue: 1 damage
- Second fatigue: 2 damage
- Third fatigue: 3 damage
- Continues scaling infinitely

**Implementation:**
- Tracked in `effects.combat.fatigueCount` (resets between combats)
- `drawOne()` automatically handles fatigue damage
- Formula: `damage = fatigueCount + 1`, then increment count
- Works for both automatic turn draws and manual draw effects

## Keyword Interactions

**Priority order for targeting:**
1. **Bubble** (future): Protected minions can't be targeted at all
2. **Taunt**: If enemy has taunt minions, must target one of them
3. **Divine Shield**: Prevents first instance of damage, then pops

**Implemented keywords:**
- `taunt` - Must be targeted first
- `divineShield` - Absorbs first damage
- `windfury` - Can attack twice per turn
- `lifesteal` - Heal for damage dealt
- `spellDamage: N` - Increases spell damage by N
- `growing: {attack, health}` - Gains stats at end of turn
- `warcry: {attack}` - Buffs random ally (excluding self)
- `bolster: {attack, health}` - Buffs all other allies on summon
- `snipe: {damage}` - Damages lowest HP enemy on summon
- `deluge: {damage}` - AoE damage to all enemies on summon
- `amplify` - Aura: Your battlecries trigger an extra time
- `reanimator` - Aura: Your deathrattles trigger an extra time

## Effects System (Meta-Progression)

For mechanics that can stack or persist across combats:

```javascript
// Helper function computes total from all sources
function getBattlecryTriggerCount(state, playerId) {
  const player = state.players[playerId];
  let count = 1; // base
  count += player.effects.permanent?.battlecryBonus || 0;  // Meta-progression
  count += player.effects.combat?.battlecryBonus || 0;     // This combat only
  player.board.forEach(m => {
    if (m.keywords?.amplify) count += 1;  // Aura from minions
  });
  return count;
}

// Same pattern for deathrattles
function getDeathTriggerCount(state, playerId) {
  const player = state.players[playerId];
  let count = 1;
  count += player.effects.permanent?.deathBonus || 0;
  count += player.effects.combat?.deathBonus || 0;
  player.board.forEach(m => {
    if (m.keywords?.reanimator) count += 1;
  });
  return count;
}
```

**Three sources:**
1. **Permanent** - From meta-progression, survives combats
2. **Combat** - From spells/effects this combat, reset between fights
3. **Aura** - From keywords on minions currently on board

**Resetting combat effects:**
```javascript
import { resetCombatModifiers } from './src/state.js';

// Call this between combats to reset all combat.* effects
// Resets: battlecryBonus, deathBonus, fatigueCount
state = resetCombatModifiers(state);
```

## UI/Rendering

- **State-driven**: Render functions are pure `(state) => HTML`
- **No internal state**: UI never stores data, always derives from game state
- **Vanilla JS**: DOM manipulation via `document.createElement`, `innerHTML`
- **CSS custom properties**: Use `var(--glow)`, `var(--hp)` etc. for theming
- **Utility classes**: `.u-glow`, `.u-pulse`, `.u-shake` for reusable animations

## Code Style

- Use arrow functions for short handlers
- Use function declarations for exported/named functions
- Prefer `const` over `let` where possible
- Use optional chaining: `m.keywords?.taunt`
- Use nullish coalescing: `amount || 0`
- Comments only where logic isn't self-evident

## Common Patterns

### Modifying State
```javascript
let s = withState(state, (ns) => {
  ns.players[playerId].life += 5;
  pushLog(ns, 'Healed 5');
});
```

### Handling Deaths
```javascript
// 1. Collect dead minions
const dead = board.filter(m => m.health <= 0);

// 2. Run death triggers
dead.forEach(m => {
  s = runOnDeathTriggers(s, playerId, m);
});

// 3. Remove from board
s = withState(s, ns => {
  ns.players[playerId].board = ns.players[playerId].board.filter(m => m.health > 0);
});
```

### Iterating with State Changes
```javascript
// Re-fetch minion each iteration in case it was modified
for (let i = 0; i < triggerCount; i++) {
  const m = next.players[ownerId].board[minionIndex];
  if (!m) break; // Minion died/removed during triggers
  next = handler(next, ctx);
}
```

## Testing/Debugging

- Use `pushLog()` for important game events
- Logs go to console via `console.log('[Game Log] message')`
- Open browser console to see game flow
- Use gallery view (`👁️` button) to see all cards

## Future Features to Support

- Positional effects (cards that care about board position)
- Meta-progression (persistent upgrades across runs)
- Multiple combat encounters per run
- More complex targeting (spells, choose targets)
- Bubble protection keyword
- More trigger types (onHeal, beforeAttack, etc.)
