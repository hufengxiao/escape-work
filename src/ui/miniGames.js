/**
 * Workplace Mini-Games UI Component:
 * 1. 职场黑话大乱斗 (Buzzword Battle)
 * 2. 微信群红包排雷 (Red Packet Minefield)
 * 3. 18:00 完美打卡停表 QTE (Clock-Out QTE)
 */

import { BUZZWORDS, BUZZWORD_PROMPTS } from '../data/buzzwords.js';
import { MiniGameRunner } from '../engine/miniGameRunner.js';
import { sound } from '../audio/sound.js';
import { toast } from './toast.js';

export class MiniGameUI {
  /**
   * 1. Buzzword Battle (职场黑话大乱斗)
   */
  static showBuzzwordBattle(state, engine, onComplete) {
    const prompt = BUZZWORD_PROMPTS[Math.floor(Math.random() * BUZZWORD_PROMPTS.length)];
    // Pick 6 random buzzwords
    const shuffled = [...BUZZWORDS].sort(() => Math.random() - 0.5);
    const options = shuffled.slice(0, 6);

    const overlay = document.createElement('div');
    overlay.className = 'modal-backdrop fade-in';
    overlay.id = 'buzzword-game-modal';

    const selectedIds = [];
    let timeLeft = 6;
    let timerId = null;

    overlay.innerHTML = `
      <div class="modal-card minigame-card slide-up">
        <div class="minigame-header">
          <div class="minigame-title-group">
            <span class="minigame-avatar">${prompt.bossAvatar}</span>
            <div>
              <h3 class="minigame-title">职场黑话大乱斗 · 降维对决</h3>
              <span class="minigame-sub">${prompt.bossTitle} 突击考核</span>
            </div>
          </div>
          <div class="minigame-timer-badge" id="bw-timer">⏳ 6s</div>
        </div>

        <div class="minigame-timer-bar-track">
          <div class="minigame-timer-bar-fill" id="bw-timer-fill" style="width: 100%"></div>
        </div>

        <div class="minigame-question-box">
          <p class="boss-question-text">${prompt.question}</p>
        </div>

        <div class="buzzword-sentence-preview" id="bw-sentence">
          <span class="placeholder-sentence">点击下方词牌，组装 3 块黑话进行降维对线...</span>
        </div>

        <div class="buzzword-chips-grid" id="bw-chips-grid">
          ${options
            .map(
              (bw) => `
            <button class="bw-chip" data-id="${bw.id}">
              <span class="bw-chip-text">${bw.text}</span>
            </button>
          `
            )
            .join('')}
        </div>

        <div class="minigame-footer">
          <button id="btn-submit-buzzword" class="btn btn-primary btn-block" disabled>
            🗣️ 掷地有声对线！(已选 0/3)
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const timerBadge = overlay.querySelector('#bw-timer');
    const timerFill = overlay.querySelector('#bw-timer-fill');
    const sentenceBox = overlay.querySelector('#bw-sentence');
    const submitBtn = overlay.querySelector('#btn-submit-buzzword');

    const updateSentence = () => {
      if (selectedIds.length === 0) {
        sentenceBox.innerHTML = `<span class="placeholder-sentence">点击下方词牌，组装 3 块黑话进行降维对线...</span>`;
        submitBtn.disabled = true;
        submitBtn.textContent = '🗣️ 掷地有声对线！(已选 0/3)';
      } else {
        const words = selectedIds.map((id) => options.find((o) => o.id === id)?.text).filter(Boolean);
        sentenceBox.innerHTML = `<span class="formed-sentence">“我们通过 <strong>${words.join(
          '</strong>，打通 <strong>'
        )}</strong>，形成全矩阵赋能！”</span>`;
        submitBtn.disabled = selectedIds.length < 3;
        submitBtn.textContent = `🗣️ 掷地有声对线！(已选 ${selectedIds.length}/3)`;
      }
    };

    const finishGame = () => {
      clearInterval(timerId);
      const evalResult = MiniGameRunner.evaluateBuzzwordBattle(selectedIds, state.selectedRoleId);

      if (evalResult.suspicionDelta) {
        state.suspicion = Math.max(0, Math.min(100, state.suspicion + evalResult.suspicionDelta));
      }
      if (evalResult.energyDelta) {
        state.energy = Math.max(0, Math.min(100, state.energy + evalResult.energyDelta));
      }

      state.addLog(evalResult.msg, evalResult.grade === 'VICTORY' ? 'achievement' : 'alert');

      const isWin = evalResult.grade === 'VICTORY';
      if (isWin) {
        sound.playSuccess();
        toast.show(evalResult.msg, 'success', 3000);
      } else {
        sound.playAlert();
        toast.show(evalResult.msg, 'alert', 3000);
      }

      const words = selectedIds.map((id) => options.find((o) => o.id === id)?.text).filter(Boolean);
      const quoteText = words.length > 0
        ? `“我们通过 <strong>${words.join('</strong>，打通 <strong>')}</strong>，形成全矩阵赋能！”`
        : '“……（对线超时，支支吾吾未能成句）”';

      // Dedicated Settlement Card Overlay
      const card = overlay.querySelector('.minigame-card');
      const settleEl = document.createElement('div');
      settleEl.className = 'settlement-overlay minigame-settlement-overlay slide-up';
      settleEl.innerHTML = `
        <div class="settlement-card-inner">
          <div>
            <span class="settlement-stamp-badge ${isWin ? 'stamp-win' : 'stamp-lose'}">
              ${isWin ? '🏆 降维打击达成 (VICTORY)' : '⚠️ 逻辑露怯崩塌 (FAIL)'}
            </span>
          </div>

          <div class="settlement-icon">${isWin ? '🗣️' : '😵'}</div>
          <h3 class="settlement-title">${isWin ? '气场全开 · 震撼全场！' : '词锋不逮 · 考核失利'}</h3>

          <div class="res-quote-box">
            <span class="res-quote-label" style="font-size:10.5px;color:#94a3b8;font-weight:700;">🗣️ 发言实录：</span>
            <div style="margin-top:2px;">${quoteText}</div>
          </div>

          <div class="settle-stats-grid">
            <div class="settle-stat-item">
              <span class="settle-stat-label">对线评分</span>
              <strong class="settle-stat-val ${isWin ? 'text-success' : 'text-danger'}">${evalResult.score} 分</strong>
            </div>
            <div class="settle-stat-item">
              <span class="settle-stat-label">考核判定</span>
              <strong class="settle-stat-val">${evalResult.grade}</strong>
            </div>
            <div class="settle-stat-item">
              <span class="settle-stat-label">摸鱼嫌疑</span>
              <strong class="settle-stat-val ${evalResult.suspicionDelta > 0 ? 'text-danger' : 'text-success'}">
                ${evalResult.suspicionDelta > 0 ? '+' : ''}${evalResult.suspicionDelta || 0}%
              </strong>
            </div>
            <div class="settle-stat-item">
              <span class="settle-stat-label">剩余体能</span>
              <strong class="settle-stat-val ${evalResult.energyDelta < 0 ? 'text-danger' : 'text-success'}">
                ${evalResult.energyDelta > 0 ? '+' : ''}${evalResult.energyDelta || 0}
              </strong>
            </div>
          </div>

          <div class="res-msg-box">${evalResult.msg}</div>

          <div class="settle-actions-row">
            <button id="btn-close-buzzword-settle" class="btn btn-primary" style="width:100%;">
              ✨ 确认对线战果 · 继续逃跑
            </button>
          </div>
        </div>
      `;
      card.appendChild(settleEl);

      settleEl.querySelector('#btn-close-buzzword-settle')?.addEventListener('click', () => {
        sound.playClick();
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        if (onComplete) onComplete(evalResult);
      });
    };

    // Countdown timer
    const startTime = Date.now();
    const duration = 6000;
    timerId = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remainingMs = Math.max(0, duration - elapsed);
      const sec = (remainingMs / 1000).toFixed(1);
      timerBadge.textContent = `⏳ ${sec}s`;
      timerFill.style.width = `${(remainingMs / duration) * 100}%`;

      if (remainingMs <= 0) {
        finishGame();
      }
    }, 100);

    // Chip click
    overlay.querySelectorAll('.bw-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        const id = chip.dataset.id;
        const idx = selectedIds.indexOf(id);
        sound.playClick();
        if (idx !== -1) {
          selectedIds.splice(idx, 1);
          chip.classList.remove('selected');
        } else if (selectedIds.length < 3) {
          selectedIds.push(id);
          chip.classList.add('selected');
        }
        updateSentence();
      });
    });

    submitBtn.addEventListener('click', () => {
      finishGame();
    });
  }

  /**
   * 2. Red Packet Minefield (微信群红包排雷)
   */
  static showRedPacketModal(state, engine, onComplete) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-backdrop fade-in';
    overlay.id = 'redpacket-game-modal';

    let resolved = false;

    overlay.innerHTML = `
      <div class="modal-card minigame-card redpacket-modal-card slide-up">
        <div class="minigame-header">
          <div class="minigame-title-group">
            <span class="minigame-avatar">🧧</span>
            <div>
              <h3 class="minigame-title">全员群攻坚红包 · 避雷排查</h3>
              <span class="minigame-sub">大Boss阎总 在大群发送了拼手气红包！</span>
            </div>
          </div>
        </div>

        <p class="redpacket-prompt-text">
          大群消息炸开！手快抢到 0.01 元大概率被抓壮丁值班，掐表垫后捡漏更安全，还是按兵不动？
        </p>

        <div class="redpackets-grid">
          <div class="packet-item" data-choice="first">
            <div class="packet-envelope pulse-bounce">🧧</div>
            <strong class="packet-label">头彩抢先</strong>
            <span class="packet-sub">70% 毒雷 / 30% 暴富</span>
          </div>
          <div class="packet-item" data-choice="last">
            <div class="packet-envelope pulse-bounce-delay">🧧</div>
            <strong class="packet-label">掐表垫后</strong>
            <span class="packet-sub">80% 稳妥捡漏</span>
          </div>
        </div>

        <div class="minigame-footer">
          <button id="btn-skip-packet" class="btn btn-ghost btn-block">
            🧘 忍住不抢 · 假装免打扰
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const resolveChoice = (type) => {
      if (resolved) return;
      resolved = true;

      const ahWeiRel = state.npcRelations?.ah_wei?.favorability ?? 40;
      const result = MiniGameRunner.resolveRedPacketChoice(type, ahWeiRel);

      if (result.suspicionDelta) {
        state.suspicion = Math.max(0, Math.min(100, state.suspicion + result.suspicionDelta));
      }
      if (result.energyDelta) {
        state.energy = Math.max(0, Math.min(100, state.energy + result.energyDelta));
      }

      state.addLog(result.msg, result.suspicionDelta > 0 ? 'alert' : 'item');

      if (result.suspicionDelta > 0) {
        sound.playAlert();
        toast.show(result.msg, 'alert', 3000);
      } else {
        sound.playSuccess();
        toast.show(result.msg, 'success', 3000);
      }

      const isJackpot = result.type === 'first_jackpot';
      const isPoison = result.type === 'first_poison';
      const isSafe = result.type === 'last_safe';
      const isSkipTagged = result.type === 'skip_tagged';

      let stampText = '🍵 稳健落袋';
      let stampCls = 'stamp-win';
      let icon = '🧧';
      let title = '红包开启结算';

      if (isJackpot) {
        stampText = '💰 欧皇降临';
        stampCls = 'stamp-win';
        icon = '🤑';
        title = '手气最佳 · 暴富加持！';
      } else if (isPoison) {
        stampText = '💣 踩中地雷';
        stampCls = 'stamp-lose';
        icon = '😱';
        title = '惨遭抓包 · 0.01元毒雷！';
      } else if (isSafe) {
        stampText = '🍵 掐表垫后';
        stampCls = 'stamp-win';
        icon = '☕';
        title = '稳健捡漏 · 安全避雷！';
      } else if (isSkipTagged) {
        stampText = '😨 点名抓壮丁';
        stampCls = 'stamp-lose';
        icon = '🤦';
        title = '人在家中坐 · 锅从天上来！';
      } else {
        stampText = '🧘 佛系免打扰';
        stampCls = 'stamp-lose';
        icon = '🧘';
        title = '心如止水 · 假装免打扰！';
      }

      const card = overlay.querySelector('.modal-card');
      const settleEl = document.createElement('div');
      settleEl.className = 'settlement-overlay redpacket-settlement-overlay slide-up';
      settleEl.innerHTML = `
        <div class="settlement-card-inner">
          <div>
            <span class="settlement-stamp-badge ${stampCls}">
              ${stampText}
            </span>
          </div>

          <div class="settlement-icon">${icon}</div>
          <h3 class="settlement-title">${title}</h3>

          <div class="rp-amount-display" style="font-size:24px;font-weight:900;color:#fbbf24;margin:4px 0;">
            ${result.amount > 0 ? `¥${result.amount.toFixed(2)}` : '¥0.00'}
          </div>

          <div class="settle-stats-grid">
            <div class="settle-stat-item">
              <span class="settle-stat-label">摸鱼嫌疑变动</span>
              <strong class="settle-stat-val ${result.suspicionDelta > 0 ? 'text-danger' : 'text-success'}">
                ${result.suspicionDelta > 0 ? '+' : ''}${result.suspicionDelta || 0}%
              </strong>
            </div>
            <div class="settle-stat-item">
              <span class="settle-stat-label">体能恢复变动</span>
              <strong class="settle-stat-val ${result.energyDelta < 0 ? 'text-danger' : 'text-success'}">
                ${result.energyDelta > 0 ? '+' : ''}${result.energyDelta || 0}
              </strong>
            </div>
          </div>

          <div class="res-msg-box">${result.msg}</div>

          <div class="settle-actions-row">
            <button id="btn-close-rp-settle" class="btn btn-primary" style="width:100%;">
              👌 收下战果 · 继续溜走
            </button>
          </div>
        </div>
      `;
      card.appendChild(settleEl);

      settleEl.querySelector('#btn-close-rp-settle')?.addEventListener('click', () => {
        sound.playClick();
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        if (onComplete) onComplete(result);
      });
    };

    overlay.querySelectorAll('.packet-item').forEach((item) => {
      item.addEventListener('click', () => {
        sound.playClick();
        resolveChoice(item.dataset.choice);
      });
    });

    overlay.querySelector('#btn-skip-packet').addEventListener('click', () => {
      sound.playClick();
      resolveChoice('skip');
    });
  }

  /**
   * 3. 18:00 Clock-Out QTE (停表压线打卡)
   */
  static showClockOutQTE(state, engine, onComplete) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-backdrop fade-in';
    overlay.id = 'qte-clockout-modal';

    overlay.innerHTML = `
      <div class="modal-card minigame-card qte-modal-card slide-up">
        <div class="minigame-header">
          <div class="minigame-title-group">
            <span class="minigame-avatar">⏱️</span>
            <div>
              <h3 class="minigame-title">18:00 完美压线打卡 · 毫秒决胜</h3>
              <span class="minigame-sub">精准定格在 18:00:00.000 触发神仙准点判定！</span>
            </div>
          </div>
        </div>

        <div class="qte-clock-screen">
          <div class="qte-clock-label">闸机人脸识别终端实时时钟</div>
          <div class="qte-digital-time" id="qte-digital-time">17:59:58.200</div>
          <div class="qte-target-line">🎯 目标: 18:00:00.000 (窗口 -200ms ~ +500ms)</div>
        </div>

        <div class="qte-action-area">
          <button id="btn-qte-punch" class="btn-giant-punch">
            🔘 立即刷脸打卡！
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const digitalEl = overlay.querySelector('#qte-digital-time');
    const punchBtn = overlay.querySelector('#btn-qte-punch');

    // Simulate clock scrolling smoothly from 17:59:58.000 towards 18:00:03.000
    const startVirtualMs = 17 * 3600000 + 59 * 60000 + 58000;
    const targetVirtualMs = 18 * 3600000; // 18:00:00
    const startRealTime = performance.now();
    let animId = null;
    let isStopped = false;

    const formatMsTime = (totalMs) => {
      const h = Math.floor(totalMs / 3600000);
      const m = Math.floor((totalMs % 3600000) / 60000);
      const s = Math.floor((totalMs % 60000) / 1000);
      const ms = Math.floor(totalMs % 1000);
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(
        2,
        '0'
      )}.${String(ms).padStart(3, '0')}`;
    };

    const onPunch = (capturedVirtualMs) => {
      if (isStopped) return;
      isStopped = true;
      cancelAnimationFrame(animId);

      const result = MiniGameRunner.evaluateClockOutQTE(targetVirtualMs, capturedVirtualMs);
      digitalEl.textContent = formatMsTime(capturedVirtualMs);

      if (result.grade === 'PERFECT') {
        digitalEl.style.color = '#10b981';
        digitalEl.classList.add('glow-perfect');
        sound.playSuccess();
        toast.show(result.msg, 'success', 3500);
      } else if (result.grade === 'EARLY') {
        digitalEl.style.color = '#ef4444';
        sound.playAlert();
        toast.show(result.msg, 'alert', 3500);
      } else {
        digitalEl.style.color = '#f59e0b';
        sound.playFail();
        toast.show(result.msg, 'warning', 3500);
      }

      punchBtn.disabled = true;
      punchBtn.textContent = result.grade === 'PERFECT' ? '🌟 完美打卡达成！' : '⚠️ 打卡已定格';

      if (result.suspicionDelta) {
        state.suspicion = Math.max(0, Math.min(100, state.suspicion + result.suspicionDelta));
      }

      state.addLog(result.msg, result.grade === 'PERFECT' ? 'achievement' : 'alert');

      // Attendance Slip Receipt Overlay
      const isPerf = result.grade === 'PERFECT';
      const isEarly = result.grade === 'EARLY';

      const card = overlay.querySelector('.modal-card');
      const settleEl = document.createElement('div');
      settleEl.className = 'settlement-overlay qte-settlement-overlay slide-up';
      settleEl.innerHTML = `
        <div class="settlement-card-inner">
          <div class="qte-receipt-paper">
            <div class="receipt-header-row">
              <span>🏢 宏图科技智能终端</span>
              <span>考勤凭条小票</span>
            </div>

            <div class="receipt-time-center">
              <span style="font-size:10px;color:#64748b;display:block;">考勤定格时刻</span>
              <strong class="rcpt-clock-large">${digitalEl.textContent}</strong>
              <span class="rcpt-offset-badge">
                精确误差: ${result.diffMs > 0 ? '+' : ''}${result.diffMs} ms
              </span>
            </div>

            <div style="text-align:center;">
              <span class="rcpt-stamp ${isPerf ? 'stamp-perfect' : isEarly ? 'stamp-early' : 'stamp-late'}">
                ${isPerf ? '🌟 准点神仙' : isEarly ? '⚠️ 提早早退' : '🐢 晚点迟疑'}
              </span>
            </div>

            <div class="receipt-header-row" style="border-top:1px dashed #94a3b8;border-bottom:none;padding-top:6px;margin-top:2px;">
              <span>考勤判定: <strong>${result.grade}</strong></span>
              <span>嫌疑度: <strong style="color:${result.suspicionDelta > 0 ? '#dc2626' : '#059669'}">${result.suspicionDelta > 0 ? '+' : ''}${result.suspicionDelta || 0}%</strong></span>
            </div>

            <div class="rcpt-footer-dashed">
              ${result.msg}
            </div>
          </div>

          <div class="settle-actions-row">
            <button id="btn-close-qte-settle" class="btn btn-primary" style="width:100%;">
              🏃 撕下打卡单 · 潇洒开溜！
            </button>
          </div>
        </div>
      `;
      card.appendChild(settleEl);

      settleEl.querySelector('#btn-close-qte-settle')?.addEventListener('click', () => {
        sound.playClick();
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        if (onComplete) onComplete(result);
      });
    };

    const updateLoop = () => {
      if (isStopped) return;
      const elapsedReal = performance.now() - startRealTime;
      // 1 real ms advances 1.35 virtual ms
      const currentVirtualMs = startVirtualMs + elapsedReal * 1.35;
      digitalEl.textContent = formatMsTime(currentVirtualMs);

      if (currentVirtualMs > targetVirtualMs + 3000) {
        // Auto-trigger if missed
        onPunch(currentVirtualMs);
        return;
      }

      animId = requestAnimationFrame(updateLoop);
    };

    punchBtn.addEventListener('click', () => {
      const elapsedReal = performance.now() - startRealTime;
      const currentVirtualMs = startVirtualMs + elapsedReal * 1.35;
      onPunch(currentVirtualMs);
    });

    animId = requestAnimationFrame(updateLoop);
  }
}
