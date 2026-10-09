import test from 'node:test';
import assert from 'node:assert/strict';

import { PRNG } from '../src/utils/prng.js';
import { MapManager } from '../src/engine/mapManager.js';
import { RECIPES } from '../src/data/recipes.js';
import { CraftManager } from '../src/engine/craftManager.js';
import { GameState } from '../src/engine/gameState.js';
import { GameEngine } from '../src/engine/gameEngine.js';
import { ITEMS } from '../src/data/items.js';

test('T1.1 PRNG Mulberry32 determinism & distribution', (t) => {
  const seed = '2026-10-09-workplace';
  const prng1 = new PRNG(seed);
  const prng2 = new PRNG(seed);

  const series1 = Array.from({ length: 100 }, () => prng1.random());
  const series2 = Array.from({ length: 100 }, () => prng2.random());

  assert.deepEqual(series1, series2, 'Identical seed must produce 100% identical random series');

  // Integer range tests
  const intPrng = new PRNG(42);
  for (let i = 0; i < 500; i++) {
    const val = intPrng.randInt(5, 15);
    assert.ok(val >= 5 && val <= 15, `randInt must stay within [5, 15], got ${val}`);
  }
});

test('T1.2 DAG map generation & 10,000 maps connectivity validation', (t) => {
  // Acceptance Criteria: 10,000 maps generated, 100% reachability to exit, 0 dead ends
  const iterations = 10000;
  let passCount = 0;

  for (let i = 0; i < iterations; i++) {
    const seed = `test_seed_${i}`;
    const map = MapManager.generateDungeonMap(seed);
    const isValid = MapManager.validateMapConnectivity(map);
    if (isValid) passCount++;
  }

  assert.equal(passCount, iterations, `All ${iterations} generated DAG maps must have full connectivity without dead ends`);
});

test('T1.2 Deterministic map generation across same seed', (t) => {
  const seed = '2026-10-09';
  const mapA = MapManager.generateDungeonMap(seed);
  const mapB = MapManager.generateDungeonMap(seed);

  assert.equal(mapA.length, mapB.length);
  for (let d = 0; d < mapA.length; d++) {
    assert.equal(mapA[d].length, mapB[d].length);
    for (let i = 0; i < mapA[d].length; i++) {
      assert.equal(mapA[d][i].id, mapB[d][i].id);
      assert.equal(mapA[d][i].type, mapB[d][i].type);
      assert.deepEqual(mapA[d][i].nextNodeIds, mapB[d][i].nextNodeIds);
    }
  }
});

test('T1.4 Recipe unordered matching engine', (t) => {
  // Test all recipes match in any permutation
  RECIPES.forEach((recipe) => {
    const forward = recipe.ingredients;
    const reverse = [...recipe.ingredients].reverse();

    const matchedForward = CraftManager.matchRecipe(forward);
    const matchedReverse = CraftManager.matchRecipe(reverse);

    assert.ok(matchedForward, `Forward order should match recipe ${recipe.id}`);
    assert.ok(matchedReverse, `Reverse order should match recipe ${recipe.id}`);
    assert.equal(matchedForward.id, recipe.id);
    assert.equal(matchedReverse.id, recipe.id);
    assert.ok(ITEMS[recipe.resultItemId], `Result item ${recipe.resultItemId} must exist in ITEMS`);
  });

  // Invalid recipe returns null
  assert.equal(CraftManager.matchRecipe(['non_existent_1', 'non_existent_2']), null);
  assert.equal(CraftManager.matchRecipe(['warm_coffee']), null);
});

test('T1.4 & T1.5 Crafting execution, inventory deduction & synergy activation', (t) => {
  const state = new GameState();
  state.inventory = ['wind_oil', 'warm_coffee'];

  const craftResult = CraftManager.craft(state, ['warm_coffee', 'wind_oil']);
  assert.ok(craftResult.success, 'Craft should succeed');
  assert.equal(craftResult.recipe.resultItemId, 'cyber_stimulant');

  // Verify ingredients consumed and product added
  assert.ok(!state.hasItem('wind_oil'), 'wind_oil should be consumed');
  assert.ok(!state.hasItem('warm_coffee'), 'warm_coffee should be consumed');
  assert.ok(state.hasItem('cyber_stimulant'), 'cyber_stimulant should be present');
  assert.ok(state.history.unlockedRecipes.includes('recipe_cyber_stimulant'));

  // Test item use effect
  const useResult = state.useItem('cyber_stimulant');
  assert.ok(useResult.success);
  assert.equal(state.flags.cyberStimulantActive, 4);
});

test('T1.3 Map traversal & node selection in GameEngine', (t) => {
  const state = new GameState();
  const engine = new GameEngine(state);

  const startNode = state.mapGraph[0][0];
  assert.equal(state.currentMapNodeId, startNode.id);
  assert.ok(startNode.isVisited);

  // Available next nodes
  const availableNext = MapManager.getAvailableNextNodes(state.mapGraph, startNode.id);
  assert.ok(availableNext.length > 0, 'Start node must lead to next nodes');

  const targetNode = availableNext[0];

  // Travel to target node
  engine.travelToNode(targetNode.id);

  assert.equal(state.currentMapNodeId, targetNode.id);
  assert.ok(targetNode.isVisited);
  assert.equal(state.zone, targetNode.zone);
  assert.equal(state.turns, 1, 'Turns should increment');

  // Verify next layer children are unlocked
  targetNode.nextNodeIds.forEach((childId) => {
    const child = MapManager.findNode(state.mapGraph, childId);
    assert.ok(child.isAvailable, `Child node ${childId} must become available`);
  });
});
