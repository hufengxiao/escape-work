import test from 'node:test';
import assert from 'node:assert/strict';

import { ReverseBossEngine, BOSS_AREAS } from '../src/engine/reverseBossEngine.js';
import { OvertimeEngine } from '../src/engine/overtimeEngine.js';
import { OVERTIME_ACTIONS } from '../src/data/overtimeEvents.js';
import { ENDINGS } from '../src/data/endings.js';
import { ACHIEVEMENTS } from '../src/data/achievements.js';
import { GameState, migrateSaveData, STORAGE_KEY_V1, STORAGE_KEY_V2 } from '../src/engine/gameState.js';

test('T4.1 Reverse Boss Mode engine: mechanics, skills, and victory condition', (t) => {
  const boss = new ReverseBossEngine();
  const init = boss.getState();

  // 1. Initial State
  assert.equal(init.time, '17:45');
  assert.equal(init.majesty, 100);
  assert.equal(init.currentFloor, 19);
  assert.equal(init.targetCaught, 3);
  assert.equal(init.caughtCount, 0);
  assert.equal(init.employees.length, 5);

  // 2. Deadly @ skill
  const deadlyRes = boss.useSkillDeadlyAt();
  assert.ok(deadlyRes.success);
  assert.equal(boss.majesty, 80, 'Deadly @ must cost 20 majesty');

  // 3. Movement
  const moveRes = boss.moveTo('18楼走廊通道');
  assert.ok(moveRes.success);
  assert.equal(boss.currentArea, '18楼走廊通道');
  assert.equal(boss.currentFloor, 18);
  assert.equal(boss.majesty, 75, 'Move costs 5 majesty');

  // 4. Raid inspection in 18F corridor
  const raidRes = boss.useSkillRaidInspection();
  assert.ok(raidRes.success);
  assert.equal(boss.majesty, 60, 'Raid inspection costs 15 majesty');

  // 5. Lift ambush to 1F lobby
  const ambushRes = boss.useSkillLiftAmbush();
  assert.ok(ambushRes.success);
  assert.equal(boss.currentArea, '1飞大堂中央'.replace('飞', '楼'));
  assert.equal(boss.currentFloor, 1);
  assert.equal(boss.majesty, 30, 'Lift ambush costs 30 majesty');

  // 6. Test victory check by simulating 3 catches
  const testBoss = new ReverseBossEngine();
  testBoss.caughtEmployees = [
    { id: 'e1', name: '员工1' },
    { id: 'e2', name: '员工2' },
    { id: 'e3', name: '员工3' }
  ];
  testBoss.stepTurn(false);
  assert.equal(testBoss.isFinished, true);
  assert.equal(testBoss.result, 'victory');
  assert.equal(testBoss.resultEnding.id, 'ending_reverse_boss_win');
});

test('T4.2 Endless Overtime Mode: survival meters, presence zone, and victory', (t) => {
  const ot = new OvertimeEngine();
  const init = ot.getState();

  // 1. Initial stats
  assert.equal(init.time, '20:00');
  assert.equal(init.turn, 0);
  assert.equal(init.maxTurns, 20);
  assert.equal(init.sanity, 100);
  assert.equal(init.energy, 100);
  assert.equal(init.presence, 40);
  assert.ok(init.isPresenceSafe, 'Presence 40 must be in safe zone [20, 60]');

  // 2. Perform action: drink coffee
  const actRes = ot.performAction('act_drink_coffee');
  assert.ok(actRes.success);
  assert.equal(ot.turn, 1);
  assert.equal(ot.getTimeString(), '20:30');

  // 3. Presence danger handling: force presence to 10
  ot.presence = 10;
  ot.performAction('act_hide_backrow');
  assert.ok(ot.logs.some((l) => l.text.includes('存在感过低')), 'Must log warning when presence < 20');

  // Test high presence danger (>60%)
  ot.presence = 70;
  ot.performAction('act_nod_listen');
  assert.ok(ot.logs.some((l) => l.text.includes('存在感过高')), 'Must log warning when presence > 60');

  // 4. Survival to 06:00 victory
  const winOt = new OvertimeEngine();
  winOt.turn = 19;
  winOt.sanity = 50;
  winOt.energy = 50;
  winOt.presence = 40;
  winOt.performAction('act_drink_coffee');

  assert.equal(winOt.turn, 20);
  assert.equal(winOt.isFinished, true);
  assert.equal(winOt.result, 'victory');
  assert.equal(winOt.resultEnding.id, 'ending_overtime_god');

  // 5. Defeat when sanity drops to 0
  const defeatOt = new OvertimeEngine();
  defeatOt.sanity = 2;
  defeatOt.performAction('act_nod_listen'); // Sanity -12 -> 0
  assert.equal(defeatOt.isFinished, true);
  assert.equal(defeatOt.result, 'defeat');
  assert.equal(defeatOt.resultEnding.id, 'ending_overtime_collapse');
});

test('T4.3 Endings & Achievements expansion counts & conditions', (t) => {
  const endingsCount = Object.keys(ENDINGS).length;
  const achievementsCount = ACHIEVEMENTS.length;

  assert.ok(endingsCount >= 25, `Must have >= 25 endings, actual: ${endingsCount}`);
  assert.ok(achievementsCount >= 24, `Must have >= 24 achievements, actual: ${achievementsCount}`);

  // Test reverse boss win achievement condition
  const achBoss = ACHIEVEMENTS.find((a) => a.id === 'ach_reverse_boss_win');
  assert.ok(achBoss, 'ach_reverse_boss_win must exist');
  assert.equal(achBoss.condition({ unlockedEndings: ['ending_reverse_boss_win'] }), true);
  assert.equal(achBoss.condition({ unlockedEndings: [] }), false);

  // Test overtime god achievement condition
  const achOvertime = ACHIEVEMENTS.find((a) => a.id === 'ach_overtime_god');
  assert.ok(achOvertime, 'ach_overtime_god must exist');
  assert.equal(achOvertime.condition({ unlockedEndings: ['ending_overtime_god'] }), true);
  assert.equal(achOvertime.condition({ unlockedEndings: [] }), false);

  // Test grand master achievement condition
  const achGrand = ACHIEVEMENTS.find((a) => a.id === 'ach_grand_master');
  assert.ok(achGrand, 'ach_grand_master must exist');
  assert.equal(achGrand.condition({ unlockedEndings: new Array(22).fill('e') }), true);
  assert.equal(achGrand.condition({ unlockedEndings: new Array(10).fill('e') }), false);
});

test('T4.4 LocalStorage V1 -> V2 Migration & compatibility', (t) => {
  // Simulate mock localStorage
  const mockStorage = {};
  globalThis.localStorage = {
    getItem: (key) => (key in mockStorage ? mockStorage[key] : null),
    setItem: (key, val) => {
      mockStorage[key] = String(val);
    },
    removeItem: (key) => {
      delete mockStorage[key];
    },
    clear: () => {
      for (const k in mockStorage) delete mockStorage[k];
    }
  };

  // Seed legacy V1 data
  const legacyV1Data = {
    gamesPlayed: 15,
    victories: 7,
    slackerExp: 320,
    unlockedPerks: ['perk_shoes', 'perk_poker_face'],
    unlockedEndings: ['ending_perfect_clockout', 'ending_decoy_master'],
    unlockedAchievements: ['ach_perfect'],
    unlockedRecipes: ['recipe_god_puppet']
  };
  mockStorage[STORAGE_KEY_V1] = JSON.stringify(legacyV1Data);

  // Run migration
  const migrated = migrateSaveData();
  assert.ok(migrated, 'migrateSaveData must return migrated data object');
  assert.equal(migrated.version, 2);
  assert.equal(migrated.meta.totalRuns, 15);
  assert.equal(migrated.meta.escapedRuns, 7);
  assert.equal(migrated.meta.totalExp, 320);
  assert.deepEqual(migrated.meta.unlockedPerks, ['perk_shoes', 'perk_poker_face']);
  assert.deepEqual(migrated.meta.unlockedEndings, ['ending_perfect_clockout', 'ending_decoy_master']);

  // Verify V2 was saved to mockStorage
  assert.ok(mockStorage[STORAGE_KEY_V2]);
  const parsedV2 = JSON.parse(mockStorage[STORAGE_KEY_V2]);
  assert.equal(parsedV2.version, 2);
  assert.equal(parsedV2.meta.totalRuns, 15);

  // Initialize GameState with migrated data
  const state = new GameState();
  assert.equal(state.history.gamesPlayed, 15);
  assert.equal(state.history.victories, 7);
  assert.equal(state.history.slackerExp, 320);
  assert.deepEqual(state.history.unlockedPerks, ['perk_shoes', 'perk_poker_face']);

  // Clean up global mock
  delete globalThis.localStorage;
});
