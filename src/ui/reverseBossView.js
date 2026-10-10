/**
 * Reverse Boss Mode UI View: 《阎总的一天：逮捕准点逃兵》
 */

import { ReverseBossEngine, BOSS_AREAS } from '../engine/reverseBossEngine.js';
import { toast } from './toast.js';
import { sound } from '../audio/sound.js';

const AREA_CONFIG = {
  'area_19_office': { icon: '👑', shortDesc: '监控大屏与专梯' },
  'area_18_desk': { icon: '💻', shortDesc: '键盘稀拉·收拾背包' },
  'area_18_corridor': { icon: '🏃', shortDesc: '核心走廊·匆忙脚步' },
  'area_18_pantry': { icon: '☕', shortDesc: '微波炉旁·密谋出逃' },
  'area_18_lift': { icon: '🛗', shortDesc: '客梯按键·焦虑开溜' },
  'area_1_lobby': { icon: '🏢', shortDesc: '人脸识别闸机出入口' }
};

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
              <h3 class="modal-title boss-title">阎总模式 · 逮捕准点逃兵</h3>
              <span class="modal-subtitle boss-subtitle">管理层视角 · 18:05 前阻截至少 3 名员工通宵加班</span>
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
              <button id="btn-boss-meeting" class="skill-btn">
                <div class="skill-name">⚡ 紧急拉会</div>
                <div class="skill-cost">全员定身暂停前进 (-25)</div>
              </button>
            </div>
          </div>

          <!-- Movement Navigation -->
          <div class="boss-move-panel">
            <div class="move-panel-title">
              <span>🚶 巡查移动选择</span>
              <span class="move-panel-subtitle">（每次移动消耗 5 威严值）</span>
            </div>
            <div id="boss-move-grid" class="move-btn-grid">
              <!-- Dynamic area move cards -->
            </div>
          </div>

          <!-- Action Log Terminal -->
          <div class="boss-log-box">
            <div class="log-box-header">
              <span class="log-header-title">📋 抓捕行动简报</span>
              <span class="log-header-badge">实时监控通报</span>
            </div>
            <div id="boss-logs" class="boss-logs-scroll"></div>
          </div>
        </div>

        <div class="modal-footer boss-modal-footer">
          <div class="boss-footer-status">
            <span class="boss-status-dot"></span>
            <span class="boss-status-text">抓捕目标：18:05 前阻截 ≥3 人</span>
          </div>
          <div class="footer-actions">
            <button id="btn-boss-restart" class="btn btn-secondary btn-restart-action">🔄 重置战局</button>
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
      this.restartGame();
    });

    this.container.querySelector('#btn-boss-deadly-at')?.addEventListener('click', () => {
      const res = this.engine.useSkillDeadlyAt();
      if (!res.success) {
        toast.show(res.message, 'warning', 2500);
        sound.playAlert();
      } else {
        sound.playDing();
      }
      this.render();
    });

    this.container.querySelector('#btn-boss-raid')?.addEventListener('click', () => {
      const res = this.engine.useSkillRaidInspection();
      if (!res.success) {
        toast.show(res.message, 'warning', 2500);
        sound.playAlert();
      } else {
        sound.playDing();
      }
      this.render();
    });

    this.container.querySelector('#btn-boss-lift-ambush')?.addEventListener('click', () => {
      const res = this.engine.useSkillLiftAmbush();
      if (!res.success) {
        toast.show(res.message, 'warning', 2500);
        sound.playAlert();
      } else {
        sound.playDing();
      }
      this.render();
    });

    this.container.querySelector('#btn-boss-meeting')?.addEventListener('click', () => {
      const res = this.engine.useSkillEmergencyMeeting();
      if (!res.success) {
        toast.show(res.message, 'warning', 2500);
        sound.playAlert();
      } else {
        sound.playDing();
      }
      this.render();
    });
  }

  restartGame() {
    this.removeSettlementModal();
    this.outcomeShown = false;
    this.engine.reset();
    this.render();
  }

  removeSettlementModal() {
    const existing = this.container?.querySelector('.boss-settlement-overlay');
    if (existing) existing.remove();
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

    // 3. Move Grid - Beautified tactical cards
    const moveGrid = this.container.querySelector('#boss-move-grid');
    if (moveGrid) {
      moveGrid.innerHTML = BOSS_AREAS.map((area) => {
        const isCurrent = area.name === s.currentArea;
        const cfg = AREA_CONFIG[area.id] || { icon: '📍', shortDesc: area.desc };

        // Real-time intel: count active employees in this area
        const empsHere = s.employees.filter((emp) => {
          const isCaught = s.caughtEmployees.some((c) => c.id === emp.id);
          const isEscaped = s.escapedEmployees.some((e) => e.id === emp.id);
          return !isCaught && !isEscaped && emp.area === area.name;
        });

        let statusBadge = '';
        if (isCurrent) {
          statusBadge = `<span class="area-status-pill pill-current">📍 阎总坐镇</span>`;
        } else if (empsHere.length > 0) {
          statusBadge = `<span class="area-status-pill pill-threat">🚨 发现 ${empsHere.length} 人</span>`;
        } else {
          statusBadge = `<span class="area-status-pill pill-calm">暂无异动</span>`;
        }

        return `
          <button class="boss-area-card ${isCurrent ? 'is-current' : ''} ${empsHere.length > 0 ? 'has-threat' : ''}" 
                  data-area="${area.name}" 
                  ${isCurrent || s.isFinished ? 'disabled' : ''}
                  aria-label="巡查前往${area.name}">
            <div class="area-card-top">
              <div class="area-card-meta">
                <span class="area-icon">${cfg.icon}</span>
                <span class="area-floor-tag">F${area.floor}</span>
              </div>
              ${statusBadge}
            </div>
            <div class="area-card-main">
              <strong class="area-name-text">${area.name}</strong>
              <span class="area-desc-text">${cfg.shortDesc}</span>
            </div>
            <div class="area-card-bot">
              ${isCurrent 
                ? '<span class="area-action-text current-text">当前巡查中</span>' 
                : '<span class="area-action-text cost-text">⚡ 消耗 5 威严</span>'}
            </div>
          </button>
        `;
      }).join('');

      moveGrid.querySelectorAll('.boss-area-card').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          sound.playClick();
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

    // 5. Finished outcome settlement screen (Replacing alert)
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

      const isWin = s.result === 'victory';
      if (isWin) {
        sound.playSuccess();
      } else {
        sound.playFail();
      }

      this.showSettlementModal(s, isWin);
    }
  }

  showSettlementModal(s, isWin) {
    this.removeSettlementModal();

    const overlay = document.createElement('div');
    overlay.className = 'settlement-overlay boss-settlement-overlay slide-up';

    overlay.innerHTML = `
      <div class="settlement-card-inner">
        <!-- Rank Badge -->
        <div>
          <span class="settlement-stamp-badge ${isWin ? 'stamp-win' : 'stamp-lose'}">
            ${isWin ? '👑 SSS 级 · 阎王铁腕' : '💨 D 级 · 独守空房'}
          </span>
        </div>

        <div class="settlement-icon">${isWin ? '🏆' : '💔'}</div>
        <h2 class="settlement-title">${isWin ? '阎王铁腕 · 大获全胜！' : '独守空房 · 打工人的胜利！'}</h2>
        <p class="settlement-subtitle">
          ${isWin 
            ? `成功在 18:05 前逮捕 <strong>${s.caughtCount}</strong> 名准点逃兵！今晚大会议室座无虚席！` 
            : `18:05 时钟定格！员工潮冲破闸机，全楼灭灯，你只能独守空房！`}
        </p>

        <!-- Stats Grid -->
        <div class="settle-stats-grid">
          <div class="settle-stat-item">
            <span class="settle-stat-label">🎯 成功逮捕</span>
            <strong class="settle-stat-val ${isWin ? 'text-success' : ''}">${s.caughtCount} / ${s.targetCaught} 人</strong>
          </div>
          <div class="settle-stat-item">
            <span class="settle-stat-label">🏃 成功逃脱</span>
            <strong class="settle-stat-val ${s.escapedCount > 0 ? 'text-warning' : ''}">${s.escapedCount} / 3 人</strong>
          </div>
          <div class="settle-stat-item">
            <span class="settle-stat-label">👑 剩余威严</span>
            <strong class="settle-stat-val text-warning">${s.majesty} / 100</strong>
          </div>
          <div class="settle-stat-item">
            <span class="settle-stat-label">⏱️ 终局时刻</span>
            <strong class="settle-stat-val">${s.time}</strong>
          </div>
        </div>

        <!-- Employee Capture Roster -->
        <div class="settle-employees-box">
          <div class="settle-section-label">👥 员工去向总览</div>
          <div class="settle-emp-tags">
            ${s.employees.map((emp) => {
              const caught = s.caughtEmployees.some((c) => c.id === emp.id);
              const escaped = s.escapedEmployees.some((e) => e.id === emp.id);
              if (caught) {
                return `<span class="settle-emp-pill caught">🔒 ${emp.name} (${emp.role}) - 截获通宵</span>`;
              } else if (escaped) {
                return `<span class="settle-emp-pill escaped">💨 ${emp.name} (${emp.role}) - 逃脱大厦</span>`;
              } else {
                return `<span class="settle-emp-pill" style="background:rgba(148,163,184,0.15);color:#94a3b8;">❓ ${emp.name} (${emp.role})</span>`;
              }
            }).join('')}
          </div>
        </div>

        <!-- Unlocks Card -->
        <div class="settle-unlock-card">
          <div class="settle-unlock-row">
            <span class="settle-unlock-icon">📜</span>
            <div class="settle-unlock-info">
              <span class="settle-unlock-title">达成结局：【${s.resultEnding?.title || '普通结局'}】</span>
              <span class="settle-unlock-desc">${s.resultEnding?.summary || s.resultEnding?.description || '成功完成反转模式'}</span>
            </div>
          </div>
          ${isWin ? `
            <div class="settle-unlock-row" style="border-top:1px dashed rgba(255,255,255,0.1); padding-top:6px;">
              <span class="settle-unlock-icon">🏅</span>
              <div class="settle-unlock-info">
                <span class="settle-unlock-title">解锁成就：【阎王铁腕】</span>
                <span class="settle-unlock-desc">在反转模式中成功阻截至少 3 名准点逃兵回会议室加班</span>
              </div>
            </div>
          ` : ''}
        </div>

        <!-- Actions -->
        <div class="settle-actions-row">
          <button id="btn-settle-restart" class="btn btn-primary">🔄 重新执掌巡查</button>
          <button id="btn-settle-exit" class="btn btn-secondary">🚪 退出阎总视角</button>
        </div>
      </div>
    `;

    const card = this.container.querySelector('.modal-card');
    if (card) {
      card.appendChild(overlay);
    } else {
      this.container.appendChild(overlay);
    }

    overlay.querySelector('#btn-settle-restart')?.addEventListener('click', () => {
      sound.playClick();
      this.restartGame();
    });

    overlay.querySelector('#btn-settle-exit')?.addEventListener('click', () => {
      sound.playClick();
      this.hide();
      if (this.onFinishCallback) this.onFinishCallback();
    });
  }
}
