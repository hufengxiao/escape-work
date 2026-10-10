import test from 'node:test';
import assert from 'node:assert/strict';

import { ReverseBossEngine, BOSS_AREAS } from '../src/engine/reverseBossEngine.js';
import { OvertimeEngine } from '../src/engine/overtimeEngine.js';
import { MiniGameRunner } from '../src/engine/miniGameRunner.js';
import { ENDINGS } from '../src/data/endings.js';
import { ReverseBossView } from '../src/ui/reverseBossView.js';
import { OvertimeView } from '../src/ui/overtimeView.js';
import { MiniGameUI } from '../src/ui/miniGames.js';

test('T5.1 Boss Areas tactical metadata integrity', (t) => {
  assert.equal(BOSS_AREAS.length, 6, 'Must have 6 distinct patrol areas');
  BOSS_AREAS.forEach((area) => {
    assert.ok(area.id, 'Area must have id');
    assert.ok(area.name, 'Area must have name');
    assert.ok(typeof area.floor === 'number', 'Area must have numeric floor');
    assert.ok(area.desc, 'Area must have description');
  });
});

test('T5.2 Reverse Boss Mode defeat condition & ending assignment', (t) => {
  const boss = new ReverseBossEngine();
  // Simulate 3 employees escaping
  boss.escapedEmployees = [
    { id: 'emp_dev', name: '后端小刘' },
    { id: 'emp_fe', name: '前端阿杰' },
    { id: 'emp_ui', name: 'UI小美' }
  ];
  boss.stepTurn(false);
  assert.equal(boss.isFinished, true);
  assert.equal(boss.result, 'defeat');
  assert.equal(boss.resultEnding.id, 'ending_reverse_boss_loss');
  assert.ok(ENDINGS[boss.resultEnding.id]);
});

test('T5.3 Overtime Engine defeat condition & ending assignment', (t) => {
  const ot = new OvertimeEngine();
  ot.sanity = 2;
  ot.performAction('act_nod_listen');
  assert.equal(ot.isFinished, true);
  assert.equal(ot.result, 'defeat');
  assert.equal(ot.resultEnding.id, 'ending_overtime_collapse');
});

test('T5.4 ReverseBossView, OvertimeView, and MiniGameUI class instantiation', (t) => {
  assert.ok(typeof ReverseBossView === 'function');
  assert.ok(typeof OvertimeView === 'function');
  assert.ok(typeof MiniGameUI === 'function');
  assert.ok(typeof MiniGameUI.showBuzzwordBattle === 'function');
  assert.ok(typeof MiniGameUI.showRedPacketModal === 'function');
  assert.ok(typeof MiniGameUI.showClockOutQTE === 'function');

  // Verify view instance creation
  const mockState = { history: { unlockedEndings: [], unlockedAchievements: [] }, savePersistentData: () => {}, notify: () => {} };
  const bossView = new ReverseBossView(mockState);
  assert.ok(bossView.engine instanceof ReverseBossEngine);
  assert.equal(bossView.outcomeShown, false);

  const otView = new OvertimeView(mockState);
  assert.ok(otView.engine instanceof OvertimeEngine);
  assert.equal(otView.outcomeShown, false);
});

test('T5.5 All INTERACTIVE_TOUR_STEPS selectors integrity & Step 5 highlight verification', async (t) => {
  const { INTERACTIVE_TOUR_STEPS } = await import('../src/data/guide.js');
  assert.equal(INTERACTIVE_TOUR_STEPS.length, 8, 'Must have 8 tour steps');

  INTERACTIVE_TOUR_STEPS.forEach((step) => {
    assert.ok(step.step >= 1 && step.step <= 8, `Step number must be valid: ${step.step}`);
    assert.ok(step.selector && typeof step.selector === 'string', `Step ${step.step} must have a selector string`);
    assert.ok(step.selector.length > 0, `Selector must not be empty`);
  });

  // Verify step 5 explicitly targets map view container
  const step5 = INTERACTIVE_TOUR_STEPS.find((s) => s.step === 5);
  assert.ok(step5, 'Step 5 must exist');
  assert.ok(
    step5.selector.includes('#map-view-container') || step5.selector.includes('.map-view-container'),
    'Step 5 selector must target map-view-container for highlight spotlight'
  );
});

test('T5.6 Tour Step 4 targets bottom nav and CraftModal supports onClose', async (t) => {
  const { INTERACTIVE_TOUR_STEPS } = await import('../src/data/guide.js');
  const step4 = INTERACTIVE_TOUR_STEPS.find((s) => s.step === 4);
  assert.ok(step4, 'Step 4 must exist');
  assert.ok(step4.selector.includes('.cyber-bottom-nav'), 'Step 4 must target cyber-bottom-nav');

  const { CraftModal } = await import('../src/ui/craftModal.js');
  let closed = false;
  const craft = new CraftModal({}, () => {}, () => { closed = true; });
  craft.close();
  assert.equal(closed, true, 'CraftModal close must invoke onClose callback');
});

test('T5.7 SoundEngine toggleBgm, startBgm, stopBgm and auto-unmute behavior', async (t) => {
  const { sound } = await import('../src/audio/sound.js');
  
  // Ensure clean initial state
  sound.stopBgm();
  assert.equal(sound.bgmPlaying, false, 'BGM should initially be stopped');

  // 1. Toggle ON
  const started = sound.toggleBgm();
  assert.equal(started, true, 'toggleBgm should return true when starting');
  assert.equal(sound.bgmPlaying, true, 'sound.bgmPlaying should be true');

  // 2. Toggle OFF
  const stopped = sound.toggleBgm();
  assert.equal(stopped, false, 'toggleBgm should return false when stopping');
  assert.equal(sound.bgmPlaying, false, 'sound.bgmPlaying should be false');
  assert.equal(sound.bgmInterval, null, 'bgmInterval should be cleared');

  // 3. Muted state auto-unmute on toggleBgm
  sound.isMuted = true;
  const startedFromMute = sound.toggleBgm();
  assert.equal(startedFromMute, true, 'toggleBgm should start even if previously muted');
  assert.equal(sound.isMuted, false, 'isMuted should be reset to false so BGM is audible');
  assert.equal(sound.bgmPlaying, true, 'BGM should be playing');

  // Clean up
  sound.stopBgm();
  assert.equal(sound.bgmPlaying, false);
});

test('T5.8 CURRENT_VERSION sync with CHANGELOGS and package.json', async (t) => {
  const { CURRENT_VERSION, CHANGELOGS } = await import('../src/data/changelog.js');
  const fs = await import('node:fs');
  const pkg = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf-8'));

  assert.equal(CURRENT_VERSION, pkg.version, 'CURRENT_VERSION must match package.json version');
  assert.equal(CURRENT_VERSION, CHANGELOGS[0].version, 'CURRENT_VERSION must match CHANGELOGS[0].version');
  assert.equal(CHANGELOGS[0].isLatest, true, 'Latest changelog item must have isLatest = true');

  const latestCount = CHANGELOGS.filter((c) => c.isLatest).length;
  assert.equal(latestCount, 1, 'Only one changelog entry may be flagged as isLatest');
});

test('T5.9 Consolidated 2-tab bottom navigation and Modes Hub card architecture', async (t) => {
  const fs = await import('node:fs');
  const rendererCode = fs.readFileSync(new URL('../src/ui/renderer.js', import.meta.url), 'utf-8');

  // Verify bottom nav contains the two consolidated tabs
  assert.ok(rendererCode.includes('id="nav-tab-escape"'), 'Must have escape tab button');
  assert.ok(rendererCode.includes('id="nav-tab-modes"'), 'Must have modes hub tab button');
  assert.ok(!rendererCode.includes('id="nav-tab-boss"'), 'Separate boss bottom tab must be removed');
  assert.ok(!rendererCode.includes('id="nav-tab-overtime"'), 'Separate overtime bottom tab must be removed');
  assert.ok(!rendererCode.includes('id="nav-tab-workshop"'), 'Separate workshop bottom tab must be removed');
  assert.ok(!rendererCode.includes('id="nav-tab-archive"'), 'Separate archive bottom tab must be removed');

  // Verify Modes Hub view and 4 portal cards
  assert.ok(rendererCode.includes('id="modes-hub-container"'), 'Must have modes-hub-container');
  assert.ok(rendererCode.includes('id="card-mode-boss"'), 'Must have boss mode portal card');
  assert.ok(rendererCode.includes('id="card-mode-overtime"'), 'Must have overtime mode portal card');
  assert.ok(rendererCode.includes('id="card-mode-workshop"'), 'Must have workshop mode portal card');
  assert.ok(rendererCode.includes('id="card-mode-archive"'), 'Must have archive mode portal card');

  // Verify Tour Step 3, 5, 8 targets for refactored tabs
  const { INTERACTIVE_TOUR_STEPS } = await import('../src/data/guide.js');
  const step3 = INTERACTIVE_TOUR_STEPS.find((s) => s.step === 3);
  assert.ok(step3.selector.includes('#tab-btn-radar') || step3.selector.includes('#radar-slot'), 'Step 3 must target radar');

  const step8 = INTERACTIVE_TOUR_STEPS.find((s) => s.step === 8);
  assert.ok(step8.selector.includes('#tab-btn-backpack') || step8.selector.includes('.backpack-section'), 'Step 8 must target backpack');
});

test('T5.10 Streamlined 4-tab zero-scroll layout, full tactical step text and Tour automatic tab switching', async (t) => {
  const fs = await import('node:fs');
  const rendererCode = fs.readFileSync(new URL('../src/ui/renderer.js', import.meta.url), 'utf-8');

  // Verify view-tab-nav is streamlined to exactly 4 tabs (no horizontal scroll)
  assert.ok(rendererCode.includes('id="tab-btn-action"'), 'Must have action tab');
  assert.ok(rendererCode.includes('id="tab-btn-map"'), 'Must have map tab');
  assert.ok(rendererCode.includes('id="tab-btn-backpack"'), 'Must have backpack tab');
  assert.ok(rendererCode.includes('id="tab-btn-log"'), 'Must have log tab');
  assert.ok(!rendererCode.includes('id="tab-btn-radar"'), 'Radar tab must be merged into map panel');
  assert.ok(!rendererCode.includes('id="tab-btn-all"'), 'All tab must be removed to avoid horizontal sliding');

  // Verify radar-slot is integrated into map-view-panel
  assert.ok(rendererCode.includes('id="map-view-panel"'), 'Must have map-view-panel');
  assert.ok(rendererCode.includes('id="radar-slot"'), 'Must have radar-slot');

  // Verify tactical step bar full-width structure
  assert.ok(rendererCode.includes('class="tactical-step-content"'), 'Must have tactical-step-content');
  assert.ok(rendererCode.includes('class="tactical-step-header"'), 'Must have tactical-step-header');

  // Verify Tour Step 4 targets #nav-tab-modes
  const { INTERACTIVE_TOUR_STEPS } = await import('../src/data/guide.js');
  const step4 = INTERACTIVE_TOUR_STEPS.find((s) => s.step === 4);
  assert.ok(step4.selector.includes('#nav-tab-modes'), 'Step 4 selector must target nav-tab-modes');
});

test('T5.11 Backpack 2-column grid, synergy portal & Live log padding layout verification', async (t) => {
  const fs = await import('node:fs');
  const rendererCode = fs.readFileSync(new URL('../src/ui/renderer.js', import.meta.url), 'utf-8');
  const cssCode = fs.readFileSync(new URL('../src/styles/components.css', import.meta.url), 'utf-8');

  // 1. Verify backpack layout components in renderer.js
  assert.ok(rendererCode.includes('id="backpack-craft-portal"'), 'Must have backpack-craft-portal');
  assert.ok(rendererCode.includes('id="btn-backpack-go-craft"'), 'Must have btn-backpack-go-craft');
  assert.ok(rendererCode.includes('class="backpack-tips-card"'), 'Must have backpack-tips-card');
  assert.ok(rendererCode.includes('empty-tray-box'), 'Must render empty-tray-box when inventory is empty');
  assert.ok(rendererCode.includes('id="log-count-badge"'), 'Must have log-count-badge in log section');

  // 2. Verify CSS grid and scroll rules in components.css
  assert.ok(cssCode.includes('grid-template-columns: repeat(2, 1fr)'), 'Item tray must use 2-column grid');
  assert.ok(!cssCode.includes('.item-tray {\n  display: flex;\n  gap: 8px;\n  overflow-x: auto;'), 'Item tray must not have overflow-x auto');
  assert.ok(cssCode.includes('.view-tab-panel {'), 'Must define base view-tab-panel class with padding');
  assert.ok(cssCode.includes('min-height: 320px;'), 'Log container must have comfortable expanded height');
});

test('T5.12 Stat delta highlight, encounter toast feedback & enlarged dynamic log layout verification', async (t) => {
  const fs = await import('node:fs');
  const rendererCode = fs.readFileSync(new URL('../src/ui/renderer.js', import.meta.url), 'utf-8');
  const engineCode = fs.readFileSync(new URL('../src/engine/gameEngine.js', import.meta.url), 'utf-8');
  const componentsCss = fs.readFileSync(new URL('../src/styles/components.css', import.meta.url), 'utf-8');
  const mainCss = fs.readFileSync(new URL('../src/styles/main.css', import.meta.url), 'utf-8');

  // 1. Verify stat delta chips in dashboard markup & logic
  assert.ok(rendererCode.includes('id="suspicion-delta"'), 'Must have suspicion delta chip');
  assert.ok(rendererCode.includes('id="energy-delta"'), 'Must have energy delta chip');
  assert.ok(rendererCode.includes('id="time-delta"'), 'Must have time delta chip');
  assert.ok(rendererCode.includes('stat-flash-danger'), 'Must support stat-flash-danger animation');

  // 2. Verify encounter choice toast feedback in engine
  assert.ok(engineCode.includes('toast.show(result.msg, result.type || \'info\');'), 'Must toast encounter result');

  // 3. Verify enlarged log entries & stat highlight chips
  assert.ok(componentsCss.includes('.log-stat-chip'), 'Must have log stat highlight chip styles');
  assert.ok(componentsCss.includes('.ticker-flash-warning'), 'Must have ticker flash animations');
  assert.ok(mainCss.includes('.stat-delta-chip'), 'Must have stat delta chip styles');
  assert.ok(mainCss.includes('@keyframes flashTextDanger'), 'Must have flashTextDanger animation');

  // 4. Verify intern contextual hint
  assert.ok(rendererCode.includes('非实习生装嫩将+8%怀疑度'), 'Must display non-intern risk warning in encounter choices');
});

test('T5.13 DAG map travel zone synchronization & Zone 4 turnstile action verification', async (t) => {
  const { GameState } = await import('../src/engine/gameState.js');
  const { GameEngine } = await import('../src/engine/gameEngine.js');
  const { MAP_LAYERS } = await import('../src/data/maps.js');
  const { ZONE_ACTIONS, ZONES } = await import('../src/data/events.js');
  const { MapManager } = await import('../src/engine/mapManager.js');

  // 1. Verify MAP_LAYERS configuration: layer 4 must map to zone 4 (not 5)
  assert.equal(MAP_LAYERS[4].zone, 4, 'Layer 4 (gate) must map to zone 4');
  assert.equal(MAP_LAYERS[3].zone, 4, 'Layer 3 must map to zone 4');

  // 2. Instantiate state & engine
  const state = new GameState();
  const engine = new GameEngine(state);

  let notified = false;
  state.subscribe(() => {
    notified = true;
  });

  // 3. Find the boss node at depth 4
  const bossNode = state.mapGraph[4][0];
  assert.ok(bossNode, 'Boss node at depth 4 must exist');
  assert.equal(bossNode.zone, 4, 'Boss node zone must be 4');

  // Make boss node available for traversal test
  bossNode.isAvailable = true;

  // Travel to boss node
  engine.travelToNode(bossNode.id);

  // 4. Verify zone is strictly 4, notify was called, and Zone 4 actions are present
  assert.equal(state.zone, 4, 'State zone must be clamped to 4');
  assert.equal(notified, true, 'State subscriber notify() must be called on travel');

  const zone4 = ZONES.find((z) => z.id === state.zone);
  assert.ok(zone4, 'Zone 4 metadata must exist');
  assert.equal(zone4.id, 4);

  const zone4Actions = ZONE_ACTIONS[state.zone] || [];
  assert.ok(zone4Actions.length > 0, 'Zone 4 must have available punch-out actions');
  assert.ok(zone4Actions.some((a) => a.id === 'clockout_qte_punch'), 'Zone 4 must include QTE clockout action');
  assert.ok(zone4Actions.some((a) => a.id === 'face_recognition'), 'Zone 4 must include face recognition action');

  // 5. Check MapView boss banner and button rendering
  const { MapView } = await import('../src/ui/mapView.js');
  let switchedTab = null;
  const mapView = new MapView(state, () => {}, (tab) => { switchedTab = tab; });
  const html = mapView.render();
  assert.ok(html.includes('id="map-boss-banner"'), 'MapView must render boss banner when at gate node');
  assert.ok(html.includes('id="btn-map-go-action"'), 'MapView must render button to switch to action tab');
});
