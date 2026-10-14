import test from 'node:test';
import assert from 'node:assert/strict';

import { ENDINGS } from '../src/data/endings.js';
import { ACHIEVEMENTS } from '../src/data/achievements.js';
import { ITEMS } from '../src/data/items.js';
import { CHARACTERS } from '../src/data/characters.js';
import { RECIPES } from '../src/data/recipes.js';
import { RANDOM_ENCOUNTERS, ZONE_ACTIONS } from '../src/data/events.js';
import { OVERTIME_EVENTS, OVERTIME_ACTIONS } from '../src/data/overtimeEvents.js';
import { GameState, STORAGE_KEY_V1, STORAGE_KEY_V2 } from '../src/engine/gameState.js';
import { GameEngine } from '../src/engine/gameEngine.js';
import { ReverseBossEngine } from '../src/engine/reverseBossEngine.js';
import { OvertimeEngine } from '../src/engine/overtimeEngine.js';
import { CraftManager } from '../src/engine/craftManager.js';
import { calculateBuzzwordScore } from '../src/data/buzzwords.js';
import { escapeHtml } from '../src/utils/security.js';

test('T7.1 Data Referential Integrity: all cross-file references exist and are valid', (t) => {
  const endingIds = new Set(Object.keys(ENDINGS));
  const achievementIds = new Set(ACHIEVEMENTS.map((a) => a.id));
  const itemIds = new Set(Object.keys(ITEMS));
  const characterIds = new Set(Object.keys(CHARACTERS));

  // 1. Verify ending_normal_escape exists
  assert.ok(endingIds.has('ending_normal_escape'), 'ending_normal_escape must be defined');
  const normalEscape = ENDINGS.ending_normal_escape;
  assert.equal(normalEscape.id, 'ending_normal_escape');
  assert.equal(normalEscape.type, 'victory');
  assert.equal(normalEscape.rank, 'B');

  // 2. Verify all recipes unlockAchievement references exist in ACHIEVEMENTS
  RECIPES.forEach((recipe) => {
    if (recipe.unlockAchievement) {
      assert.ok(
        achievementIds.has(recipe.unlockAchievement),
        `Recipe ${recipe.id} references undefined achievement: ${recipe.unlockAchievement}`
      );
    }
    // Verify resultItemId exists in ITEMS
    assert.ok(itemIds.has(recipe.resultItemId), `Recipe ${recipe.id} resultItemId ${recipe.resultItemId} must exist in ITEMS`);
    // Verify all ingredients exist in ITEMS
    recipe.ingredients.forEach((ing) => {
      assert.ok(itemIds.has(ing), `Recipe ${recipe.id} ingredient ${ing} must exist in ITEMS`);
    });
  });

  // 3. Verify all ZONE_ACTIONS required items exist in ITEMS
  Object.values(ZONE_ACTIONS).forEach((actions) => {
    actions.forEach((act) => {
      if (act.requireItem) {
        assert.ok(itemIds.has(act.requireItem), `Action ${act.id} requires missing item ${act.requireItem}`);
      }
    });
  });

  // 4. Verify all RANDOM_ENCOUNTERS choices requireItem exist
  RANDOM_ENCOUNTERS.forEach((enc) => {
    enc.choices.forEach((c) => {
      if (c.requireItem) {
        assert.ok(itemIds.has(c.requireItem), `Encounter ${enc.id} requires missing item ${c.requireItem}`);
      }
    });
  });

  // 5. Verify all Characters starting items exist
  Object.values(CHARACTERS).forEach((char) => {
    if (char.startingItems) {
      char.startingItems.forEach((it) => {
        assert.ok(itemIds.has(it), `Character ${char.id} starting item ${it} must exist in ITEMS`);
      });
    }
  });
});

test('T7.2 Security Utility escapeHtml & sanitization verification', (t) => {
  assert.equal(escapeHtml('<script>alert("xss")</script>'), '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
  assert.equal(escapeHtml('Hello & "World" \'123\''), 'Hello &amp; &quot;World&quot; &#39;123&#39;');
  assert.equal(escapeHtml(null), '');
  assert.equal(escapeHtml(undefined), '');
  assert.equal(escapeHtml(123), '123');
});

test('T7.3 Save/Load round-trip & type pollution resilience verification', (t) => {
  const mockStorage = {};
  globalThis.localStorage = {
    getItem: (key) => mockStorage[key] || null,
    setItem: (key, val) => { mockStorage[key] = String(val); },
    removeItem: (key) => { delete mockStorage[key]; }
  };

  const state1 = new GameState();
  state1.history.gamesPlayed = 15;
  state1.history.victories = 8;
  state1.history.slackerExp = 450;
  state1.history.hardcoreWins = 3;
  state1.history.unlockedEndings = ['ending_perfect_clockout', 'ending_normal_escape'];
  state1.history.unlockedAchievements = ['ach_perfect', 'ach_craft_master'];
  state1.history.unlockedRecipes = ['recipe_cyber_stimulant'];
  state1.savePersistentData();

  // Load into brand new state instance
  const state2 = new GameState();
  assert.equal(state2.history.gamesPlayed, 15);
  assert.equal(state2.history.victories, 8);
  assert.equal(state2.history.slackerExp, 450);
  assert.equal(state2.history.hardcoreWins, 3);
  assert.equal(typeof state2.history.hardcoreWins, 'number');
  assert.deepEqual(state2.history.unlockedEndings, ['ending_perfect_clockout', 'ending_normal_escape']);
  assert.deepEqual(state2.history.unlockedAchievements, ['ach_perfect', 'ach_craft_master']);
  assert.deepEqual(state2.history.unlockedRecipes, ['recipe_cyber_stimulant']);

  // Test corrupted / legacy pollution recovery: hardcoreWins is {} in V1 storage
  mockStorage[STORAGE_KEY_V1] = JSON.stringify({
    gamesPlayed: '10',
    victories: '5',
    hardcoreWins: {}, // Corrupted object from legacy bug
    slackerExp: '300'
  });
  delete mockStorage[STORAGE_KEY_V2];

  const state3 = new GameState();
  assert.equal(typeof state3.history.hardcoreWins, 'number', 'Must heal object to number');
  assert.equal(state3.history.hardcoreWins, 0);
  assert.equal(typeof state3.history.gamesPlayed, 'number');
  assert.equal(state3.history.gamesPlayed, 10);
});

test('T7.4 TriggerEnding idempotency & Slacker Exp protection', (t) => {
  const state = new GameState();
  const engine = new GameEngine(state);

  const initialPlayed = state.history.gamesPlayed;
  const initialWins = state.history.victories;
  const initialExp = state.history.slackerExp;

  // First trigger
  engine.triggerEnding('ending_normal_escape');
  assert.equal(state.history.gamesPlayed, initialPlayed + 1);
  assert.equal(state.history.victories, initialWins + 1);
  const expAfterFirst = state.history.slackerExp;
  assert.ok(expAfterFirst > initialExp);

  // Subsequent trigger in same turn/run must be short-circuited
  engine.triggerEnding('ending_caught_meeting');
  assert.equal(state.history.gamesPlayed, initialPlayed + 1, 'Games played must not double increment');
  assert.equal(state.history.victories, initialWins + 1, 'Victories must not change');
  assert.equal(state.history.slackerExp, expAfterFirst, 'EXP must not double award');
  assert.equal(state.currentEnding.id, 'ending_normal_escape', 'Original ending preserved');
});

test('T7.5 CraftManager duplicate prevention & achievement auto-unlock', (t) => {
  const state = new GameState();
  state.inventory = ['wind_oil', 'warm_coffee'];

  // Craft cyber stimulant
  const res = CraftManager.craft(state, ['wind_oil', 'warm_coffee']);
  assert.ok(res.success);
  assert.ok(state.hasItem('cyber_stimulant'));
  assert.ok(state.history.unlockedAchievements.includes('ach_craft_master'), 'ach_craft_master must be unlocked');

  // Attempt duplicate craft with same ingredients
  state.inventory.push('wind_oil', 'warm_coffee');
  const res2 = CraftManager.craft(state, ['wind_oil', 'warm_coffee']);
  assert.equal(res2.success, false, 'Must reject duplicate craft');
  assert.ok(state.hasItem('wind_oil'), 'Ingredients must remain safe in inventory');
  assert.ok(state.hasItem('warm_coffee'), 'Ingredients must remain safe in inventory');
});

test('T7.6 Overtime Engine chronological hour window matching', (t) => {
  const ot = new OvertimeEngine();
  assert.equal(ot.currentHour, 20);

  // Check event candidates at 20:00 (offset 0)
  const getHourOffset = (h) => (h >= 20 ? h - 20 : h + 4);
  const currOffset = getHourOffset(20);
  const candidates20 = OVERTIME_EVENTS.filter((ev) => {
    const minOffset = getHourOffset(ev.minHour);
    const maxOffset = ev.maxHour !== undefined ? getHourOffset(ev.maxHour) : minOffset + 3;
    return currOffset >= minOffset && currOffset <= maxOffset;
  });

  // At 20:00, dawn light (minHour: 5) must NOT be present
  assert.ok(!candidates20.some((c) => c.id === 'ot_dawn_light'), 'ot_dawn_light must not appear at 20:00');
  // ot_big_pie (minHour: 20) MUST be present
  assert.ok(candidates20.some((c) => c.id === 'ot_big_pie'), 'ot_big_pie must appear at 20:00');

  // At 05:00 (offset 9)
  const currOffset5 = getHourOffset(5);
  const candidates5 = OVERTIME_EVENTS.filter((ev) => {
    const minOffset = getHourOffset(ev.minHour);
    const maxOffset = ev.maxHour !== undefined ? getHourOffset(ev.maxHour) : minOffset + 3;
    return currOffset5 >= minOffset && currOffset5 <= maxOffset;
  });
  assert.ok(candidates5.some((c) => c.id === 'ot_dawn_light'), 'ot_dawn_light must appear at 05:00');
  assert.ok(!candidates5.some((c) => c.id === 'ot_big_pie'), 'ot_big_pie must not appear at 05:00');
});

test('T7.7 Reverse Boss Engine full stun turn preservation & 18:05 progression', (t) => {
  const boss = new ReverseBossEngine();
  assert.equal(boss.getTimeString(), '17:45');

  // Use Emergency Meeting
  boss.useSkillEmergencyMeeting();
  assert.equal(boss.turn, 1);
  assert.equal(boss.stunTurns, 1, 'stunTurns must be 1');

  const empDev = boss.employees.find((e) => e.id === 'emp_dev');
  assert.equal(empDev.area, '18楼工位区');

  // Next move: player moves to 18F corridor
  boss.moveTo('18楼走廊通道');
  assert.equal(boss.turn, 2);
  assert.equal(boss.stunTurns, 0, 'stunTurns consumed during move turn');
  // dev must STILL be in office because stun was active for this turn
  assert.equal(empDev.area, '18楼工位区', 'emp_dev must remain in office while stun was active');

  // Simulate advancing turns up to maxTurns (8)
  while (boss.turn < boss.maxTurns) {
    boss.advanceTime();
  }
  assert.equal(boss.turn, 8);
  assert.equal(boss.getTimeString(), '18:05', 'Must reach 18:05 exactly at maxTurns without integer truncation');
});

test('T7.8 Engine ui:toast decoupling & ach_social_butterfly field fix verification', (t) => {
  const state = new GameState();
  let toastReceived = null;
  state.subscribe('ui:toast', (payload) => {
    toastReceived = payload;
  });

  const engine = new GameEngine(state);
  // Verify emit works via executeAction
  state.zone = 1;
  const action = ZONE_ACTIONS[1][0];
  engine.executeAction(action.id);
  assert.ok(toastReceived !== null, 'ui:toast event must be received by subscriber');

  // Test ach_social_butterfly with favorability >= 80
  const ach = ACHIEVEMENTS.find((a) => a.id === 'ach_social_butterfly');
  assert.ok(ach);
  const stateWithFavor = {
    npcRelations: {
      colleague_awei: { favorability: 85 },
      cleaner_aunt: { favorability: 90 },
      intern_chen: { favorability: 20 }
    }
  };
  assert.equal(ach.condition({}, stateWithFavor), true, 'Must unlock when 2 NPCs have favorability >= 80');

  const stateWithoutFavor = {
    npcRelations: {
      colleague_awei: { favorability: 70 },
      cleaner_aunt: { favorability: 90 }
    }
  };
  assert.equal(ach.condition({}, stateWithoutFavor), false, 'Must not unlock when < 2 NPCs have favorability >= 80');

  // Test product_manager in calculateBuzzwordScore
  const scorePM = calculateBuzzwordScore(['bw_closed_loop'], 'product_manager');
  const scorePMMgr = calculateBuzzwordScore(['bw_closed_loop'], 'product_mgr');
  assert.equal(scorePM, scorePMMgr, 'product_manager and product_mgr must produce identical multiplier');
  assert.ok(scorePM > 0);
});
