import test from 'node:test';
import assert from 'node:assert/strict';

import { MiniGameRunner } from '../src/engine/miniGameRunner.js';
import { TAICHI_SCENARIOS, getRandomTaiChiScenario } from '../src/data/taichi.js';
import { NPCS } from '../src/data/npcs.js';
import { NPCManager } from '../src/engine/npcManager.js';
import { GameState } from '../src/engine/gameState.js';
import { RECIPES } from '../src/data/recipes.js';
import { CraftManager } from '../src/engine/craftManager.js';
import { ITEMS } from '../src/data/items.js';
import { OVERTIME_EVENTS, OVERTIME_ACTIONS } from '../src/data/overtimeEvents.js';
import { OvertimeEngine } from '../src/engine/overtimeEngine.js';
import { ReverseBossEngine } from '../src/engine/reverseBossEngine.js';
import { ENDINGS } from '../src/data/endings.js';
import { ACHIEVEMENTS } from '../src/data/achievements.js';
import { RANDOM_ENCOUNTERS, ZONE_ACTIONS } from '../src/data/events.js';

test('T6.1 Workplace Tai-Chi deflection engine: scenarios, scoring, and outcomes', (t) => {
  assert.ok(TAICHI_SCENARIOS.length >= 4, 'Must have at least 4 Tai-Chi scenarios');
  const scenario = getRandomTaiChiScenario();
  assert.ok(scenario.id);
  assert.ok(scenario.dialogue);
  assert.equal(scenario.cards.length, 4);

  // Test PERFECT evaluation
  const perfectRes = MiniGameRunner.evaluateTaiChiBattle('urgent_hotfix', 'tech_freeze');
  assert.equal(perfectRes.grade, 'PERFECT');
  assert.equal(perfectRes.suspicionDelta, -20);
  assert.equal(perfectRes.energyDelta, 10);

  // Test PASS evaluation
  const passRes = MiniGameRunner.evaluateTaiChiBattle('urgent_hotfix', 'oa_ticket');
  assert.equal(passRes.grade, 'PASS');
  assert.equal(passRes.suspicionDelta, -5);
  assert.equal(passRes.energyDelta, 0);

  // Test FAIL evaluation
  const failRes = MiniGameRunner.evaluateTaiChiBattle('urgent_hotfix', 'emotional_refuse');
  assert.equal(failRes.grade, 'FAIL');
  assert.equal(failRes.suspicionDelta, 20);
  assert.equal(failRes.energyDelta, -10);
});

test('T6.2 Keyboard Frenzy speed typing simulation: CPS calculation and grade thresholds', (t) => {
  // 1. FIRE grade (>= 25 hits in 5s)
  const fireRes = MiniGameRunner.evaluateKeyboardFrenzy(30, 5);
  assert.equal(fireRes.grade, 'FIRE');
  assert.equal(fireRes.percent, 100);
  assert.equal(fireRes.cps, 6.0);
  assert.equal(fireRes.suspicionDelta, -20);
  assert.equal(fireRes.energyDelta, 10);

  // 2. STEADY grade (15-24 hits)
  const steadyRes = MiniGameRunner.evaluateKeyboardFrenzy(18, 5);
  assert.equal(steadyRes.grade, 'STEADY');
  assert.equal(steadyRes.cps, 3.6);
  assert.equal(steadyRes.suspicionDelta, -10);
  assert.equal(steadyRes.energyDelta, 5);

  // 3. SLACK grade (< 15 hits)
  const slackRes = MiniGameRunner.evaluateKeyboardFrenzy(10, 5);
  assert.equal(slackRes.grade, 'SLACK');
  assert.equal(slackRes.cps, 2.0);
  assert.equal(slackRes.suspicionDelta, 15);
  assert.equal(slackRes.energyDelta, -5);
});

test('T6.3 Intern Chen NPC integration: affinity biases, gifting, and perk activation', (t) => {
  assert.ok(NPCS.intern_chen, 'intern_chen must exist in NPCS');
  assert.equal(NPCS.intern_chen.avatar, '🐣');
  assert.ok(NPCS.intern_chen.favoriteItems.includes('intern_guide'));

  // Test affinity initialization with intern role
  const stateIntern = new GameState();
  stateIntern.reset('fresh_intern');
  assert.ok(stateIntern.npcRelations.intern_chen);
  assert.equal(stateIntern.npcRelations.intern_chen.favorability, 60, 'Intern role gets +35 bonus (25+35=60)');

  // Test affinity initialization with backend_dev role
  const stateDev = new GameState();
  stateDev.reset('backend_dev');
  assert.equal(stateDev.npcRelations.intern_chen.favorability, 35, 'Dev role gets +10 mentor bonus (25+10=35)');

  // Test gifting favorite item
  stateDev.inventory = ['intern_guide'];
  const giftRes = NPCManager.giftItem(stateDev, 'intern_chen', 'intern_guide');
  assert.ok(giftRes.success);
  assert.equal(giftRes.isFavorite, true);
  assert.equal(giftRes.delta, 35);
  assert.equal(stateDev.npcRelations.intern_chen.favorability, 70);

  // Boost to ally perk
  NPCManager.adjustFavorability(stateDev, 'intern_chen', 20);
  assert.equal(stateDev.npcRelations.intern_chen.status, 'ally');
  assert.equal(stateDev.npcRelations.intern_chen.hasGrantedPerk, true);
});

test('T6.4 Expanded crafting recipes & synergy artifacts matching', (t) => {
  assert.ok(RECIPES.length >= 11, `Must have at least 11 recipes, got ${RECIPES.length}`);
  assert.ok(ITEMS.ghost_matrix);
  assert.ok(ITEMS.intern_alliance);
  assert.ok(ITEMS.hyper_stamina_brew);

  // Unordered matching for ghost_matrix
  const matchGhost1 = CraftManager.matchRecipe(['chair_jacket', 'ghost_keyboard']);
  assert.ok(matchGhost1);
  assert.equal(matchGhost1.resultItemId, 'ghost_matrix');

  const matchGhost2 = CraftManager.matchRecipe(['ghost_keyboard', 'chair_jacket']);
  assert.ok(matchGhost2);
  assert.equal(matchGhost2.resultItemId, 'ghost_matrix');

  // Unordered matching for intern_alliance
  const matchIntern = CraftManager.matchRecipe(['labor_law', 'intern_guide']);
  assert.ok(matchIntern);
  assert.equal(matchIntern.resultItemId, 'intern_alliance');

  // Unordered matching for hyper_stamina_brew
  const matchStamina = CraftManager.matchRecipe(['warm_coffee', 'energy_potion']);
  assert.ok(matchStamina);
  assert.equal(matchStamina.resultItemId, 'hyper_stamina_brew');
});

test('T6.5 Overtime mode midnight events and survival actions expansion', (t) => {
  assert.ok(OVERTIME_EVENTS.length >= 13, `Must have >= 13 overtime events, got ${OVERTIME_EVENTS.length}`);
  assert.ok(OVERTIME_ACTIONS.length >= 8, `Must have >= 8 overtime actions, got ${OVERTIME_ACTIONS.length}`);

  const ot = new OvertimeEngine();

  // Test act_keyboard_pretend
  const actRes1 = ot.performAction('act_keyboard_pretend');
  assert.ok(actRes1.success);
  assert.equal(ot.turn, 1);
  assert.equal(ot.getTimeString(), '20:30');
  assert.ok(ot.presence >= 40 && ot.presence <= 80, `Presence must be between 40 and 80, got ${ot.presence}`);

  // Test act_tea_brewing
  const actRes2 = ot.performAction('act_tea_brewing');
  assert.ok(actRes2.success);
  assert.equal(ot.turn, 2);
  assert.equal(ot.getTimeString(), '21:00');
});

test('T6.6 Reverse Boss Mode: Emergency Meeting summon skill', (t) => {
  const boss = new ReverseBossEngine();
  assert.equal(boss.majesty, 100);
  assert.equal(boss.turn, 0);

  const devBefore = boss.employees.find((e) => e.id === 'emp_dev');
  assert.equal(devBefore.area, '18楼工位区');

  const meetingRes = boss.useSkillEmergencyMeeting();
  assert.ok(meetingRes.success);
  assert.equal(boss.majesty, 75, 'Emergency meeting costs 25 majesty');
  assert.equal(boss.turn, 1, 'Turn should advance');

  const devAfter = boss.employees.find((e) => e.id === 'emp_dev');
  assert.equal(devAfter.area, '18楼工位区', 'Employees must remain stunned and not move during emergency meeting');
});

test('T6.7 Total Endings, Achievements, Encounters and Zone actions validation', (t) => {
  const endingsCount = Object.keys(ENDINGS).length;
  const achievementsCount = ACHIEVEMENTS.length;
  const encountersCount = RANDOM_ENCOUNTERS.length;

  assert.ok(endingsCount >= 30, `Must have >= 30 endings, got ${endingsCount}`);
  assert.ok(achievementsCount >= 30, `Must have >= 30 achievements, got ${achievementsCount}`);
  assert.ok(encountersCount >= 20, `Must have >= 20 encounters, got ${encountersCount}`);

  // Test Zone actions
  assert.ok(ZONE_ACTIONS[1].some((a) => a.id === 'keyboard_frenzy_pretend'));
  assert.ok(ZONE_ACTIONS[1].some((a) => a.id === 'cable_tray_search'));
  assert.ok(ZONE_ACTIONS[2].some((a) => a.id === 'pantry_secret_raid'));
  assert.ok(ZONE_ACTIONS[3].some((a) => a.id === 'fire_hydrant_stash'));

  // Test new achievements conditions
  const achTaichi = ACHIEVEMENTS.find((a) => a.id === 'ach_taichi_master');
  assert.ok(achTaichi);
  assert.equal(achTaichi.condition({}, { flags: { taichiMaster: true } }), true);
  assert.equal(achTaichi.condition({}, { flags: {} }), false);

  const achKeyboard = ACHIEVEMENTS.find((a) => a.id === 'ach_keyboard_god');
  assert.ok(achKeyboard);
  assert.equal(achKeyboard.condition({}, { flags: { hasKeyboardGod: true } }), true);
  assert.equal(achKeyboard.condition({}, { flags: {} }), false);
});
