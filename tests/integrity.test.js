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
import { GameEngine, DEPTH_TO_ZONE, ZONE_TO_DEPTH, ZONE_ALLOWED_DEPTHS } from '../src/engine/gameEngine.js';
import { MapManager } from '../src/engine/mapManager.js';
import { ReverseBossEngine } from '../src/engine/reverseBossEngine.js';
import { OvertimeEngine } from '../src/engine/overtimeEngine.js';
import { CraftManager } from '../src/engine/craftManager.js';
import { calculateBuzzwordScore } from '../src/data/buzzwords.js';
import { escapeHtml } from '../src/utils/security.js';
import { TUTORIAL_STEPS, GUIDE_SECTIONS } from '../src/data/guide.js';
import { MiniGameUI } from '../src/ui/miniGames.js';
import { MapView } from '../src/ui/mapView.js';
import { CraftModal } from '../src/ui/craftModal.js';

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

test('T7.9 MapManager findNode lookup cache & O(1) performance integrity', (t) => {
  const mapGraph = MapManager.generateDungeonMap('cache_integrity_seed');
  assert.ok(Array.isArray(mapGraph));

  // 1. Initial lookup
  const node0 = MapManager.findNode(mapGraph, 'node_0_0');
  assert.ok(node0);
  assert.equal(node0.id, 'node_0_0');
  assert.equal(node0.depth, 0);

  // 2. Cached lookup returns same instance
  const node0Cached = MapManager.findNode(mapGraph, 'node_0_0');
  assert.strictEqual(node0, node0Cached, 'Lookup must return cached node reference');

  // 3. Lookup across all layers
  for (let d = 0; d < mapGraph.length; d++) {
    for (let i = 0; i < mapGraph[d].length; i++) {
      const id = `node_${d}_${i}`;
      const found = MapManager.findNode(mapGraph, id);
      assert.ok(found);
      assert.equal(found.id, id);
    }
  }

  // 4. Missing node returns null
  assert.equal(MapManager.findNode(mapGraph, 'non_existent_node'), null);

  // 5. Dynamic fallback if node dynamically added
  const dynamicNode = { id: 'node_dynamic_extra', depth: 2, title: '隐藏机房' };
  mapGraph[2].push(dynamicNode);
  const foundDynamic = MapManager.findNode(mapGraph, 'node_dynamic_extra');
  assert.strictEqual(foundDynamic, dynamicNode, 'Dynamic node fallback must find newly added node');

  // 6. Cache clear
  MapManager.clearNodeCache(mapGraph);
  const node0AfterClear = MapManager.findNode(mapGraph, 'node_0_0');
  assert.strictEqual(node0AfterClear, node0, 'Lookup after cache clear must rebuild index and find node');
});

test('T7.10 GameState notification deduplication, microtask coalescing & batch execution', async (t) => {
  const state = new GameState();
  let notifyCount = 0;
  state.subscribe(() => {
    notifyCount++;
  });

  // 1. Batch execution: multiple updates in batch should dispatch exactly once at batch exit
  notifyCount = 0;
  state.batch(() => {
    state.addLog('Log 1');
    state.addItem('coffee');
    state.emit('ui:toast', { msg: 'Hello' });
    state.notify();
  });
  assert.equal(notifyCount, 1, 'Batch must coalesce all internal notifications into exactly 1 dispatch');

  // 2. Immediate option bypasses batch if explicitly requested
  notifyCount = 0;
  state.notify({ immediate: true });
  assert.equal(notifyCount, 1);

  // 3. Outside batch: rapid-fire notify() calls coalesce via microtask
  notifyCount = 0;
  state.notify(); // Call 1: dispatches synchronously on leading edge
  state.notify(); // Call 2: marks trailing notify
  state.notify(); // Call 3: duplicate in same tick
  assert.equal(notifyCount, 1, 'Synchronous leading edge dispatches once immediately');

  // Await microtask queue drain
  await new Promise((resolve) => queueMicrotask(resolve));
  assert.equal(notifyCount, 2, 'Trailing edge microtask dispatches exactly once for rapid calls');

  // 4. Flush notify immediately flushes trailing if pending
  notifyCount = 0;
  state.notify(); // Leading edge: 1
  state.notify(); // Trailing pending
  state.flushNotify(); // Flushed immediately: 2
  assert.equal(notifyCount, 2, 'flushNotify must execute pending trailing notify immediately');
});

test('T7.11 Depth <-> Zone unified mapping table consistency', (t) => {
  // 1. Verify constant mapping tables
  assert.deepEqual(DEPTH_TO_ZONE, {
    0: 1,
    1: 2,
    2: 3,
    3: 4,
    4: 4
  });

  assert.deepEqual(ZONE_TO_DEPTH, {
    1: 0,
    2: 1,
    3: 2,
    4: 4
  });

  assert.deepEqual(ZONE_ALLOWED_DEPTHS, {
    1: [0],
    2: [1],
    3: [2],
    4: [3, 4]
  });

  // 2. Verify GameEngine sync and out-of-sync evaluation with Zone 4
  const state = new GameState();
  const engine = new GameEngine(state);

  // At depth 0 and zone 1: not out of sync
  assert.equal(engine.isMapOutOfSync(), false);

  // Set zone to 4 while at depth 0: out of sync
  state.zone = 4;
  assert.equal(engine.isMapOutOfSync(), true);

  // Sync to zone 4: must advance map to target depth 4
  engine.syncMapToZone(4);
  assert.equal(state.zone, 4);
  const currNode = MapManager.findNode(state.mapGraph, state.currentMapNodeId);
  assert.equal(currNode.depth, 4);
  assert.equal(engine.isMapOutOfSync(), false);

  // Simulate player at depth 3 and zone 4 (lobby transition area): must NOT oscillate as out-of-sync
  const depth3Node = state.mapGraph[3][0];
  state.currentMapNodeId = depth3Node.id;
  state.zone = 4;
  assert.equal(engine.isMapOutOfSync(), false, 'Depth 3 in Zone 4 must be recognized as valid and not out of sync');
});

test('T7.12 ReverseBossEngine & OvertimeEngine deterministic PRNG & seed support', (t) => {
  // 1. OvertimeEngine seeded determinism
  const otSeed = 123456;
  const ot1 = new OvertimeEngine(otSeed);
  const ot2 = new OvertimeEngine(otSeed);

  for (let i = 0; i < 6; i++) {
    ot1.performAction('act_nod_listen');
    ot2.performAction('act_nod_listen');
  }

  assert.equal(ot1.sanity, ot2.sanity, 'Seeded OvertimeEngine must produce deterministic sanity');
  assert.equal(ot1.energy, ot2.energy, 'Seeded OvertimeEngine must produce deterministic energy');
  assert.equal(ot1.presence, ot2.presence, 'Seeded OvertimeEngine must produce deterministic presence');
  assert.equal(ot1.logs.length, ot2.logs.length, 'Seeded OvertimeEngine must produce identical event count');

  // Custom PRNG function support
  const customPrng = () => 0.1;
  const otCustom = new OvertimeEngine(customPrng);
  assert.equal(otCustom.random(), 0.1);

  // 2. ReverseBossEngine seeded determinism
  const bossSeed = 99999;
  const rb1 = new ReverseBossEngine(bossSeed);
  const rb2 = new ReverseBossEngine(bossSeed);

  rb1.moveTo('18楼走廊通道');
  rb2.moveTo('18楼走廊通道');
  rb1.stepTurn(true);
  rb2.stepTurn(true);

  assert.equal(rb1.logs.length, rb2.logs.length, 'Seeded ReverseBossEngine must produce identical logs');
  for (let i = 0; i < rb1.employees.length; i++) {
    assert.equal(
      rb1.employees[i].tactic,
      rb2.employees[i].tactic,
      `Employee ${rb1.employees[i].id} tactic must match deterministically`
    );
  }

  // Fallback when omitted: should be viable and return floats [0, 1)
  const defaultRb = new ReverseBossEngine();
  const rnd = defaultRb.random();
  assert.ok(rnd >= 0 && rnd < 1);
});

test('T7.13 UI Layer robustness: settlement consolidation, guide schema collision fix, timer leaks prevention, and craft view preservation', (t) => {
  // 1. Guide schema collision fix: TUTORIAL_STEPS 'goal' vs GUIDE_SECTIONS 'guide_section_goal'
  const stepGoal = TUTORIAL_STEPS.find((s) => s.id === 'goal');
  assert.ok(stepGoal, 'TUTORIAL_STEPS must keep id goal');
  const sectionGoal = GUIDE_SECTIONS.find((s) => s.id === 'guide_section_goal');
  assert.ok(sectionGoal, 'GUIDE_SECTIONS must use differentiated id guide_section_goal');

  // Verify zero ID collision between TUTORIAL_STEPS and GUIDE_SECTIONS
  const stepIds = new Set(TUTORIAL_STEPS.map((s) => s.id));
  const sectionIds = new Set(GUIDE_SECTIONS.map((s) => s.id));
  for (const id of stepIds) {
    assert.ok(!sectionIds.has(id), `Collision detected for id: ${id}`);
  }

  // 2. MiniGameUI consolidated settlement helpers
  const receiptHtml = MiniGameUI.renderReceiptSettlement({
    badge: '☯️ 太极推诿结算',
    sub: '面对回应',
    gradeLabel: '推诿心法评级',
    gradeText: '🌟 完美推诿',
    gradeCls: 'text-success',
    msg: '完美化解',
    stats: [{ label: '怀疑度', val: '-10%', cls: 'text-success' }],
    btnId: 'btn-test-settle',
    btnText: '继续'
  });
  assert.ok(receiptHtml.includes('qte-receipt-paper'));
  assert.ok(receiptHtml.includes('🌟 完美推诿'));
  assert.ok(receiptHtml.includes('btn-test-settle'));

  const compactHtml = MiniGameUI.renderCompactSettlement({
    icon: '🗣️',
    title: '震撼全场',
    stampText: '降维打击',
    stampCls: 'stamp-win',
    stats: [{ label: '评分', val: '100 分', cls: 'text-success' }],
    msg: '精彩对线',
    btnId: 'btn-test-compact',
    btnText: '收下战果'
  });
  assert.ok(compactHtml.includes('settle-compact-head'));
  assert.ok(compactHtml.includes('震撼全场'));
  assert.ok(compactHtml.includes('btn-test-compact'));

  // 3. MapView timer lifecycle and destroy cleanup
  const mapView = new MapView({ mapGraph: [] }, () => {});
  mapView.scrollTimeout = setTimeout(() => {}, 10000);
  assert.ok(mapView.scrollTimeout !== null);
  mapView.destroy();
  assert.equal(mapView.scrollTimeout, null, 'MapView.destroy must clear and nullify scrollTimeout');

  // 4. CraftModal updateView without destroying DOM overlay
  const state = new GameState();
  let closeCalled = false;
  const craft = new CraftModal(state, () => {}, () => { closeCalled = true; });

  // Simulate dummy modalEl
  const dummyOverlay = {
    parentNode: { removeChild: () => {} },
    querySelector: (sel) => {
      if (sel === '#craft-tab-forge' || sel === '#craft-tab-book') return { className: '' };
      if (sel === '#craft-unlocked-count') return { textContent: '' };
      if (sel === '#craft-tab-content') return { innerHTML: '' };
      return null;
    }
  };
  craft.modalEl = dummyOverlay;
  craft.render(); // should call updateView and NOT close()
  assert.equal(closeCalled, false, 'craft.render() when modalEl exists must not trigger close() or tear down overlay');

  craft.close();
  assert.equal(closeCalled, true, 'craft.close() must trigger onClose callback');
});
