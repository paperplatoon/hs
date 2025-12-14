Project Vision and Coding Conventions

This project is a fast, state-driven, Hearthstone-inspired roguelike deckbuilder. The goals are:
- Hearthstone feel: familiar rules, board flow, and readability.
- Variety and replayability: many unique cards, enemies, keywords, and strategies so every run feels different.
- Snappy, satisfying feedback: responsive interactions and crisp animations that enhance flow without blocking logic.
- Small, readable functions and centralized rules/trigger routing to support complex modifiers (e.g., “end of turn effects trigger twice”).


Codebase Layout
- `src/` is the canonical, modern code path. Prefer extending here.
  - `src/state.js` – root state shape, helpers (`withState`, `clone`, `pushLog`, enums).
  - `src/engine/actions.js` – pure game rules: starting/ending turns, playing cards, attacks, damage, healing.
  - `src/cards/schema.js` – declarative card registry (`CARDS`) and instance factories.
  - `src/triggers/registry.js` – centralized trigger dispatchers and keyword handlers.
  - `src/render/render.js`, `src/render/fx.js`, `src/ui.css` – DOM rendering, aim overlay, particle FX, and visual styles.
  - `src/ai/simple.js` – very simple opponent AI turn executor.
- Legacy reference files at repo root (`hs.js`, `*demons.js`, `opponentmonsters1.js`, etc.) contain older mechanics (e.g., quests, hero powers, encounter choices). Treat these as reference when porting roguelike features into `src/`.
- Entrypoint HTML: `index-v2.html` runs the modern `src/` implementation (module script + `src/ui.css`).


Core Principles
- State-based everything: logic, rendering, and animations derive from immutable state transitions.
- Pure functions: reducers take a state and return a new state; no hidden side effects.
- Central routing for effects/triggers: all lifecycle hooks (start/end turn, summon, death, attack, damage) flow through a single dispatcher, not ad‑hoc code paths.
- Small, readable functions: favor short, composable helpers with clear inputs/outputs.
- Content is declarative: cards define stats, keywords, and triggers; engine + trigger registry interpret them.
- Snappy UX: animations provide feedback but do not gatekeep logic; the UI sequences them around pure state updates.
- Replayability-first: bias toward systems that scale to lots of cards, keywords, enemies, and run-level variety.


State Model (src/state.js)
- Root state
  - `turn:number`, `activePlayer:'player'|'opponent'`, `phase:'start'|'main'|'combat'|'end'`.
  - `players:{ player, opponent }` where each player has:
    - `life:number`, `mana:{ current,max }`, `deck:CardInstance[]`, `hand:CardInstance[]`, `board:MinionInstance[]`, `graveyard:[]`, `heroPower|null`.
    - `effects.multipliers`: central place for global modifiers (e.g., `growing: 1`), intended to support rules like “triggers happen twice”.
  - `pending`: ephemeral UI/flow state, e.g. `{ selection:{ type:'attack', attackerIndex, playerId }|null, aiDoneTurn:boolean }`.
  - `log`: human-readable events via `pushLog`.
- Helpers
  - `withState(state, mutator)` clones then mutates safely; always return the new state from reducers.
  - `uid()` is used to tag minions for animation diffing.


Engine and Rules (src/engine/actions.js)
- Turn flow: `startGame` → `beginTurn(active)` → `endTurn()` → next player.
- Phases are tracked but logic stays simple; prefer extending through triggers and engine helpers, not bespoke flows.
- Play
  - `canPlayCard`, `playCardFromHand` handle mana and delegate to `summonMinion` or `resolveSpell`.
  - Board size enforcement lives in triggers/engine (`>= 7` slots typical).
- Combat
  - `declareAttack` sets `pending.selection`; target resolution happens via `attackTarget` with UI-provided target.
  - Taunt enforcement: if any enemy taunts, only taunts are legal targets.
  - Resolution handles lifesteal, divine shield, windfury (via `remainingAttacks`), damage exchange, and logs.
- Damage/Healing helpers: `dealDamageToHero`, `healHero` centralize hero life changes.
- Always route lifecycle hooks through trigger runners (see below) and use `pushLog` for player feedback.


Triggers and Keywords (src/triggers/registry.js)
- Dispatchers: `runStartOfTurnTriggers`, `runEndOfTurnTriggers`, `runOnSummonTriggers`, `runOnDeathTriggers`, `runOnAttackTriggers`, `runOnDamageTriggers`.
- Keyword handlers (in `KeywordHandlers`) are small, focused reducers. Inputs: `(state, ctx)`; Output: new state.
- Example keywords implemented:
  - `growing`: at owner’s end step, gain +attack/+health (respects `effects.multipliers.growing`).
  - `gain`: immediate stat adjustments (+attack/+health), safely updating both `health` and `maxHealth` when needed.
  - `spawn`: create token minions (checks board limit and logs when full).
- Declarative triggers
  - Card defs specify `triggers` like `{ endOfTurn: [{ keyword:'growing', ownerOnly:true }] }`.
  - Prefer `ownerOnly:true` when appropriate so the trigger routes only on the correct turn.
- Adding new keywords: implement a handler in `KeywordHandlers` and reference it in card `triggers`. Keep handlers pure and small.


Cards and Instances (src/cards/schema.js)
- Registry: `CARDS` indexed by id. Naming convention: `minion:<slug>` and `spell:<slug>`.
- Minion card def fields: `{ id, name, type:'minion', stats:{ attack, health, cost }, keywords, triggers, art }`.
- Spell card def fields: `{ id, name, type:'spell', stats:{ cost }, effect:{ kind, ... }, art? }`.
- Instances constructed via `createCardInstance` → `createMinionInstance`/`createSpellInstance`.
  - Minion instances add runtime fields: `uid`, `owner`, `canAttack`, `summoningSickness`, `remainingAttacks`, `maxHealth`.
- Rules text is derived in the renderer (`describeCard`) from keywords/triggers so keep definitions declarative.


Rendering and Animations (src/render/*.js, src/ui.css)
- No framework; UI is DOM-driven and idempotent: `mount(root,getState,setState)` returns `{ rerender }`.
- Selection and aiming
  - Clicking a ready minion sets `pending.selection` to `{ type:'attack', attackerIndex, playerId }`.
  - An SVG overlay draws a curved aim line and arrow to current mouse; valid targets are highlighted. Taunt affects hero targeting.
- Animations
  - Attack animations use a cloned “ghost” node with Web Animations API, then call into pure reducers to resolve combat.
  - Particle FX live in a single canvas (`fx.js`) layered above the board; `diffAndEmitFx()` compares `data-uid`s between renders to emit summon/death effects.
  - Keep animations stateless; they should never mutate game state. Sequence UI feedback around state changes with small promises.
- Attributes used for mapping: `[data-uid]`, `[data-card-owner]`, `[data-card-index]`, `[data-zone]`, and `[data-has-taunt]`.
- Styles are in `src/ui.css` using CSS variables and utility classes for “snappy” feedback (`u-flash`, `u-breathe`, `u-windup`, etc.).


AI (src/ai/simple.js)
- Runs automatically when `activePlayer === 'opponent'` and `pending.aiDoneTurn` is false.
- Simple policy: play affordable cards (minions first), then attack legal targets (prefer lowest HP taunts/targets), then `endTurn`.
- Remains pure; use engine helpers and never touch the DOM.


Roguelike Systems
- Vision: every run feels different via quests, hero powers, encounter choices, rewards, and varied enemy decks/behaviors.
- Legacy (`hs.js`, `quests.js`, `heropowers.js`, etc.) show intended features and flows. When porting into `src/`:
  - Keep all run structure in state (e.g., a top-level `mode/status` or an extended `phase` for metagame screens).
  - Use small reducers and central dispatch rather than embedding logic in renderers.
  - Express quest/hero-power effects as keywords/triggers where possible; otherwise add focused engine helpers.


Style and Tooling Conventions
- Prettier: see `prettierrc.json` (`printWidth: 400`). Don’t reformat across the codebase; follow local style.
- Naming
  - Constants/enums: `UPPER_CAMEL` object with string values (e.g., `Players`, `Phases`).
  - Functions/fields: `camelCase`.
  - Card ids: `minion:slug`, `spell:slug`.
- Code
  - Prefer pure reducers that return new state via `withState`.
  - Keep functions small; avoid multi-purpose, deeply nested functions.
  - Route all lifecycle events through trigger runners; don’t hardcode per-card effects in the engine.
  - When modifying health via buffs, adjust both `health` and `maxHealth` appropriately.
  - Log impactful events with `pushLog` for quick UX feedback.
- Rendering
  - Do not mutate state from the renderer or FX; renderer reads state and emits DOM/animations.
  - Keep interactions declarative via state (`pending.selection`) and re-render.


Extending the Game: Quick Recipes
- Add a new minion
  1) Define in `src/cards/schema.js` under `CARDS` with stats/keywords/triggers/art.
  2) The engine/UI will render it automatically; add to decks where needed (e.g., `startGame`).
- Add a new spell
  1) Define card with `effect:{ kind:..., ... }`.
  2) Extend `resolveSpell` if a new `kind` is introduced, or better: implement as keyword + trigger where possible.
- Add a new keyword/trigger
  1) Implement a pure handler in `KeywordHandlers`.
  2) Reference it from card `triggers` (`ownerOnly` when needed) and/or add a dispatcher hook if it’s a new lifecycle.
- Add an animation/fx
  1) Key off DOM/state diffs (`data-uid`, `diffAndEmitFx`) or wrap reducer calls with a small UI promise chain.
  2) Never couple FX to engine logic.
- Add global modifiers (e.g., “end of turn triggers happen twice”)
  1) Store them under `players[*].effects.multipliers`.
  2) Read multipliers inside keyword handlers (as `growing` already does) or dispatchers when appropriate.


Run and Debug
- Open `index-v2.html` to run the modern build. The UI mounts into `#app`.
- Quick inspection hooks: `window.__getState()` and `window.__setState(updater)` are exposed for console debugging.


Do / Don’t
- Do
  - Keep reducers pure and small; reuse engine helpers.
  - Prefer declarative content (cards/keywords) over hardcoded casework.
  - Centralize lifecycle logic in trigger runners.
  - Preserve the “snappy” feel: fast rerenders, succinct logs, short animations.
- Don’t
  - Add one-off state mutations in renderers or FX.
  - Implement card-specific logic directly in `engine/actions.js` unless it’s a generic mechanic.
  - Modify legacy root files for new features; port features into `src/` instead.


North Star
- The game should play like Hearthstone but feel like a roguelike: lots of novel combinations, evolving boards, and crisp feedback. Favor systems and patterns that scale content creation (cards/enemies/keywords) and make it easy to slot in new mechanics without touching core loops.

