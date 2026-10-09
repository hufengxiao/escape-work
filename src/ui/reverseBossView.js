/**
 * Reverse Boss Mode UI View: 《阎总的一天：逮捕准点逃兵》
 */

import { ReverseBossEngine, BOSS_AREAS } from '../engine/reverseBossEngine.js';

export class ReverseBossView {
  constructor(gameState, onFinishCallback = null) {
    this.gameState = gameState;
    this.engine = new ReverseBossEngine();
    this.onFinishCallback = onFinishCallback;
    this.container = null;
  }

  show() {
    this.hide();
    this.engine.reset();

    const overlay = document.createElement('div');
    overlay.className = 'modal-backdrop active reverse-boss-modal';
    overlay.id = 'reverse-boss-modal';

    overlay.innerHTML = `
      <div class="modal-card reverse-boss-card" style="max-width: 620px; width: 94%;">
        <div class="modal-header" style="background: linear-gradient(135deg, #450a0a, #7f1d1d); border-bottom: 2px solid #b91c1c;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:24px;">👑</span>
            <div>
              <div style="font-weight:bold; font-size:16px; color:#fef2f2;">阎总的一天：逮捕准点逃兵</div>
              <div style="font-size:12px; color:#fca5a5;">角色反转挑战模式 · 18:05 前阻截至少 3 名下班员工</div>
            </div>
          </div>
          <button class="modal-close" id="btn-close-reverse-boss" style="color:#fecaca;">✕</button>
        </div>

        <div class="modal-body" style="padding: 16px; display:flex; flex-direction:column; gap:12px;">
          <!-- Top Stats HUD -->
          <div class="reverse-hud-grid" style="display:grid; grid-template-columns: repeat(3, 1fr); gap:8px; background: rgba(0,0,0,0.3); padding:10px; border-radius:8px; border:1px solid #7f1d1d;">
            <div style="text-align:center;">
              <div style="font-size:11px; color:#94a3b8;">当前时刻</div>
              <div id="boss-time" style="font-size:18px; font-weight:bold; color:#f87171;">17:45</div>
            </div>
            <div style="text-align:center;">
              <div style="font-size:11px; color:#94a3b8;">阎总威严值</div>
              <div id="boss-majesty" style="font-size:18px; font-weight:bold; color:#fbbf24;">100 / 100</div>
            </div>
            <div style="text-align:center;">
              <div style="font-size:11px; color:#94a3b8;">抓捕战果</div>
              <div id="boss-caught-score" style="font-size:18px; font-weight:bold; color:#4ade80;">🎯 0 / 3</div>
            </div>
          </div>

          <!-- Current Location -->
          <div style="display:flex; justify-content:space-between; align-items:center; background:#1e293b; padding:8px 12px; border-radius:6px; font-size:13px;">
            <span style="color:#94a3b8;">📍 阎总当前位置：</span>
            <strong id="boss-current-area" style="color:#fca5a5;">19楼总裁办</strong>
            <span id="boss-escaped-count" style="color:#ef4444; font-size:12px;">🏃 已逃离: 0 / 3</span>
          </div>

          <!-- Employee Tracker -->
          <div style="background:#0f172a; border-radius:6px; padding:10px; border:1px solid #334155;">
            <div style="font-size:12px; font-weight:bold; color:#cbd5e1; margin-bottom:6px; display:flex; justify-content:space-between;">
              <span>🎯 重点盯防员工动向</span>
              <span style="color:#64748b; font-size:11px;">每回合向1楼大堂移动</span>
            </div>
            <div id="boss-employee-list" style="display:grid; grid-template-columns: 1fr 1fr; gap:6px; font-size:12px;">
              <!-- Employee items inserted here -->
            </div>
          </div>

          <!-- Boss Skills -->
          <div style="background: rgba(185, 28, 28, 0.15); border: 1px solid #991b1b; border-radius:8px; padding:10px;">
            <div style="font-size:12px; font-weight:bold; color:#fca5a5; margin-bottom:8px;">🔥 阎总专属管理权术</div>
            <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:8px;">
              <button id="btn-boss-deadly-at" class="action-btn" style="background:#7f1d1d; border-color:#b91c1c; font-size:12px; padding:6px; text-align:center;">
                <div style="font-weight:bold; color:#fef2f2;">📢 夺命艾特</div>
                <div style="font-size:10px; color:#fca5a5;">群发红包全员定身(-20)</div>
              </button>
              <button id="btn-boss-raid" class="action-btn" style="background:#7f1d1d; border-color:#b91c1c; font-size:12px; padding:6px; text-align:center;">
                <div style="font-weight:bold; color:#fef2f2;">🦅 突击查岗</div>
                <div style="font-size:10px; color:#fca5a5;">搜查当前区域抓现行(-15)</div>
              </button>
              <button id="btn-boss-lift-ambush" class="action-btn" style="background:#7f1d1d; border-color:#b91c1c; font-size:12px; padding:6px; text-align:center;">
                <div style="font-weight:bold; color:#fef2f2;">🛗 专梯伏击</div>
                <div style="font-size:10px; color:#fca5a5;">直降1楼大堂截门(-30)</div>
              </button>
            </div>
          </div>

          <!-- Movement Navigation -->
          <div>
            <div style="font-size:12px; font-weight:bold; color:#94a3b8; margin-bottom:6px;">🚶 巡查移动（消耗 5 威严）</div>
            <div id="boss-move-grid" style="display:grid; grid-template-columns: repeat(3, 1fr); gap:6px;">
              <!-- Dynamic area move buttons -->
            </div>
          </div>

          <!-- Action Log Terminal -->
          <div id="boss-logs" style="height: 110px; overflow-y:auto; background:#020617; border:1px solid #1e293b; border-radius:6px; padding:8px; font-family: monospace; font-size:11px; color:#e2e8f0; display:flex; flex-direction:column; gap:4px;">
          </div>
        </div>

        <div class="modal-footer" style="padding:10px 16px; display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:11px; color:#64748b;">准点下班大作战 · 阎总反转DLC</span>
          <button id="btn-boss-restart" class="secondary-btn" style="padding:4px 12px; font-size:12px;">重置本局</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    this.container = overlay;

    this.bindEvents();
    this.render();
  }

  hide() {
    if (this.container) {
      this.container.remove();
      this.container = null;
    }
  }

  bindEvents() {
    if (!this.container) return;

    this.container.querySelector('#btn-close-reverse-boss')?.addEventListener('click', () => {
      this.hide();
    });

    this.container.querySelector('#btn-boss-restart')?.addEventListener('click', () => {
      this.engine.reset();
      this.render();
    });

    this.container.querySelector('#btn-boss-deadly-at')?.addEventListener('click', () => {
      const res = this.engine.useSkillDeadlyAt();
      if (!res.success) alert(res.message);
      this.render();
    });

    this.container.querySelector('#btn-boss-raid')?.addEventListener('click', () => {
      const res = this.engine.useSkillRaidInspection();
      if (!res.success) alert(res.message);
      this.render();
    });

    this.container.querySelector('#btn-boss-lift-ambush')?.addEventListener('click', () => {
      const res = this.engine.useSkillLiftAmbush();
      if (!res.success) alert(res.message);
      this.render();
    });
  }

  render() {
    if (!this.container) return;

    const s = this.engine.getState();

    // 1. HUD numbers
    const timeEl = this.container.querySelector('#boss-time');
    if (timeEl) timeEl.textContent = s.time;

    const majestyEl = this.container.querySelector('#boss-majesty');
    if (majestyEl) majestyEl.textContent = `${s.majesty} / 100`;

    const caughtEl = this.container.querySelector('#boss-caught-score');
    if (caughtEl) caughtEl.textContent = `🎯 ${s.caughtCount} / ${s.targetCaught}`;

    const areaEl = this.container.querySelector('#boss-current-area');
    if (areaEl) areaEl.textContent = s.currentArea;

    const escapedEl = this.container.querySelector('#boss-escaped-count');
    if (escapedEl) escapedEl.textContent = `🏃 已逃离: ${s.escapedCount} / 3`;

    // 2. Employee List
    const empList = this.container.querySelector('#boss-employee-list');
    if (empList) {
      empList.innerHTML = s.employees
        .map((emp) => {
          const isCaught = s.caughtEmployees.some((c) => c.id === emp.id);
          const isEscaped = s.escapedEmployees.some((e) => e.id === emp.id);
          let badge = `<span style="color:#fbbf24;">📍 ${emp.area}</span>`;
          if (isCaught) badge = `<span style="color:#4ade80; font-weight:bold;">🔒 已逮捕加班</span>`;
          if (isEscaped) badge = `<span style="color:#ef4444; font-weight:bold;">💨 已成功逃离</span>`;

          return `
            <div style="background: rgba(30, 41, 59, 0.5); padding: 4px 8px; border-radius: 4px; display:flex; justify-content:space-between; align-items:center;">
              <span style="color:#e2e8f0;">${emp.name}</span>
              ${badge}
            </div>
          `;
        })
        .join('');
    }

    // 3. Move Grid
    const moveGrid = this.container.querySelector('#boss-move-grid');
    if (moveGrid) {
      moveGrid.innerHTML = BOSS_AREAS.map((area) => {
        const isCurrent = area.name === s.currentArea;
        return `
          <button class="action-btn boss-area-btn ${isCurrent ? 'active' : ''}" 
                  data-area="${area.name}" 
                  ${isCurrent || s.isFinished ? 'disabled' : ''}
                  style="font-size:11px; padding:6px 4px; ${isCurrent ? 'background:#334155; opacity:0.6;' : 'background:#1e293b;'}">
            ${isCurrent ? '📍 ' : ''}${area.name}
          </button>
        `;
      }).join('');

      moveGrid.querySelectorAll('.boss-area-btn').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          const area = e.currentTarget.getAttribute('data-area');
          this.engine.moveTo(area);
          this.render();
        });
      });
    }

    // 4. Logs
    const logBox = this.container.querySelector('#boss-logs');
    if (logBox) {
      logBox.innerHTML = s.logs
        .map((log) => {
          let color = '#94a3b8';
          if (log.type === 'catch') color = '#4ade80';
          if (log.type === 'escape') color = '#ef4444';
          if (log.type === 'skill') color = '#fbbf24';
          if (log.type === 'victory') color = '#38bdf8';
          if (log.type === 'defeat') color = '#f87171';
          return `<div><span style="color:#64748b;">[${log.time}]</span> <span style="color:${color};">${log.text}</span></div>`;
        })
        .join('');
      logBox.scrollTop = logBox.scrollHeight;
    }

    // 5. Finished outcome popup
    if (s.isFinished && !this.outcomeShown) {
      this.outcomeShown = true;
      if (this.gameState && s.resultEnding) {
        if (!this.gameState.history.unlockedEndings.includes(s.resultEnding.id)) {
          this.gameState.history.unlockedEndings.push(s.resultEnding.id);
        }
        if (s.result === 'victory') {
          if (!this.gameState.history.unlockedAchievements.includes('ach_reverse_boss_win')) {
            this.gameState.history.unlockedAchievements.push('ach_reverse_boss_win');
          }
        }
        this.gameState.savePersistentData();
        this.gameState.notify();
      }

      setTimeout(() => {
        const isWin = s.result === 'victory';
        const msg = isWin
          ? `🏆【阎王铁腕·大获全胜】\n\n成功逮捕 ${s.caughtCount} 名员工！今晚大会议室座无虚席！\n已解锁新结局【${s.resultEnding?.title}】及新成就【阎王铁腕】！`
          : `💔【独守空房·打工人的胜利】\n\n18:05已过，未能阻挡员工下班潮！整座大厦已空无一人！\n已解锁结局【${s.resultEnding?.title}】！`;
        alert(msg);
      }, 300);
    }
  }
}
