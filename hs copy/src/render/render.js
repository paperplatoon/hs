import { Players } from '../state.js';
import { canPlayCard, playCardFromHand, declareAttack, attackTarget, endTurn } from '../engine/actions.js';
import { takeOpponentTurn } from '../ai/simple.js';
import { initFx } from './fx.js';

export function mount(root, getState, setState) {
  root.innerHTML = '';
  const container = document.createElement('div');
  container.id = 'battlefield-v2';
  container.style.display = 'grid';
  container.style.gridTemplateRows = 'auto auto auto auto';
  container.style.gap = '12px';
  container.style.position = 'relative';

  const enemyLane = document.createElement('div');
  enemyLane.className = 'zone board-lane';
  enemyLane.id = 'enemy-lane';
  const controlLane = document.createElement('div');
  controlLane.className = 'zone control-lane';
  controlLane.id = 'control-lane';
  const playerLane = document.createElement('div');
  playerLane.className = 'zone board-lane';
  playerLane.id = 'player-lane';
  const handTray = document.createElement('div');
  handTray.className = 'hand-tray';
  handTray.id = 'hand-tray';

  container.append(enemyLane, controlLane, playerLane, handTray);
  root.append(container);

  // Aim overlay SVG
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('id', 'aim-overlay');
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
  arrow.setAttribute('class', 'arrow');
  svg.append(path, arrow);
  container.append(svg);
  const fx = initFx(container);

  let mouse = { x: 0, y: 0 };
  // For summon/death FX: remember previous positions and uids
  let lastPositions = new Map(); // uid -> {x,y}
  let lastUids = new Set();
  const onMove = (e) => {
    const rect = container.getBoundingClientRect();
    mouse = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    drawAimIfNeeded();
  };
  document.addEventListener('pointermove', onMove);

  function rerender() {
    snapshotPositions();
    const state = getState();
    // Auto-run opponent turn if needed
    if (state.activePlayer === Players.OPPONENT && !state.pending.aiDoneTurn) {
      setState((s) => takeOpponentTurn(s));
      return; // next rerender will happen
    }
    renderBoardLane(enemyLane, state, Players.OPPONENT, setState, animateAttack);
    renderControls(controlLane, state, setState, animateAttack);
    renderBoardLane(playerLane, state, Players.PLAYER, setState, animateAttack);
    renderHand(handTray, state, setState);
    drawAimIfNeeded();
    diffAndEmitFx();
  }

  return { rerender };

  // Helpers
  function snapshotPositions() {
    lastPositions.clear();
    lastUids.clear();
    const cRect = container.getBoundingClientRect();
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

      const cRect = container.getBoundingClientRect();
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
      container.appendChild(ghost);

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
  function drawAimIfNeeded() {
    const s = getState();
    const sel = s.pending.selection;
    if (!sel || sel.type !== 'attack') {
      path.setAttribute('d', '');
      arrow.setAttribute('points', '');
      markTargets(null);
      return;
    }
    const attacker = document.querySelector(`[data-card-owner="${sel.playerId}"][data-card-index="${sel.attackerIndex}"]`);
    if (!attacker) return;
    const aRect = attacker.getBoundingClientRect();
    const cRect = container.getBoundingClientRect();
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
    markTargets(sel);
  }

  function markTargets(sel) {
    const targetables = document.querySelectorAll('[data-card-owner="player"],[data-card-owner="opponent"]');
    targetables.forEach((n) => { n.classList.remove('u-aim-target', 'u-aim-invalid'); });
    if (!sel) return;
    const enemy = sel.playerId === 'player' ? 'opponent' : 'player';
    const hasTaunt = getState().players[enemy].board.some((m) => m.keywords?.taunt);
    const enemyCards = document.querySelectorAll(`[data-card-owner="${enemy}"][data-zone="board"]`);
    enemyCards.forEach((n) => {
      const isTaunt = n.getAttribute('data-has-taunt') === 'true';
      const valid = hasTaunt ? isTaunt : true;
      if (valid) n.classList.add('u-aim-target');
      else n.classList.add('u-aim-invalid');
    });
    // Enemy hero plate target when no taunt
    const heroPlate = document.querySelector('.hero-plate.enemy');
    if (heroPlate) {
      heroPlate.classList.remove('u-aim-target', 'u-aim-invalid');
      if (!hasTaunt) heroPlate.classList.add('u-aim-target');
      else heroPlate.classList.add('u-aim-invalid');
    }
  }
}

function renderBoardLane(el, state, playerId, setState, animateAttack) {
  const p = state.players[playerId];
  el.innerHTML = '';
  p.board.forEach((m, idx) => {
    const wrap = renderMinionCard(m);
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
          const attackerEl = document.querySelector(`[data-card-owner="${sel.playerId}"][data-card-index="${sel.attackerIndex}"]`);
          animateAttack(attackerEl, wrap).then(() => {
            setState((s) => attackTarget(s, sel.playerId, sel.attackerIndex, { type: 'minion', index: idx }));
          });
        }
      });
    }
    el.appendChild(wrap);
  });
}

function renderControls(el, state, setState, animateAttack) {
  el.innerHTML = '';
  const enemyPlate = document.createElement('div');
  enemyPlate.className = 'hero-plate enemy';
  enemyPlate.title = 'Click to target enemy hero';
  const eHeart = document.createElement('div'); eHeart.className = 'badge heart'; eHeart.textContent = state.players.opponent.life;
  const eMana = document.createElement('div'); eMana.className = 'badge mana'; eMana.textContent = state.players.opponent.mana.current;
  enemyPlate.append(eHeart, eMana);
  enemyPlate.addEventListener('click', () => {
    const sel = state.pending.selection;
    if (sel && sel.type === 'attack') {
      const hasTaunt = state.players.opponent.board.some((m) => m.keywords?.taunt);
      if (hasTaunt) return;
      const attackerEl = document.querySelector(`[data-card-owner="${sel.playerId}"][data-card-index="${sel.attackerIndex}"]`);
      animateAttack(attackerEl, enemyPlate).then(() => {
        setState((s) => attackTarget(s, sel.playerId, sel.attackerIndex, { type: 'hero' }));
      });
    }
  });

  const center = document.createElement('div');
  center.className = 'u-center';
  const endBtn = document.createElement('button');
  endBtn.className = 'btn btn--end btn-ring';
  endBtn.textContent = 'End Turn';
  endBtn.addEventListener('click', () => {
    // shine sweep feedback
    endBtn.classList.add('u-sweep');
    setTimeout(() => endBtn.classList.remove('u-sweep'), 620);
    setState((s) => endTurn(s));
  });
  center.append(endBtn);

  const playerPlate = document.createElement('div');
  playerPlate.className = 'hero-plate';
  const pHeart = document.createElement('div'); pHeart.className = 'badge heart'; pHeart.textContent = state.players.player.life;
  const pMana = document.createElement('div'); pMana.className = 'badge mana'; pMana.textContent = `${state.players.player.mana.current}`;
  playerPlate.append(pHeart, pMana);

  el.append(enemyPlate, center, playerPlate);

  // Compact log under center
  const log = document.createElement('div');
  log.className = 'log-panel';
  state.log.slice(-6).forEach((e) => {
    const p = document.createElement('div'); p.textContent = e.message; log.append(p);
  });
  center.append(log);
}

function renderHand(el, state, setState) {
  el.innerHTML = '';
  const p = state.players.player;
  p.hand.forEach((c, i) => {
    const card = renderHandCard(c);
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

function renderInfo(el, state, getState, setState) {
  el.innerHTML = '';
  const row = document.createElement('div');
  row.className = 'u-row';
  row.style.justifyContent = 'space-between';

  const left = document.createElement('div');
  left.textContent = `Turn ${state.turn} — ${state.activePlayer}`;
  const right = document.createElement('div');
  const btn = document.createElement('button');
  btn.className = 'btn btn--end btn-ring';
  btn.textContent = 'End Turn';
  btn.addEventListener('click', () => setState((s) => endTurn(s)));
  right.append(btn);

  row.append(left, right);
  el.append(row);

  const log = document.createElement('div');
  log.style.maxHeight = '160px';
  log.style.overflow = 'auto';
  state.log.slice(-10).forEach((e) => {
    const p = document.createElement('div');
    p.textContent = e.message;
    log.append(p);
  });
  el.append(log);
}

function describeCard(card) {
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

function renderMinionCard(m) {
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
  const tags = document.createElement('div');
  tags.className = 'cm-tags';
  if (typeof m.remainingAttacks === 'number') tags.textContent = `atk:${m.remainingAttacks}`;
  const rules = document.createElement('div');
  rules.className = 'cm-text';
  rules.textContent = describeCard(m);

  portrait.append(name, chips, tags, rules);
  card.append(portrait);
  wrap.append(card);

  const atk = document.createElement('div');
  atk.className = 'cm-orb atk';
  atk.textContent = m.attack;
  const hp = document.createElement('div');
  hp.className = 'cm-orb hp';
  hp.textContent = Math.max(0, m.health);
  wrap.append(atk, hp);
  return wrap;
}

function renderHandCard(c) {
  const wrap = document.createElement('div');
  wrap.className = 'card-wrap';
  const card = document.createElement('div');
  card.className = 'card-minion';
  const name = document.createElement('div');
  name.className = 'cm-name';
  name.textContent = `${c.name}`;
  const cost = document.createElement('div');
  cost.className = 'cm-tags';
  const k = c.cost ?? c.stats?.cost ?? 0;
  cost.textContent = `Cost ${k}`;
  const portrait = document.createElement('div');
  portrait.className = 'cm-portrait';
  if (c.art) {
    const img = document.createElement('img');
    img.src = c.art; img.alt = c.name; img.style.width = '100%'; img.style.height = '100%'; img.style.objectFit = 'cover'; img.style.opacity = '.9';
    portrait.append(img);
  }
  portrait.append(name, cost);
  card.append(portrait);
  wrap.append(card);
  // Always try to show A/H if available (minions)
  const aVal = (c.stats && c.stats.attack != null) ? c.stats.attack : (c.attack != null ? c.attack : null);
  const hVal = (c.stats && c.stats.health != null) ? c.stats.health : (c.health != null ? c.health : null);
  if (aVal != null) { const atk = document.createElement('div'); atk.className = 'cm-orb atk'; atk.textContent = aVal; wrap.append(atk); }
  if (hVal != null) { const hp = document.createElement('div'); hp.className = 'cm-orb hp'; hp.textContent = hVal; wrap.append(hp); }
  // Add rules text
  const rules = document.createElement('div'); rules.className = 'cm-text'; rules.textContent = describeCard(c);
  portrait.append(rules);
  return wrap;
}
