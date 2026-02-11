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
│   ├── render.js         # UI rendering (NO internal state)
│   └── fx.js             # Canvas particle effects
├── animations/
│   ├── index.js          # Central exports
│   ├── queue.js          # Animation queue with sequential processing
│   ├── primitives.js     # CSS animation helpers (shake, pulse, glow, etc.)
│   ├── geometry.js       # DOM geometry (find elements, calculate positions)
│   ├── player.js         # Interprets animation descriptors
│   └── combat.js         # High-level animated combat wrappers
└── ui.css                # All styles (CSS custom properties for theming)
```

## Animation System

The animation system provides visual feedback for game actions. Key principles:

1. **Animations are cosmetic** - State changes happen independently; animations don't affect game logic
2. **Ghost elements** - Clone elements for animations to survive DOM re-renders
3. **Position capture** - Capture positions BEFORE state changes, animate using captured positions
4. **Sequential processing** - Animations queue and play one at a time for clarity

### Using Animated Actions

```javascript
import { animatedAttack, animatedPlayCard, animatedEndTurn } from './animations/combat.js';

// Instead of direct state updates, use animated wrappers:
await animatedAttack(state, playerId, attackerIndex, target, setState);
await animatedPlayCard(state, playerId, handIndex, setState);
await animatedEndTurn(state, setState);
```

### Available Animations

| Function | Effect |
|----------|--------|
| `animatedAttack` | Lunge toward target, impact shake, death animations |
| `animatedPlayCard` | Summon animation + battlecry effects |
| `animatedEndTurn` | End-of-turn triggers with grow animations |
| `animatedEnemyTurn` | Full enemy turn with sequential animations |
| `animateWarcry` | Buff projectile to ally |
| `animateSnipe` | Damage projectile to enemy |
| `animateBolster` | Expanding ring buff wave |
| `animateDeluge` | Shockwave damaging all enemies |
| `animateSpellCast` | Projectile from hero to target |
| `animateShieldBreak` | Golden flash for divine shield |
| `animateLifesteal` | Green heal projectile to hero |

### CSS Animation Classes

- `u-shake` - Rapid wiggle (damage)
- `u-pulse-once` - Single scale pulse
- `u-grow` - Scale up briefly (stat gain)
- `u-bounce` - Quick up-down
- `u-flash` - White overlay flash (impact)

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

### Rendering Philosophy: Always Re-render on State Change

**Core Rule**: Every state change triggers a complete DOM rebuild of the current screen.

**Why:**
- Impossible to have state/UI desync bugs
- No lifecycle management complexity (`mounted`, `initialized` flags)
- No stale closures or cached references
- Dead simple to debug: state wrong? Fix state. Screen wrong? Fix render function.
- Declarative: screen is a pure function of state

**Pattern:**
```javascript
// GOOD: Pure render function, called every time
function renderCombatScreen(state, setState, container) {
  // Rebuild entire screen from scratch
  const battlefield = createBattlefield(state, setState);
  const hand = createHand(state, setState);
  container.append(battlefield, hand);
}

// BAD: Caching UI elements, conditional mounting
let cachedUI = null;
function renderCombatScreen(state, setState, container) {
  if (!cachedUI) {
    cachedUI = mount(container, setState);
  }
  cachedUI.update(state); // ❌ Updates orphaned elements
}
```

**Performance Consideration:**
- Turn-based games render ~10-30 times per combat
- Modern browsers handle 50-100 DOM elements trivially
- Premature optimization here causes more bugs than it prevents
- **Simplicity > Performance** for this game scale

**Exceptions:**
- Animations that are in-flight promises (attack animations) complete before `setState()` is called, so DOM recreation doesn't interrupt them
- Canvas-based effects (particles) are stateless and recreated each frame

**Current Status:**
- Deck builder: ✅ Follows pure render pattern
- Shop screen: ✅ Follows pure render pattern
- Combat screen: ✅ Converted to pure render (Chunk 1 complete)
- Remove card screen: ✅ Follows pure render pattern

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

## TODO: Finish Rewriting Render Functions

The combat screen has been converted to pure rendering (Chunk 1 complete). Remaining work:

### Chunk 2: Clean Up Game Initialization (Priority: Important)

**Goal**: Separate "initialize game state" from "render screen"

**Changes Needed:**
1. **In `src/screens.js`:**
   - Deck builder's `onStartRun` callback should fully initialize combat state
   - Remove initialization logic from `renderCombatScreen` entirely
   - `renderCombatScreen` should ONLY render, never initialize state

2. **In `src/state.js` (if needed):**
   - Consider adding `initializeCombat(state)` helper that wraps `startGame()`
   - Makes it clear when combat is being set up vs rendered

**Why This Matters:**
- Separates state transitions from rendering (clean architecture)
- Makes it clear where game logic lives (state layer, not render layer)
- Prevents accidental double-initialization

**Current Workaround:**
- `renderCombatScreen` checks if deck/hand are empty to detect uninitialized state
- This works but mixes concerns (render function shouldn't decide when to initialize)

### Chunk 3: Verify Shop/Remove Screens (Priority: Low)

**Goal**: Ensure other screens follow the same pure pattern

**Changes Needed:**
1. Review `renderShopScreen` and `renderRemoveCardScreen`
2. Ensure they don't cache elements
3. Ensure they rebuild DOM each call
4. Document any intentional deviations

**Why This Matters:**
- Consistency across codebase
- Prevents future bugs from creeping in
- Sets pattern for new screens (treasure rooms, quest selection, etc.)

## Hero Powers

Hero powers are once-per-turn abilities tied to characters. Cost is typically 2 mana.

**State fields:**
- `state.players[playerId].character` - Character ID (e.g., `'char:paladin'`)
- `state.players[playerId].heroPower` - Hero power ID (e.g., `'power:small-shield'`)
- `state.players[playerId].heroPowerUsed` - Boolean, reset each turn in `beginTurn()`

**Key functions:**
- `canUseHeroPower(state, playerId)` - Check mana and not-used
- `useHeroPower(state, playerId)` - Execute the power effect
- `animatedHeroPower(state, setState)` - Player hero power with animation

**Hero power effect types:**
- `healHero` - Restore health to hero
- `summon` - Summon a token minion
- `damageEnemyHero` - Direct damage to enemy hero
- `damageRandomEnemy` - Damage random enemy minion
- `buffRandomAlly` - Buff a random friendly minion
- `draw` - Draw cards

**Files:**
- `src/characters/schema.js` - `HERO_POWERS` and player `CHARACTERS`
- `src/enemies/schema.js` - Enemy definitions (to be created)

## Enemy System (TODO: Implement)

Enemies are defined in `src/enemies/schema.js` with a flat, flexible structure:

```javascript
export const ENEMIES = {
  'enemy:goblin-horde': {
    id: 'enemy:goblin-horde',
    name: 'Goblin Horde',
    description: 'A swarm of goblins.',
    heroPower: 'power:summon-wisp',
    tier: 1,              // Numerical for easy filtering (tier >= 2)
    startingLife: 20,     // Can vary per enemy
    goldReward: 50,       // Can vary per enemy
    art: 'img/goblin.png', // Optional portrait
    deck: [
      // Flat array - no basic/cool split
      // Duplicates listed explicitly
      'minion:goblin-grunt', 'minion:goblin-grunt',
      'minion:goblin-archer', 'minion:goblin-archer',
      // ... any number of cards
    ],
  },
};
```

**Design principles:**
- **Flat deck array** - No `basicCreatures` vs `coolCreatures`. Just list card IDs.
- **No hardcoded lengths** - Deck length comes from the array, not a constant.
- **Numerical tiers** - Easier to filter (`enemies.filter(e => e.tier >= 2)`)
- **All fields explicit** - Easy to copy-paste and modify for new enemies.

## Content Creation Guidelines

When creating new cards or enemies, follow these patterns:

**Creating a new creature:**
1. Add to `CARDS` in `src/cards/schema.js`
2. Use existing keywords/triggers where possible
3. Follow the ID pattern: `'minion:descriptive-name'`
4. Text must be a function: `text: (state, owner, zone, index) => 'Card text'`

**Creating a new enemy:**
1. Add to `ENEMIES` in `src/enemies/schema.js`
2. Reference existing card IDs in the deck array
3. List duplicates explicitly (e.g., `'minion:x', 'minion:x'` for 2 copies)
4. Set tier for encounter selection

**Creating a new hero power:**
1. Add to `HERO_POWERS` in `src/characters/schema.js`
2. Use existing effect types where possible
3. If summoning, create token minion in `cards/schema.js` first

## UI Patterns

**Custom tooltips over native `title`:**
Native browser tooltips are unreliable. Use CSS tooltips instead:
```javascript
button.innerHTML = `
  <span class="name">Name</span>
  <span class="tooltip">Description here</span>
`;
```
```css
.tooltip { position: absolute; opacity: 0; /* ... */ }
.button:hover .tooltip { opacity: 1; }
```
