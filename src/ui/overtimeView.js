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
      <div class="modal-card overtime-card slide-up">
        <div class="modal-header ot-modal-header">
          <div class="modal-title-group">
            <span class="modal-icon">🌙</span>
            <div>
              <h3 class="modal-title">周五深夜大逃杀：绝地熬夜生存</h3>
              <span class="modal-subtitle">无尽附加关 · 从 20:00 熬至明晨 06:00 破晓加冕</span>
            </div>
          </div>
          <button class="modal-close-btn" id="btn-close-overtime" aria-label="关闭">&times;</button>
        </div>

        <div class="modal-body ot-modal-body">
          <!-- Time & Turn Progress Banner -->
          <div class="ot-clock-banner">
            <div class="clock-banner-left">
              <span class="clock-label">当前时刻：</span>
              <strong id="ot-clock" class="clock-time">20:00</strong>
            </div>
            <div class="clock-banner-right">
              <span class="progress-label">破晓进度：</span>
              <span id="ot-progress" class="progress-val">0 / 20 回合</span>
            </div>
          </div>

          <!-- Triple Survival Meters -->
          <div class="ot-meters-card">
            <!-- Sanity -->
            <div class="meter-group">
              <div class="meter-head">
                <span class="meter-title title-sanity">🧠 清醒值 (Sanity)</span>
                <span id="ot-sanity-val" class="meter-num num-sanity">100%</span>
              </div>
              <div class="meter-track">
                <div id="ot-sanity-bar" class="meter-fill fill-sanity" style="width:100%;"></div>
              </div>
            </div>

            <!-- Energy -->
            <div class="meter-group">
              <div class="meter-head">
                <span class="meter-title title-energy">⚡ 体能值 (Energy)</span>
                <span id="ot-energy-val" class="meter-num num-energy">100%</span>
              </div>
              <div class="meter-track">
                <div id="ot-energy-bar" class="meter-fill fill-energy" style="width:100%;"></div>
              </div>
            </div>

            <!-- Presence with Safe Zone 20-60% -->
            <div class="meter-group">
              <div class="meter-head">
                <span class="meter-title title-presence">👁️ 存在感 (Presence · 需保持 20%~60%)</span>
                <span id="ot-presence-val" class="meter-num num-presence">40% (🟢 安全)</span>
              </div>
              <div class="meter-track track-presence">
                <!-- Highlight Safe Zone: 20% to 60% -->
                <div class="presence-safe-zone"></div>
                <div id="ot-presence-bar" class="meter-fill fill-presence" style="width:40%;"></div>
              </div>
            </div>
          </div>

          <!-- Tactical Action Buttons -->
          <div class="ot-actions-section">
            <div class="actions-section-title">🛠️ 深夜熬会自救对策</div>
            <div id="ot-actions-grid" class="ot-actions-grid">
              ${OVERTIME_ACTIONS.map(
                (act) => `
                <button class="action-btn ot-act-btn" data-act="${act.id}">
                  <div class="ot-act-name">${act.name}</div>
                  <div class="ot-act-desc">${act.desc}</div>
                </button>
              `
              ).join('')}
            </div>
          </div>

          <!-- Narrative Log Terminal -->
          <div class="ot-log-box">
            <div class="log-box-header">📜 会议室现场实况</div>
            <div id="ot-logs" class="ot-logs-scroll"></div>
          </div>
        </div>

        <div class="modal-footer ot-modal-footer">
          <span class="footer-note">准点下班大作战 · 绝地求生DLC (v3.0.0)</span>
          <div class="footer-actions">
            <button id="btn-ot-restart" class="btn btn-secondary" style="padding:6px 14px; font-size:12px;">重新挑战</button>
          </div>
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
          let cls = 'log-default';
          if (log.type === 'action') cls = 'log-action';
          if (log.type === 'warning') cls = 'log-warn';
          if (log.type === 'event') cls = 'log-event';
          if (log.type === 'victory') cls = 'log-win';
          if (log.type === 'defeat') cls = 'log-lose';
          return `<div class="ot-log-row ${cls}"><span class="log-time">[${log.time}]</span> <span class="log-msg">${log.text}</span></div>`;
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
