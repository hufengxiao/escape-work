/**
 * Overtime Nightmare UI View: 《周五深夜大逃杀》
 */

import { OvertimeEngine } from '../engine/overtimeEngine.js';
import { OVERTIME_ACTIONS } from '../data/overtimeEvents.js';

export class OvertimeView {
  constructor(gameState, onFinishCallback = null) {
    this.gameState = gameState;
    this.engine = new OvertimeEngine();
    this.onFinishCallback = onFinishCallback;
    this.container = null;
    this.outcomeShown = false;
  }

  show() {
    this.hide();
    this.outcomeShown = false;
    this.engine.reset();

    const overlay = document.createElement('div');
    overlay.className = 'modal-backdrop active overtime-modal';
    overlay.id = 'overtime-modal';

    overlay.innerHTML = `
      <div class="modal-card overtime-card" style="max-width: 600px; width: 94%;">
        <div class="modal-header" style="background: linear-gradient(135deg, #09090b, #1e1b4b); border-bottom: 2px solid #4338ca;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:24px;">🌙</span>
            <div>
              <div style="font-weight:bold; font-size:16px; color:#f8fafc;">周五深夜大逃杀：绝地熬夜生存</div>
              <div style="font-size:12px; color:#a5b4fc;">无尽附加关 · 从 20:00 熬至明晨 06:00 破晓</div>
            </div>
          </div>
          <button class="modal-close" id="btn-close-overtime" style="color:#c7d2fe;">✕</button>
        </div>

        <div class="modal-body" style="padding: 16px; display:flex; flex-direction:column; gap:12px;">
          <!-- Time & Turn Progress -->
          <div style="display:flex; justify-content:space-between; align-items:center; background:#0f172a; padding:10px 14px; border-radius:8px; border:1px solid #312e81;">
            <div>
              <span style="color:#94a3b8; font-size:12px;">当前时刻：</span>
              <strong id="ot-clock" style="font-size:20px; color:#818cf8; font-family:monospace;">20:00</strong>
            </div>
            <div style="text-align:right;">
              <span style="color:#94a3b8; font-size:12px;">破晓进度：</span>
              <span id="ot-progress" style="color:#cbd5e1; font-weight:bold; font-size:13px;">0 / 20 回合</span>
            </div>
          </div>

          <!-- Triple Survival Meters -->
          <div style="display:flex; flex-direction:column; gap:8px; background:rgba(0,0,0,0.3); padding:10px; border-radius:8px; border:1px solid #1e293b;">
            <!-- Sanity -->
            <div>
              <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:3px;">
                <span style="color:#38bdf8;">🧠 清醒值 (Sanity)</span>
                <span id="ot-sanity-val" style="color:#38bdf8; font-weight:bold;">100%</span>
              </div>
              <div style="height:8px; background:#1e293b; border-radius:4px; overflow:hidden;">
                <div id="ot-sanity-bar" style="width:100%; height:100%; background:#0284c7; transition:width 0.3s;"></div>
              </div>
            </div>

            <!-- Energy -->
            <div>
              <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:3px;">
                <span style="color:#4ade80;">⚡ 体能值 (Energy)</span>
                <span id="ot-energy-val" style="color:#4ade80; font-weight:bold;">100%</span>
              </div>
              <div style="height:8px; background:#1e293b; border-radius:4px; overflow:hidden;">
                <div id="ot-energy-bar" style="width:100%; height:100%; background:#16a34a; transition:width 0.3s;"></div>
              </div>
            </div>

            <!-- Presence with Safe Zone 20-60% -->
            <div>
              <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:3px;">
                <span style="color:#fbbf24;">👁️ 存在感 (Presence · 需保持 20%~60%)</span>
                <span id="ot-presence-val" style="color:#fbbf24; font-weight:bold;">40% (🟢 安全)</span>
              </div>
              <div style="position:relative; height:10px; background:#1e293b; border-radius:5px; overflow:hidden;">
                <!-- Highlight Safe Zone: 20% to 60% -->
                <div style="position:absolute; left:20%; width:40%; height:100%; background:rgba(34, 197, 94, 0.25); border-left:1px dashed #22c55e; border-right:1px dashed #22c55e;"></div>
                <div id="ot-presence-bar" style="width:40%; height:100%; background:#eab308; transition:width 0.3s;"></div>
              </div>
            </div>
          </div>

          <!-- Tactical Action Buttons -->
          <div>
            <div style="font-size:12px; font-weight:bold; color:#cbd5e1; margin-bottom:6px;">🛠️ 深夜熬会自救对策</div>
            <div id="ot-actions-grid" style="display:grid; grid-template-columns: 1fr 1fr; gap:6px;">
              ${OVERTIME_ACTIONS.map(
                (act) => `
                <button class="action-btn ot-act-btn" data-act="${act.id}" style="text-align:left; padding:8px 10px; background:#1e1b4b; border-color:#4338ca; font-size:12px;">
                  <div style="font-weight:bold; color:#e0e7ff;">${act.name}</div>
                  <div style="font-size:10px; color:#a5b4fc;">${act.desc}</div>
                </button>
              `
              ).join('')}
            </div>
          </div>

          <!-- Narrative Log Terminal -->
          <div id="ot-logs" style="height: 120px; overflow-y:auto; background:#020617; border:1px solid #1e1b4b; border-radius:6px; padding:8px; font-family: monospace; font-size:11px; color:#e2e8f0; display:flex; flex-direction:column; gap:4px;">
          </div>
        </div>

        <div class="modal-footer" style="padding:10px 16px; display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:11px; color:#64748b;">准点下班大作战 · 绝地求生DLC</span>
          <button id="btn-ot-restart" class="secondary-btn" style="padding:4px 12px; font-size:12px;">重新挑战</button>
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

    this.container.querySelector('#btn-close-overtime')?.addEventListener('click', () => {
      this.hide();
    });

    this.container.querySelector('#btn-ot-restart')?.addEventListener('click', () => {
      this.outcomeShown = false;
      this.engine.reset();
      this.render();
    });

    this.container.querySelectorAll('.ot-act-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const actId = e.currentTarget.getAttribute('data-act');
        this.engine.performAction(actId);
        this.render();
      });
    });
  }

  render() {
    if (!this.container) return;

    const s = this.engine.getState();

    // 1. Time & Turn
    const clockEl = this.container.querySelector('#ot-clock');
    if (clockEl) clockEl.textContent = s.time;

    const progEl = this.container.querySelector('#ot-progress');
    if (progEl) progEl.textContent = `${s.turn} / ${s.maxTurns} 回合`;

    // 2. Meters
    const sanityVal = this.container.querySelector('#ot-sanity-val');
    const sanityBar = this.container.querySelector('#ot-sanity-bar');
    if (sanityVal) sanityVal.textContent = `${s.sanity}%`;
    if (sanityBar) sanityBar.style.width = `${s.sanity}%`;

    const energyVal = this.container.querySelector('#ot-energy-val');
    const energyBar = this.container.querySelector('#ot-energy-bar');
    if (energyVal) energyVal.textContent = `${s.energy}%`;
    if (energyBar) energyBar.style.width = `${s.energy}%`;

    const presenceVal = this.container.querySelector('#ot-presence-val');
    const presenceBar = this.container.querySelector('#ot-presence-bar');
    if (presenceVal) {
      let statusText = '🟢 安全';
      let color = '#22c55e';
      if (s.presence < 20) {
        statusText = '🔴 极低危险 (易被抓包)';
        color = '#ef4444';
      } else if (s.presence > 60) {
        statusText = '⚠️ 极高危险 (接盘重活)';
        color = '#f97316';
      }
      presenceVal.innerHTML = `<span style="color:${color}; font-weight:bold;">${s.presence}% (${statusText})</span>`;
    }
    if (presenceBar) {
      presenceBar.style.width = `${s.presence}%`;
      if (s.presence < 20 || s.presence > 60) {
        presenceBar.style.background = '#ef4444';
      } else {
        presenceBar.style.background = '#22c55e';
      }
    }

    // 3. Disable buttons if finished
    this.container.querySelectorAll('.ot-act-btn').forEach((btn) => {
      btn.disabled = s.isFinished;
    });

    // 4. Logs
    const logBox = this.container.querySelector('#ot-logs');
    if (logBox) {
      logBox.innerHTML = s.logs
        .map((log) => {
          let color = '#94a3b8';
          if (log.type === 'action') color = '#a5b4fc';
          if (log.type === 'warning') color = '#fbbf24';
          if (log.type === 'event') color = '#f472b6';
          if (log.type === 'victory') color = '#38bdf8';
          if (log.type === 'defeat') color = '#f87171';
          return `<div><span style="color:#64748b;">[${log.time}]</span> <span style="color:${color};">${log.text}</span></div>`;
        })
        .join('');
      logBox.scrollTop = logBox.scrollHeight;
    }

    // 5. Outcome
    if (s.isFinished && !this.outcomeShown) {
      this.outcomeShown = true;
      if (this.gameState && s.resultEnding) {
        if (!this.gameState.history.unlockedEndings.includes(s.resultEnding.id)) {
          this.gameState.history.unlockedEndings.push(s.resultEnding.id);
        }
        if (s.result === 'victory') {
          if (!this.gameState.history.unlockedAchievements.includes('ach_overtime_god')) {
            this.gameState.history.unlockedAchievements.push('ach_overtime_god');
          }
        }
        this.gameState.savePersistentData();
        this.gameState.notify();
      }

      setTimeout(() => {
        const isWin = s.result === 'victory';
        const msg = isWin
          ? `🌅【职场不灭战神·晨曦破晓】\n\n你成功熬过整整 10 小时通宵闭门会！迎着清晨06:00的第一缕朝阳出逃！\n已解锁传说结局【${s.resultEnding?.title}】及新成就【晨曦不灭战神】！`
          : `💔【深夜大逃杀出局】\n\n${s.defeatReason}\n已解锁结局【${s.resultEnding?.title}】！`;
        alert(msg);
      }, 300);
    }
  }
}
