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
    this.outcomeShown = false;
  }

  show() {
    this.hide();
    this.outcomeShown = false;
    this.engine.reset();

    const overlay = document.createElement('div');
    overlay.className = 'modal-backdrop active reverse-boss-modal';
    overlay.id = 'reverse-boss-modal';

    overlay.innerHTML = `
      <div class="modal-card reverse-boss-card slide-up">
        <div class="modal-header boss-modal-header">
          <div class="modal-title-group">
            <span class="modal-icon">👑</span>
            <div>
              <h3 class="modal-title">阎总的一天：逮捕准点逃兵</h3>
              <span class="modal-subtitle">角色反转模式 · 18:05 前阻截至少 3 名员工通宵加班</span>
            </div>
          </div>
          <button class="modal-close-btn" id="btn-close-reverse-boss" aria-label="关闭">&times;</button>
        </div>

        <div class="modal-body boss-modal-body">
          <!-- Top Stats HUD -->
          <div class="reverse-hud-grid">
            <div class="hud-stat-cell">
              <span class="hud-cell-label">当前时刻</span>
              <span id="boss-time" class="hud-cell-val val-time">17:45</span>
            </div>
            <div class="hud-stat-cell">
              <span class="hud-cell-label">阎总威严值</span>
              <span id="boss-majesty" class="hud-cell-val val-majesty">100 / 100</span>
            </div>
            <div class="hud-stat-cell">
              <span class="hud-cell-label">抓捕战果</span>
              <span id="boss-caught-score" class="hud-cell-val val-caught">🎯 0 / 3</span>
            </div>
          </div>

          <!-- Current Location Bar -->
          <div class="boss-location-bar">
            <div class="location-bar-left">
              <span class="loc-pin">📍</span>
              <span class="loc-label">当前巡查位置：</span>
              <strong id="boss-current-area" class="loc-name">19楼总裁办</strong>
            </div>
            <span id="boss-escaped-count" class="escaped-badge">🏃 已逃离: 0 / 3</span>
          </div>

          <!-- Employee Tracker -->
          <div class="boss-tracker-panel">
            <div class="tracker-header">
              <span class="tracker-title">🎯 重点盯防员工动向</span>
              <span class="tracker-hint">每回合向 1 楼大堂逃窜</span>
            </div>
            <div id="boss-employee-list" class="tracker-list-grid">
              <!-- Employee items inserted here -->
            </div>
          </div>

          <!-- Boss Skills -->
          <div class="boss-skills-panel">
            <div class="skills-panel-title">🔥 阎总专属管理权术</div>
            <div class="skills-btn-grid">
              <button id="btn-boss-deadly-at" class="skill-btn">
                <div class="skill-name">📢 夺命艾特</div>
                <div class="skill-cost">群发红包全员定身 (-20)</div>
              </button>
              <button id="btn-boss-raid" class="skill-btn">
                <div class="skill-name">🦅 突击查岗</div>
                <div class="skill-cost">搜查本区识破伪装 (-15)</div>
              </button>
              <button id="btn-boss-lift-ambush" class="skill-btn">
                <div class="skill-name">🛗 专梯伏击</div>
                <div class="skill-cost">直降1楼大堂截门 (-30)</div>
              </button>
            </div>
          </div>

          <!-- Movement Navigation -->
          <div class="boss-move-panel">
            <div class="move-panel-title">🚶 巡查移动（消耗 5 威严）</div>
            <div id="boss-move-grid" class="move-btn-grid">
              <!-- Dynamic area move buttons -->
            </div>
          </div>

          <!-- Action Log Terminal -->
          <div class="boss-log-box">
            <div class="log-box-header">📋 抓捕行动简报</div>
            <div id="boss-logs" class="boss-logs-scroll"></div>
          </div>
        </div>

        <div class="modal-footer boss-modal-footer">
          <span class="footer-note">准点下班大作战 · 阎总反转DLC (v3.0.0)</span>
          <div class="footer-actions">
            <button id="btn-boss-restart" class="btn btn-secondary" style="padding:6px 14px; font-size:12px;">重置本局</button>
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

    this.container.querySelector('#btn-close-reverse-boss')?.addEventListener('click', () => {
      this.hide();
    });

    this.container.querySelector('#btn-boss-restart')?.addEventListener('click', () => {
      this.outcomeShown = false;
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
          let badge = `<span class="emp-status-badge status-moving">📍 ${emp.area}</span>`;
          if (isCaught) badge = `<span class="emp-status-badge status-caught">🔒 已逮捕加班</span>`;
          if (isEscaped) badge = `<span class="emp-status-badge status-escaped">💨 已逃离大厦</span>`;

          return `
            <div class="emp-tracker-card ${isCaught ? 'caught' : ''} ${isEscaped ? 'escaped' : ''}">
              <span class="emp-name">${emp.name}</span>
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
          <button class="area-move-btn ${isCurrent ? 'current' : ''}" 
                  data-area="${area.name}" 
                  ${isCurrent || s.isFinished ? 'disabled' : ''}>
            ${isCurrent ? '📍 ' : ''}${area.name}
          </button>
        `;
      }).join('');

      moveGrid.querySelectorAll('.area-move-btn').forEach((btn) => {
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
          let cls = 'log-default';
          if (log.type === 'catch') cls = 'log-catch';
          if (log.type === 'escape') cls = 'log-escape';
          if (log.type === 'skill') cls = 'log-skill';
          if (log.type === 'victory') cls = 'log-win';
          if (log.type === 'defeat') cls = 'log-lose';
          return `<div class="boss-log-row ${cls}"><span class="log-time">[${log.time}]</span> <span class="log-msg">${log.text}</span></div>`;
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
