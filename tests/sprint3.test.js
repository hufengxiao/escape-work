import test from 'node:test';
import assert from 'node:assert/strict';

import { PatrolManager } from '../src/engine/patrolManager.js';
import { DailySystem } from '../src/data/daily.js';
import { applyChaosModifiers, CHAOS_COMBOS } from '../src/data/modifiers.js';
import { GameState } from '../src/engine/gameState.js';
import { GameEngine } from '../src/engine/gameEngine.js';

test('T3.1 Boss patrol movement & threat levels', (t) => {
  const state = new GameState();
  state.reset('backend_dev');

  // Turn 0: Boss on 19F
  assert.equal(state.patrolState.currentFloor, 19);
  assert.equal(state.patrolState.threatLevel, 'safe');

  // Move turns to 4: Boss enters 18F corridor
  state.turns = 4;
  state.zone = 2; // Player is also in corridor
  PatrolManager.stepPatrol(state);
  assert.equal(state.patrolState.currentFloor, 18);
  assert.equal(state.patrolState.threatLevel, 'danger', 'Boss in corridor and player in Zone 2 must trigger danger');

  // Player in Zone 1 (desk), Boss in 18F corridor
  state.zone = 1;
  PatrolManager.stepPatrol(state);
  assert.equal(state.patrolState.threatLevel, 'warning', 'Boss on same floor but not adjacent should be warning');
});

test('T3.3 Decoy maneuvers and distraction state', (t) => {
  const state = new GameState();
  state.reset('backend_dev');
  state.suspicion = 60;

  // Trigger fake alarm
  const decoyRes = PatrolManager.triggerDecoy(state, 'fake_alarm');
  assert.ok(decoyRes.success);
  assert.equal(state.patrolState.distractedTurns, 3);
  assert.equal(state.patrolState.threatLevel, 'safe');
  assert.equal(state.patrolState.currentFloor, 15);
  assert.equal(state.suspicion, 40, 'Suspicion should drop by 20%');

  // Step 1 turn while distracted
  PatrolManager.stepPatrol(state);
  assert.equal(state.patrolState.distractedTurns, 2);
  assert.equal(state.patrolState.threatLevel, 'safe');
});

test('T3.4 Daily Almanac seeded determinism & scoring', (t) => {
  const dateStr = '2026-10-09';
  const almanac1 = DailySystem.generateDailyAlmanac(dateStr);
  const almanac2 = DailySystem.generateDailyAlmanac(dateStr);

  assert.deepEqual(almanac1, almanac2, 'Same date must generate identical almanac');
  assert.ok(almanac1.good, 'Must have good auspicious entry');
  assert.ok(almanac1.bad, 'Must have bad inauspicious entry');

  // Score calculation
  const state = new GameState();
  state.reset('backend_dev');
  state.currentEnding = { type: 'victory' };
  state.energy = 80;
  state.suspicion = 20;
  state.turns = 5;
  state.earnedExp = 50;

  const score = DailySystem.calculateDailyScore(state);
  assert.ok(score > 1000, `Victory score should be substantial, got ${score}`);
});

test('T3.5 Chaos Modifiers stacking & synergy combo', (t) => {
  const state = new GameState();
  state.reset('backend_dev');

  const modifierIds = ['mod_boss_rampage', 'mod_network_crash', 'mod_quarterly_sprint'];
  applyChaosModifiers(state, modifierIds);

  assert.deepEqual(state.chaosModifiers, modifierIds);
  assert.ok(state.flags.modBossRampage);
  assert.ok(state.flags.modNetworkDown);
  assert.ok(state.flags.modQuarterlySprint);

  // Verify Doomsday Friday combo triggered
  assert.ok(state.flags.activeChaosCombo);
  assert.equal(state.flags.activeChaosCombo.id, 'combo_doomsday_friday');
});
