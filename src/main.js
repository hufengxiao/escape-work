/**
 * Main Game Entry Point
 */

import './styles/main.css';
import './styles/components.css';

import { GameState } from './engine/gameState.js';
import { GameEngine } from './engine/gameEngine.js';
import { UIRenderer } from './ui/renderer.js';
import { toast } from './ui/toast.js';

document.addEventListener('DOMContentLoaded', () => {
  const gameState = new GameState();
  const gameEngine = new GameEngine(gameState);
  const uiRenderer = new UIRenderer(gameState, gameEngine);

  // Expose to window for debugging if needed
  window.__GAME__ = {
    state: gameState,
    engine: gameEngine,
    ui: uiRenderer
  };

  // Welcome Toast
  setTimeout(() => {
    toast.show('现在是 17:45，坚持到 18:00 逃脱办公室！注意老板怀疑度！', 'alert', 4000);
  }, 400);

  console.log(
    '%c🏃 准点下班大作战：逃离老板视线 v1.0.0 %c\n' +
    'Designed for H5 mobile & modern browsers. Ready for Cloudflare Pages.',
    'background:#4f46e5;color:#fff;padding:6px 12px;border-radius:4px;font-weight:bold;',
    'color:#38bdf8;'
  );
});
