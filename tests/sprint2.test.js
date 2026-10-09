import test from 'node:test';
import assert from 'node:assert/strict';

import { NPCS } from '../src/data/npcs.js';
import { NPCManager } from '../src/engine/npcManager.js';
import { BUZZWORDS, calculateBuzzwordScore } from '../src/data/buzzwords.js';
import { MiniGameRunner } from '../src/engine/miniGameRunner.js';
import { GameState } from '../src/engine/gameState.js';

test('T2.1 NPC Favorability initialization & role affinity', (t) => {
  const stateDev = new GameState();
  stateDev.reset('backend_dev');
  assert.ok(stateDev.npcRelations.ah_wei, 'Ah Wei relation must be initialized');
  assert.equal(stateDev.npcRelations.ah_wei.favorability, 55, 'Backend dev gets +15 with Ah Wei (40+15=55)');
  assert.equal(stateDev.npcRelations.ah_qiang.favorability, -35, 'Backend dev gets -15 with Ah Qiang (-20-15=-35)');

  const statePM = new GameState();
  statePM.reset('product_manager');
  assert.equal(statePM.npcRelations.ah_qiang.favorability, 15, 'Product mgr gets +35 with Ah Qiang (-20+35=15)');
});

test('T2.1 NPC Favorability tier transitions & perk activation', (t) => {
  const state = new GameState();
  state.reset('backend_dev');

  // Initial status
  assert.equal(state.npcRelations.ah_wei.status, 'friendly');
  assert.equal(state.npcRelations.ah_wei.hasGrantedPerk, false);

  // Boost to >= 80
  NPCManager.adjustFavorability(state, 'ah_wei', 30, 'Test boost');
  assert.equal(state.npcRelations.ah_wei.status, 'ally');
  assert.equal(state.npcRelations.ah_wei.hasGrantedPerk, true);

  // Drop to nemesis (< -60)
  NPCManager.adjustFavorability(state, 'ah_wei', -160, 'Betrayal test');
  assert.equal(state.npcRelations.ah_wei.favorability, -75);
  assert.equal(state.npcRelations.ah_wei.status, 'nemesis');

  // Upper & lower bounds clamp [-100, 100]
  NPCManager.adjustFavorability(state, 'ah_wei', -100);
  assert.equal(state.npcRelations.ah_wei.favorability, -100);
  NPCManager.adjustFavorability(state, 'ah_wei', 500);
  assert.equal(state.npcRelations.ah_wei.favorability, 100);
});

test('T2.1 Gifting favorite items vs standard items', (t) => {
  const state = new GameState();
  state.reset('backend_dev');
  state.inventory = ['bag_snack', 'stomach_pill'];

  // Lao Wang favorite is hua_zi/wind_oil; stomach_pill is not favorite
  const res1 = NPCManager.giftItem(state, 'lao_wang', 'stomach_pill');
  assert.ok(res1.success);
  assert.equal(res1.isFavorite, false);
  assert.equal(res1.delta, 15);
  assert.ok(!state.hasItem('stomach_pill'), 'Gifted item should be removed');

  // Ah Wei favorite is bag_snack
  const res2 = NPCManager.giftItem(state, 'ah_wei', 'bag_snack');
  assert.ok(res2.success);
  assert.equal(res2.isFavorite, true);
  assert.equal(res2.delta, 35);
  assert.ok(!state.hasItem('bag_snack'), 'Gifted item should be removed');
});

test('T2.3 Buzzwords battle score calculation & evaluation', (t) => {
  // Test high-scoring combo
  // bw_dim_strike (35), bw_moat (32), bw_closed_loop (32) = 99 * 1.05 = 104
  const highCombo = ['bw_dim_strike', 'bw_moat', 'bw_closed_loop'];
  const highEval = MiniGameRunner.evaluateBuzzwordBattle(highCombo, 'backend_dev');
  assert.equal(highEval.grade, 'VICTORY');
  assert.ok(highEval.score >= 80);
  assert.equal(highEval.suspicionDelta, -15);

  // Test low-scoring combo
  // bw_agile_sprint (20) = 20 * 1.0 = 20
  const lowCombo = ['bw_agile_sprint'];
  const lowEval = MiniGameRunner.evaluateBuzzwordBattle(lowCombo, 'intern');
  assert.equal(lowEval.grade, 'FAIL');
  assert.ok(lowEval.score < 50);
  assert.equal(lowEval.suspicionDelta, 25);
});

test('T2.4 WeChat Red Packet minefield probabilities & outcomes', (t) => {
  // First bird with roll < 0.7 -> poison trap
  const resPoison = MiniGameRunner.resolveRedPacketChoice('first', 50, 0.5);
  assert.equal(resPoison.type, 'first_poison');
  assert.equal(resPoison.amount, 0.01);
  assert.equal(resPoison.suspicionDelta, 25);

  // First bird with roll >= 0.7 -> jackpot
  const resJackpot = MiniGameRunner.resolveRedPacketChoice('first', 50, 0.85);
  assert.equal(resJackpot.type, 'first_jackpot');
  assert.equal(resJackpot.amount, 88.0);
  assert.equal(resJackpot.energyDelta, 20);

  // Last bird safe
  const resLastSafe = MiniGameRunner.resolveRedPacketChoice('last', 50, 0.5);
  assert.equal(resLastSafe.type, 'last_safe');
  assert.equal(resLastSafe.amount, 2.5);

  // Skip when Ah Wei relation is negative
  const resSkipTagged = MiniGameRunner.resolveRedPacketChoice('skip', -30, 0.2);
  assert.equal(resSkipTagged.type, 'skip_tagged');
  assert.equal(resSkipTagged.suspicionDelta, 15);
});

test('T2.5 18:00 Clock-Out QTE precision evaluation', (t) => {
  const target = 18 * 3600000; // 18:00:00.000

  // Perfect window (-200ms to +500ms)
  const perfectClick1 = target - 50; // -50ms
  const evalPerf1 = MiniGameRunner.evaluateClockOutQTE(target, perfectClick1);
  assert.equal(evalPerf1.grade, 'PERFECT');
  assert.equal(evalPerf1.triggerVictory, true);

  const perfectClick2 = target + 400; // +400ms
  const evalPerf2 = MiniGameRunner.evaluateClockOutQTE(target, perfectClick2);
  assert.equal(evalPerf2.grade, 'PERFECT');

  // Early click (< -200ms)
  const earlyClick = target - 600; // -600ms
  const evalEarly = MiniGameRunner.evaluateClockOutQTE(target, earlyClick);
  assert.equal(evalEarly.grade, 'EARLY');
  assert.equal(evalEarly.suspicionDelta, 35);

  // Late click (> +500ms)
  const lateClick = target + 1500; // +1500ms
  const evalLate = MiniGameRunner.evaluateClockOutQTE(target, lateClick);
  assert.equal(evalLate.grade, 'LATE');
  assert.equal(evalLate.suspicionDelta, 15);
});
