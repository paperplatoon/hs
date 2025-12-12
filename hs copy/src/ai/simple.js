import { Players } from '../state.js';
import { canPlayCard, playCardFromHand, declareAttack, attackTarget, endTurn } from '../engine/actions.js';

export function takeOpponentTurn(state) {
  if (state.activePlayer !== Players.OPPONENT) return state;
  if (state.pending.aiDoneTurn) return state;
  let s = state;
  // Play phase: try to play affordable cards (prefer minions)
  let played = true;
  while (played) {
    played = false;
    const p = s.players[Players.OPPONENT];
    const choices = p.hand.map((c, i) => ({ c, i }))
      .filter(({ i }) => canPlayCard(s, Players.OPPONENT, i));
    if (choices.length === 0) break;
    // prefer minions first
    const byType = choices.sort((a, b) => {
      const ta = s => (s.c.cardId.startsWith('minion') ? 0 : 1);
      const va = ta(a) - ta(b);
      if (va !== 0) return va;
      return a.i - b.i;
    });
    const pick = byType[0];
    s = playCardFromHand(s, Players.OPPONENT, pick.i);
    played = true;
  }
  // Attack phase: each ready minion attacks
  const enemyId = Players.PLAYER;
  for (let idx = 0; idx < s.players[Players.OPPONENT].board.length; idx++) {
    let m = s.players[Players.OPPONENT].board[idx];
    while (m && m.canAttack && !m.summoningSickness) {
      // pick target
      const enemyBoard = s.players[enemyId].board;
      const taunts = enemyBoard
        .map((mm, ii) => ({ mm, ii }))
        .filter(({ mm }) => mm.keywords?.taunt);
      if (taunts.length > 0) {
        const t = taunts.sort((a, b) => a.mm.health - b.mm.health)[0];
        s = attackTarget(s, Players.OPPONENT, idx, { type: 'minion', index: t.ii });
      } else if (enemyBoard.length > 0) {
        const t = enemyBoard.map((mm, ii) => ({ mm, ii })).sort((a, b) => a.mm.health - b.mm.health)[0];
        s = attackTarget(s, Players.OPPONENT, idx, { type: 'minion', index: t.ii });
      } else {
        s = attackTarget(s, Players.OPPONENT, idx, { type: 'hero' });
      }
      m = s.players[Players.OPPONENT].board[idx];
      if (!m) break;
    }
  }
  // End turn
  s = endTurn(s);
  // Mark processed to avoid re-entry if renderer fires again rapidly before state changes
  s = { ...s, pending: { ...s.pending, aiDoneTurn: true } };
  return s;
}

