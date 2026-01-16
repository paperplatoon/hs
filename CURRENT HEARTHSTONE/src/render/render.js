import { Players } from '../state.js';
import { canPlayCard, playCardFromHand, declareAttack, attackTarget, endTurn } from '../engine/actions.js';
import { initFx } from './fx.js';
import { CARDS, CardType, createMinionInstance, createSpellInstance } from '../cards/schema.js';
import { animatedAttack, animatedEnemyTurn, animatedEndTurn } from '../animations/combat.js';

// Module-level mouse tracking (shared across renders)
let mouse = { x: 0, y: 0 };
let mouseHandlerRegistered = false;

// Module-level function to update aim line (called by mouse handler)
function updateAimLine() {
  // Get current state from global (set during render)
  const state = window.__getState?.();
  if (!state) return;

  const sel = state.pending?.selection;
  const path = document.querySelector('#aim-overlay path');
  const arrow = document.querySelector('#aim-overlay polygon');

  if (!path || !arrow) return;

  if (!sel || sel.type !== 'attack') {
    path.setAttribute('d', '');
    arrow.setAttribute('points', '');
    return;
  }

  const battlefield = document.getElementById('battlefield-v2');
  const attacker = document.querySelector(`[data-card-owner="${sel.playerId}"][data-card-index="${sel.attackerIndex}"]`);
  if (!attacker || !battlefield) return;

  const aRect = attacker.getBoundingClientRect();
  const cRect = battlefield.getBoundingClientRect();
  const ax = aRect.left - cRect.left + aRect.width / 2;
  const ay = aRect.top - cRect.top + aRect.height * 0.2;
  const mx = mouse.x, my = mouse.y;
  const cx = (ax + mx) / 2;
  const cy = Math.min(ay, my) - 60;
  const d = `M ${ax},${ay} Q ${cx},${cy} ${mx},${my}`;
  path.setAttribute('d', d);

  // Arrow head
  const angle = Math.atan2(my - cy, mx - cx);
  const size = 10;
  const p1 = `${mx},${my}`;
  const p2 = `${mx - size * Math.cos(angle - Math.PI / 6)},${my - size * Math.sin(angle - Math.PI / 6)}`;
  const p3 = `${mx - size * Math.cos(angle + Math.PI / 6)},${my - size * Math.sin(angle + Math.PI / 6)}`;
  arrow.setAttribute('points', `${p1} ${p2} ${p3}`);
}

export function renderCombatUI(container, state, setState) {
  container.innerHTML = '';

  // Battle view container
  const battleContainer = document.createElement('div');
  battleContainer.id = 'battlefield-v2';
  battleContainer.style.display = 'grid';
  battleContainer.style.gridTemplateRows = 'auto auto auto';
  battleContainer.style.gap = '12px';
  battleContainer.style.position = 'relative';

  const enemyZone = document.createElement('div');
  enemyZone.className = 'zone enemy-zone';
  enemyZone.id = 'enemy-zone';
  const playerZone = document.createElement('div');
  playerZone.className = 'zone player-zone';
  playerZone.id = 'player-zone';
  const handTray = document.createElement('div');
  handTray.className = 'hand-tray';
  handTray.id = 'hand-tray';

  battleContainer.append(enemyZone, playerZone, handTray);

  // Gallery view container
  const galleryContainer = document.createElement('div');
  galleryContainer.id = 'gallery-view';
  galleryContainer.style.display = 'none';

  // View toggle button
  const toggleBtn = document.createElement('button');
  toggleBtn.className = 'view-toggle-btn';
  toggleBtn.textContent = '📋';
  toggleBtn.title = 'Toggle card gallery';
  toggleBtn.addEventListener('click', () => {
    setState((s) => {
      s.viewMode = s.viewMode === 'battle' ? 'gallery' : 'battle';
      return s;
    });
  });

  container.append(battleContainer, galleryContainer, toggleBtn);

  // Aim overlay SVG (for battle view)
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('id', 'aim-overlay');
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
  arrow.setAttribute('class', 'arrow');
  svg.append(path, arrow);
  battleContainer.append(svg);
  const fx = initFx(battleContainer);

  // For summon/death FX: remember previous positions and uids
  let lastPositions = new Map(); // uid -> {x,y}
  let lastUids = new Set();

  // Register mouse handler once (uses module-level mouse variable)
  if (!mouseHandlerRegistered) {
    document.addEventListener('pointermove', (e) => {
      const battlefield = document.getElementById('battlefield-v2');
      if (battlefield) {
        const rect = battlefield.getBoundingClientRect();
        mouse = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        updateAimLine(); // Redraw aim line when mouse moves
      }
    });
    mouseHandlerRegistered = true;
  }

  // Render logic (formerly in rerender function)
  // Toggle view display
  if (state.viewMode === 'gallery') {
    battleContainer.style.display = 'none';
    galleryContainer.style.display = 'block';
    renderGallery(galleryContainer, state);
  } else {
    battleContainer.style.display = 'grid';
    galleryContainer.style.display = 'none';

    snapshotPositions();

    // Always render the battlefield first
    renderEnemyZone(enemyZone, state, setState, animateAttack);
    renderPlayerZone(playerZone, state, setState, animateAttack);
    renderHand(handTray, state, setState);
    drawAimIfNeeded(state);
    diffAndEmitFx();

    // Auto-run opponent turn AFTER rendering (so elements exist)
    if (state.activePlayer === Players.OPPONENT && !state.pending.aiDoneTurn) {
      // Use setTimeout to let the DOM settle before starting animations
      setTimeout(() => animatedEnemyTurn(state, setState), 50);
    }
  }

  // Helpers
  function snapshotPositions() {
    lastPositions.clear();
    lastUids.clear();
    const cRect = battleContainer.getBoundingClientRect();
    document.querySelectorAll('[data-uid]').forEach((el) => {
      const r = el.getBoundingClientRect();
      const x = r.left - cRect.left + r.width / 2;
      const y = r.top - cRect.top + r.height * 0.2;
      lastPositions.set(el.getAttribute('data-uid'), { x, y });
      lastUids.add(el.getAttribute('data-uid'));
    });
  }

  function currentUids() {
    const set = new Set();
    document.querySelectorAll('[data-uid]').forEach((el) => set.add(el.getAttribute('data-uid')));
    return set;
  }

  function diffAndEmitFx() {
    const now = currentUids();
    // Summons: in now but not in last
    document.querySelectorAll('[data-uid]').forEach((el) => {
      const uid = el.getAttribute('data-uid');
      if (!lastUids.has(uid)) {
        const r = el.getBoundingClientRect();
        const c = container.getBoundingClientRect();
        const x = r.left - c.left + r.width / 2;
        const y = r.top - c.top + r.height * 0.2;
        fx.smokePuff(x, y, 10);
        fx.emberBurst(x, y, 8);
      }
    });
    // Deaths: in last but not now
    lastUids.forEach((uid) => {
      if (!now.has(uid)) {
        const pos = lastPositions.get(uid);
        if (pos) fx.smokePuff(pos.x, pos.y, 14);
      }
    });
  }
  function animateAttack(attackerEl, targetEl) {
    return new Promise((resolve) => {
      if (!attackerEl || !targetEl) return resolve();
      attackerEl.classList.add('u-windup');
      setTimeout(() => attackerEl.classList.remove('u-windup'), 140);

      const cRect = battleContainer.getBoundingClientRect();
      const a = attackerEl.getBoundingClientRect();
      const t = targetEl.getBoundingClientRect();
      const sx = a.left - cRect.left + a.width / 2;
      const sy = a.top - cRect.top + a.height * 0.2;
      const ex = t.left - cRect.left + t.width / 2;
      const ey = t.top - cRect.top + t.height * 0.2;

      const ghost = attackerEl.cloneNode(true);
      ghost.style.position = 'absolute';
      ghost.style.left = '0px';
      ghost.style.top = '0px';
      ghost.style.pointerEvents = 'none';
      ghost.style.willChange = 'transform, opacity';
      ghost.style.opacity = '0.95';
      battleContainer.appendChild(ghost);

      const angle = Math.atan2(ey - sy, ex - sx);
      const dx = ex - sx; const dy = ey - sy;
      const dur = 220;
      const anim = ghost.animate([
        { transform: `translate(${sx}px, ${sy}px) rotate(${angle - 0.2}rad) scale(1)` },
        { transform: `translate(${sx + dx * 0.6}px, ${sy + dy * 0.6}px) rotate(${angle}rad) scale(1.02)` },
        { transform: `translate(${ex}px, ${ey}px) rotate(${angle}rad) scale(1.02)` }
      ], { duration: dur, easing: 'cubic-bezier(.2,.7,.2,1)' });

      // Clear aim line immediately
      const aim = document.getElementById('aim-overlay');
      if (aim) {
        aim.querySelector('path')?.setAttribute('d', '');
        aim.querySelector('polygon')?.setAttribute('points', '');
      }

      anim.onfinish = () => {
        ghost.remove();
        fx.impactFlash(targetEl);
        fx.emberBurst(ex, ey, 16);
        targetEl.classList.add('u-shake');
        setTimeout(() => targetEl.classList.remove('u-shake'), 180);
        resolve();
      };
    });
  }
  function drawAimIfNeeded(state) {
    const sel = state.pending.selection;
    if (!sel || sel.type !== 'attack') {
      path.setAttribute('d', '');
      arrow.setAttribute('points', '');
      markTargets(null, state);
      return;
    }
    const attacker = document.querySelector(`[data-card-owner="${sel.playerId}"][data-card-index="${sel.attackerIndex}"]`);
    if (!attacker) return;
    const aRect = attacker.getBoundingClientRect();
    const cRect = battleContainer.getBoundingClientRect();
    const ax = aRect.left - cRect.left + aRect.width / 2;
    const ay = aRect.top - cRect.top + aRect.height * 0.2;
    const mx = mouse.x, my = mouse.y;
    const cx = (ax + mx) / 2; // control point x
    const cy = Math.min(ay, my) - 60; // lift for arc
    const d = `M ${ax},${ay} Q ${cx},${cy} ${mx},${my}`;
    path.setAttribute('d', d);
    // arrow head near mouse
    const angle = Math.atan2(my - cy, mx - cx);
    const size = 10;
    const p1 = `${mx},${my}`;
    const p2 = `${mx - size * Math.cos(angle - Math.PI / 6)},${my - size * Math.sin(angle - Math.PI / 6)}`;
    const p3 = `${mx - size * Math.cos(angle + Math.PI / 6)},${my - size * Math.sin(angle + Math.PI / 6)}`;
    arrow.setAttribute('points', `${p1} ${p2} ${p3}`);

    // Highlight valid targets
    markTargets(sel, state);
  }

  function markTargets(sel, state) {
    const targetables = document.querySelectorAll('[data-card-owner="player"],[data-card-owner="opponent"]');
    targetables.forEach((n) => { n.classList.remove('u-aim-target', 'u-aim-invalid'); });
    if (!sel) return;
    const enemy = sel.playerId === 'player' ? 'opponent' : 'player';
    const hasTaunt = state.players[enemy].board.some((m) => m.keywords?.taunt);
    const enemyCards = document.querySelectorAll(`[data-card-owner="${enemy}"][data-zone="board"]`);
    enemyCards.forEach((n) => {
      const isTaunt = n.getAttribute('data-has-taunt') === 'true';
      const valid = hasTaunt ? isTaunt : true;
      if (valid) n.classList.add('u-aim-target');
      else n.classList.add('u-aim-invalid');
    });
    // Enemy hero target when no taunt
    const heroAvatar = document.querySelector('.hero-avatar.enemy');
    if (heroAvatar) {
      heroAvatar.classList.remove('u-aim-target', 'u-aim-invalid');
      if (!hasTaunt) heroAvatar.classList.add('u-aim-target');
      else heroAvatar.classList.add('u-aim-invalid');
    }
  }
}

function renderEnemyZone(el, state, setState, animateAttack) {
  el.innerHTML = '';

  const avatar = renderHeroAvatar(state, Players.OPPONENT, setState, animateAttack);
  const creatureLane = renderCreatureLane(state, Players.OPPONENT, setState, animateAttack);
  const handCounter = renderHandCounter(state, Players.OPPONENT);

  el.append(avatar, creatureLane, handCounter);
}

function renderPlayerZone(el, state, setState, animateAttack) {
  el.innerHTML = '';

  const avatar = renderHeroAvatar(state, Players.PLAYER, setState, animateAttack);
  const creatureLane = renderCreatureLane(state, Players.PLAYER, setState, animateAttack);

  // End turn button
  const endTurnContainer = document.createElement('div');
  endTurnContainer.className = 'end-turn-zone';
  const endBtn = document.createElement('button');
  endBtn.className = 'btn btn--end btn-ring';
  endBtn.textContent = 'End Turn';
  endBtn.addEventListener('click', () => {
    endBtn.classList.add('u-sweep');
    setTimeout(() => endBtn.classList.remove('u-sweep'), 620);
    // Use animated end turn for visual feedback on triggers
    animatedEndTurn(state, setState);
  });
  endTurnContainer.append(endBtn);

  el.append(avatar, creatureLane, endTurnContainer);
}

function renderGallery(container, state) {
  container.innerHTML = '';

  const header = document.createElement('h1');
  header.textContent = 'Card Gallery';
  header.style.textAlign = 'center';
  header.style.margin = '20px 0';
  header.style.color = '#e6e6e6';
  container.append(header);

  // Minions section
  const minionSection = document.createElement('div');
  minionSection.className = 'gallery-section';

  const minionHeader = document.createElement('h2');
  minionHeader.textContent = 'Minions';
  minionHeader.style.color = '#e6e6e6';
  minionHeader.style.marginBottom = '12px';
  minionSection.append(minionHeader);

  const minionGrid = document.createElement('div');
  minionGrid.className = 'card-gallery-grid';

  const minions = Object.values(CARDS).filter(card => card.type === CardType.MINION);
  minions.forEach(cardDef => {
    const cardInstance = createMinionInstance(cardDef);
    const cardEl = renderMinionCard(cardInstance, state, null, null, null);
    minionGrid.append(cardEl);
  });

  minionSection.append(minionGrid);
  container.append(minionSection);

  // Spells section
  const spellSection = document.createElement('div');
  spellSection.className = 'gallery-section';

  const spellHeader = document.createElement('h2');
  spellHeader.textContent = 'Spells';
  spellHeader.style.color = '#e6e6e6';
  spellHeader.style.marginBottom = '12px';
  spellSection.append(spellHeader);

  const spellGrid = document.createElement('div');
  spellGrid.className = 'card-gallery-grid';

  const spells = Object.values(CARDS).filter(card => card.type === CardType.SPELL);
  spells.forEach(cardDef => {
    const cardInstance = createSpellInstance(cardDef);
    const cardEl = renderHandCard(cardInstance, state, null, null, null);
    spellGrid.append(cardEl);
  });

  spellSection.append(spellGrid);
  container.append(spellSection);
}

function renderHandCounter(state, playerId) {
  const player = state.players[playerId];
  const counter = document.createElement('div');
  counter.className = 'hand-counter';

  const icon = document.createElement('div');
  icon.className = 'hand-counter-icon';
  icon.textContent = '\u{1F0A0}'; // Playing card unicode

  const count = document.createElement('div');
  count.className = 'hand-counter-count';
  count.textContent = player.hand.length;

  counter.append(icon, count);
  return counter;
}

function renderHeroAvatar(state, playerId, setState, animateAttack) {
  const player = state.players[playerId];
  const isEnemy = playerId === Players.OPPONENT;

  const avatar = document.createElement('div');
  avatar.className = `hero-avatar ${isEnemy ? 'enemy' : 'player'}`;

  // Health badge
  const health = document.createElement('div');
  health.className = 'badge heart';
  health.textContent = player.life;

  // Mana badge
  const mana = document.createElement('div');
  mana.className = 'badge mana';
  mana.textContent = player.mana.current;

  // Hero portrait area
  const portrait = document.createElement('div');
  portrait.className = 'hero-portrait';
  portrait.textContent = isEnemy ? 'Enemy' : 'You';

  // Hero power button (placeholder for now)
  const heroPower = document.createElement('button');
  heroPower.className = 'btn btn--power';
  heroPower.textContent = 'Hero Power';
  heroPower.disabled = true; // TODO: Enable when hero powers are implemented
  heroPower.style.opacity = '0.5';

  avatar.append(portrait, health, mana, heroPower);

  // Enemy avatar is targetable for attacks
  if (isEnemy) {
    avatar.dataset.cardOwner = playerId;
    avatar.style.cursor = 'pointer';
    avatar.title = 'Click to target enemy hero';
    avatar.addEventListener('click', () => {
      const sel = state.pending.selection;
      if (sel && sel.type === 'attack') {
        const hasTaunt = state.players[playerId].board.some((m) => m.keywords?.taunt);
        if (hasTaunt) return;
        // Clear aim line immediately
        const aim = document.getElementById('aim-overlay');
        if (aim) {
          aim.querySelector('path')?.setAttribute('d', '');
          aim.querySelector('polygon')?.setAttribute('points', '');
        }
        // Use animated attack
        animatedAttack(state, sel.playerId, sel.attackerIndex, { type: 'hero' }, setState);
      }
    });
  }

  return avatar;
}

function renderCreatureLane(state, playerId, setState, animateAttack) {
  const p = state.players[playerId];
  const lane = document.createElement('div');
  lane.className = 'creature-lane';

  p.board.forEach((m, idx) => {
    const wrap = renderMinionCard(m, state, playerId, 'board', idx);
    if (m.uid) wrap.dataset.uid = m.uid;
    wrap.dataset.zone = 'board';
    wrap.dataset.cardOwner = playerId;
    wrap.dataset.cardIndex = String(idx);
    wrap.dataset.hasTaunt = m.keywords?.taunt ? 'true' : 'false';

    if (playerId === Players.PLAYER && m.canAttack && !m.summoningSickness) {
      wrap.classList.add('ready', 'u-breathe');
      wrap.title = 'Click then target to attack';
      wrap.addEventListener('click', () => {
        setState((s) => declareAttack(s, playerId, idx));
      });
    }

    if (playerId === Players.OPPONENT) {
      wrap.style.cursor = 'pointer';
      wrap.title = 'Target for attack';
      wrap.addEventListener('click', () => {
        const sel = state.pending.selection;
        if (sel && sel.type === 'attack') {
          // Clear aim line immediately
          const aim = document.getElementById('aim-overlay');
          if (aim) {
            aim.querySelector('path')?.setAttribute('d', '');
            aim.querySelector('polygon')?.setAttribute('points', '');
          }
          // Use animated attack
          animatedAttack(state, sel.playerId, sel.attackerIndex, { type: 'minion', index: idx }, setState);
        }
      });
    }

    lane.appendChild(wrap);
  });

  return lane;
}

function renderHand(el, state, setState) {
  el.innerHTML = '';
  const p = state.players.player;
  p.hand.forEach((c, i) => {
    const card = renderHandCard(c, state, Players.PLAYER, 'hand', i);
    const playable = canPlayCard(state, Players.PLAYER, i);
    card.style.opacity = playable ? '1' : '0.5';
    card.style.cursor = playable ? 'pointer' : 'default';
    if (playable) {
      card.classList.add('u-glow');
      card.addEventListener('click', () => setState((s) => playCardFromHand(s, Players.PLAYER, i)));
    }
    el.append(card);
  });
}

function describeCard(card, state, owner, zone, index) {
  // If card has text function, call it
  if (typeof card.text === 'function') {
    return card.text(state, owner, zone, index);
  }

  // Otherwise generate from keywords/triggers
  const parts = [];
  const kw = card.keywords || {};
  const tr = card.triggers || {};
  // Spell text
  if (card.effect && card.type === undefined) {
    // Instances don't carry type; detect via effect presence
    if (card.effect.kind === 'damage') {
      parts.push(`Deal ${card.effect.amount} damage`);
      if (kw.spellDamage || hasBoardSpellDamage()) parts.push('(Spell Damage applies)');
    }
  }
  // Minion keywords
  if (kw.taunt) parts.push('Taunt');
  if (kw.lifesteal) parts.push('Lifesteal');
  if (kw.windfury) parts.push('Windfury');
  if (kw.divineShield) parts.push('Divine Shield');
  if (kw.spellDamage) parts.push(`Spell Damage +${kw.spellDamage}`);
  // Triggers
  if (tr.endOfTurn && kw.growing) {
    const g = kw.growing; parts.push(`End of turn: +${g.attack}/+${g.health}`);
  }
  if (tr.endOfTurn?.some?.((t) => t.keyword === 'spawn')) {
    const t = tr.endOfTurn.find((x) => x.keyword === 'spawn');
    const c = t?.params?.count || 1;
    parts.push(`End of turn: Summon ${c} token${c>1?'s':''}`);
  }
  if (tr.onSummon?.some?.((t) => t.keyword === 'warcry') && kw.warcry) {
    const w = kw.warcry; parts.push(`Warcry: Random ally +${w.attack} attack`);
  }
  if (tr.onSummon?.some?.((t) => t.keyword === 'snipe') && kw.snipe) {
    const s = kw.snipe; parts.push(`Snipe: ${s.damage} dmg to weakest enemy`);
  }
  if (tr.onDeath?.some?.((t) => t.keyword === 'spawn')) {
    const t = tr.onDeath.find((x) => x.keyword === 'spawn');
    const c = t?.params?.count || 1;
    parts.push(`Deathrattle: Summon ${c} token${c>1?'s':''}`);
  }
  return parts.join(' • ');
}

function hasBoardSpellDamage() {
  // Helper to hint that spell damage affects spells in hand
  try {
    const state = window.__getState?.();
    if (!state) return false;
    return state.players.player.board.some((m) => m.keywords?.spellDamage);
  } catch (_) { return false; }
}

function renderMinionCard(m, state, owner, zone, index) {
  const wrap = document.createElement('div');
  wrap.className = 'card-wrap';
  const card = document.createElement('div');
  card.className = 'card-minion';
  const portrait = document.createElement('div');
  portrait.className = 'cm-portrait';
  if (m.art) {
    const img = document.createElement('img');
    img.src = m.art; img.alt = m.name; img.style.width = '100%'; img.style.height = '100%'; img.style.objectFit = 'cover'; img.style.opacity = '.95';
    portrait.append(img);
  }
  const name = document.createElement('div');
  name.className = 'cm-name';
  name.textContent = m.name;
  const chips = document.createElement('div');
  chips.className = 'cm-keywords';
  const tag = (txt) => { const c = document.createElement('div'); c.className = 'cm-chip'; c.textContent = txt; return c; };
  const chip = (label, title) => { const el = tag(label); el.title = title; return el; };
  if (m.keywords?.taunt) chips.append(chip('Taunt', 'Enemies must attack this minion first.'));
  if (m.keywords?.lifesteal) chips.append(chip('Lifesteal', 'Heals your hero for damage dealt.'));
  if (m.keywords?.windfury) chips.append(chip('Windfury', 'Can attack twice each turn.'));
  if (m.keywords?.divineShield) chips.append(chip('Shield', 'Prevents the next damage taken.'));
  if (m.keywords?.spellDamage) chips.append(chip(`SD+${m.keywords.spellDamage}`, 'Your spells deal extra damage.'));
  const rules = document.createElement('div');
  rules.className = 'cm-text';
  rules.textContent = describeCard(m, state, owner, zone, index);

  portrait.append(name, chips, rules);
  card.append(portrait);
  wrap.append(card);

  const cost = document.createElement('div');
  cost.className = 'cm-orb cost';
  cost.textContent = m.cost ?? 0;
  const atk = document.createElement('div');
  atk.className = 'cm-orb atk';
  atk.textContent = m.attack;
  const hp = document.createElement('div');
  hp.className = 'cm-orb hp';
  hp.textContent = Math.max(0, m.health);
  wrap.append(cost, atk, hp);
  return wrap;
}

function renderHandCard(c, state, owner, zone, index) {
  const wrap = document.createElement('div');
  wrap.className = 'card-wrap';
  const card = document.createElement('div');
  card.className = 'card-minion';
  const name = document.createElement('div');
  name.className = 'cm-name';
  name.textContent = `${c.name}`;
  const portrait = document.createElement('div');
  portrait.className = 'cm-portrait';
  if (c.art) {
    const img = document.createElement('img');
    img.src = c.art; img.alt = c.name; img.style.width = '100%'; img.style.height = '100%'; img.style.objectFit = 'cover'; img.style.opacity = '.9';
    portrait.append(img);
  }
  portrait.append(name);
  // Add rules text
  const rules = document.createElement('div'); rules.className = 'cm-text'; rules.textContent = describeCard(c, state, owner, zone, index);
  portrait.append(rules);
  card.append(portrait);
  wrap.append(card);

  // Cost orb
  const costVal = c.cost ?? c.stats?.cost ?? 0;
  const cost = document.createElement('div');
  cost.className = 'cm-orb cost';
  cost.textContent = costVal;
  wrap.append(cost);

  // Always try to show A/H if available (minions)
  const aVal = (c.stats && c.stats.attack != null) ? c.stats.attack : (c.attack != null ? c.attack : null);
  const hVal = (c.stats && c.stats.health != null) ? c.stats.health : (c.health != null ? c.health : null);
  if (aVal != null) { const atk = document.createElement('div'); atk.className = 'cm-orb atk'; atk.textContent = aVal; wrap.append(atk); }
  if (hVal != null) { const hp = document.createElement('div'); hp.className = 'cm-orb hp'; hp.textContent = hVal; wrap.append(hp); }

  return wrap;
}
