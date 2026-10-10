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


