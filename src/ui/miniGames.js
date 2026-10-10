/**
 * Workplace Mini-Games UI Component:
 * 1. 职场黑话大乱斗 (Buzzword Battle)
 * 2. 微信群红包排雷 (Red Packet Minefield)
 * 3. 18:00 完美打卡停表 QTE (Clock-Out QTE)
 */

import { BUZZWORDS, BUZZWORD_PROMPTS } from '../data/buzzwords.js';
import { getRandomTaiChiScenario } from '../data/taichi.js';
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

      // Dedicated Settlement Card Overlay (Compact, fit without scrolling)
      const card = overlay.querySelector('.minigame-card');
      const settleEl = document.createElement('div');
      settleEl.className = 'settlement-overlay minigame-settlement-overlay slide-up';
      settleEl.innerHTML = `
        <div class="settlement-card-inner buzzword-settlement-inner">
          <div class="settle-compact-head">
            <span class="settle-compact-icon">${isWin ? '🗣️' : '😵'}</span>
            <div class="settle-compact-titles">
              <h3 class="settlement-title">${isWin ? '气场全开 · 震撼全场！' : '词锋不逮 · 考核失利'}</h3>
              <span class="settlement-stamp-badge ${isWin ? 'stamp-win' : 'stamp-lose'}">
                ${isWin ? '🏆 降维打击达成 (VICTORY)' : '⚠️ 逻辑露怯崩塌 (FAIL)'}
              </span>
            </div>
          </div>

          <div class="res-quote-box">
            <span class="res-quote-label" style="font-size:10px;color:#94a3b8;font-weight:700;">🗣️ 发言实录：</span>
            <div class="res-quote-text" style="margin-top:2px;font-size:11px;line-height:1.4;">${quoteText}</div>
          </div>

          <div class="settle-stats-bar">
            <div class="settle-stat-compact">
              <span class="settle-stat-label">对线评分</span>
              <strong class="settle-stat-val ${isWin ? 'text-success' : 'text-danger'}">${evalResult.score} 分</strong>
            </div>
            <div class="settle-stat-compact">
              <span class="settle-stat-label">考核判定</span>
              <strong class="settle-stat-val">${evalResult.grade}</strong>
            </div>
            <div class="settle-stat-compact">
              <span class="settle-stat-label">摸鱼嫌疑</span>
              <strong class="settle-stat-val ${evalResult.suspicionDelta > 0 ? 'text-danger' : 'text-success'}">
                ${evalResult.suspicionDelta > 0 ? '+' : ''}${evalResult.suspicionDelta || 0}%
              </strong>
            </div>
            <div class="settle-stat-compact">
              <span class="settle-stat-label">剩余体能</span>
              <strong class="settle-stat-val ${evalResult.energyDelta < 0 ? 'text-danger' : 'text-success'}">
                ${evalResult.energyDelta > 0 ? '+' : ''}${evalResult.energyDelta || 0}
              </strong>
            </div>
          </div>

          <div class="res-msg-box">${evalResult.msg}</div>

          <div class="settle-actions-row">
            <button id="btn-close-buzzword-settle" class="btn btn-primary btn-block">
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
        <div class="settlement-card-inner redpacket-settlement-inner">
          <div class="settle-compact-head">
            <span class="settle-compact-icon">${icon}</span>
            <div class="settle-compact-titles">
              <h3 class="settlement-title">${title}</h3>
              <span class="settlement-stamp-badge ${stampCls}">
                ${stampText}
              </span>
            </div>
          </div>

          <div class="rp-amount-display" style="font-size:22px;font-weight:900;color:#fbbf24;margin:4px 0;">
            ${result.amount > 0 ? `¥${result.amount.toFixed(2)}` : '¥0.00'}
          </div>

          <div class="settle-stats-bar" style="grid-template-columns: repeat(2, 1fr);">
            <div class="settle-stat-compact">
              <span class="settle-stat-label">摸鱼嫌疑变动</span>
              <strong class="settle-stat-val ${result.suspicionDelta > 0 ? 'text-danger' : 'text-success'}">
                ${result.suspicionDelta > 0 ? '+' : ''}${result.suspicionDelta || 0}%
              </strong>
            </div>
            <div class="settle-stat-compact">
              <span class="settle-stat-label">体能恢复变动</span>
              <strong class="settle-stat-val ${result.energyDelta < 0 ? 'text-danger' : 'text-success'}">
                ${result.energyDelta > 0 ? '+' : ''}${result.energyDelta || 0}
              </strong>
            </div>
          </div>

          <div class="res-msg-box">${result.msg}</div>

          <div class="settle-actions-row">
            <button id="btn-close-rp-settle" class="btn btn-primary btn-block">
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
          <button class="modal-close-btn" id="btn-close-qte-top" aria-label="关闭">&times;</button>
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
    const closeTopBtn = overlay.querySelector('#btn-close-qte-top');

    // Simulate clock scrolling smoothly from 17:59:58.000 towards 18:00:03.000
    const startVirtualMs = 17 * 3600000 + 59 * 60000 + 58000;
    const targetVirtualMs = 18 * 3600000; // 18:00:00
    const startRealTime = performance.now();
    let animId = null;
    let isStopped = false;
    let finalResult = null;

    const closeOverlay = (res) => {
      sound.playClick();
      if (animId) cancelAnimationFrame(animId);
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      if (onComplete) onComplete(res || finalResult || { grade: 'LATE', diffMs: 3000, msg: '打卡已结束' });
    };

    closeTopBtn?.addEventListener('click', () => {
      if (!isStopped) {
        // user clicked close before punching
        const elapsedReal = performance.now() - startRealTime;
        const currentVirtualMs = startVirtualMs + elapsedReal * 1.35;
        isStopped = true;
        cancelAnimationFrame(animId);
        const res = MiniGameRunner.evaluateClockOutQTE(targetVirtualMs, currentVirtualMs);
        closeOverlay(res);
      } else {
        closeOverlay();
      }
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay && isStopped) {
        closeOverlay();
      }
    });

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
      finalResult = result;
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
      card.classList.add('settled');

      const settleEl = document.createElement('div');
      settleEl.className = 'settlement-overlay qte-settlement-overlay slide-up';
      settleEl.innerHTML = `
        <div class="settlement-card-inner qte-settlement-inner">
          <div class="qte-settle-head">
            <div class="qte-settle-titles">
              <span class="qte-settle-badge">📋 闸机考勤结算凭条</span>
              <span class="qte-settle-sub">宏图科技 · 智能终端实时生成</span>
            </div>
            <button class="modal-close-btn" id="btn-close-qte-settle-top" aria-label="关闭">&times;</button>
          </div>

          <div class="qte-receipt-paper">
            <div class="receipt-header-row">
              <span>🏢 宏图科技智慧考勤系统</span>
              <span>打卡凭条小票</span>
            </div>

            <div class="receipt-time-center">
              <span class="rcpt-label">考勤定格时刻</span>
              <strong class="rcpt-clock-large">${digitalEl.textContent}</strong>
              <span class="rcpt-offset-badge">
                精确误差: ${result.diffMs > 0 ? '+' : ''}${result.diffMs} ms
              </span>
            </div>

            <div class="rcpt-stamp-row">
              <span class="rcpt-stamp ${isPerf ? 'stamp-perfect' : isEarly ? 'stamp-early' : 'stamp-late'}">
                ${isPerf ? '🌟 准点神仙' : isEarly ? '⚠️ 提早早退' : '🐢 晚点迟疑'}
              </span>
            </div>

            <div class="receipt-header-row receipt-meta-row">
              <span>考勤判定: <strong class="rcpt-grade-val">${result.grade}</strong></span>
              <span>嫌疑度: <strong class="${result.suspicionDelta > 0 ? 'text-danger' : 'text-success'}">${result.suspicionDelta > 0 ? '+' : ''}${result.suspicionDelta || 0}%</strong></span>
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

      settleEl.querySelector('#btn-close-qte-settle-top')?.addEventListener('click', () => {
        closeOverlay(result);
      });

      settleEl.querySelector('#btn-close-qte-settle')?.addEventListener('click', () => {
        closeOverlay(result);
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

  /**
   * 4. Workplace Tai-Chi Deflection (职场太极·推诿对决)
   */
  static showTaiChiBattle(state, engine, onComplete) {
    const scenario = getRandomTaiChiScenario();
    const overlay = document.createElement('div');
    overlay.className = 'modal-backdrop fade-in';
    overlay.id = 'taichi-game-modal';

    let timeLeft = 8;
    let timerId = null;
    let isFinished = false;

    overlay.innerHTML = `
      <div class="modal-card minigame-card slide-up taichi-modal-card">
        <div class="minigame-header">
          <div class="minigame-title-group">
            <span class="minigame-avatar">${scenario.avatar}</span>
            <div>
              <h3 class="minigame-title">职场太极 · 借力打力</h3>
              <span class="minigame-sub">${scenario.opponent} · ${scenario.title}</span>
            </div>
          </div>
          <div class="minigame-timer-badge" id="tc-timer">⏳ 8s</div>
        </div>

        <div class="minigame-timer-bar-track">
          <div class="minigame-timer-bar-fill" id="tc-timer-fill" style="width: 100%"></div>
        </div>

        <div class="minigame-question-box taichi-dialogue-box">
          <p class="boss-question-text">${scenario.dialogue}</p>
        </div>

        <div class="taichi-instruction-tip">
          <span>🎯 限时 8 秒：选择最佳太极推诿神策，借力打力化解危机！</span>
        </div>

        <div class="taichi-cards-grid" id="tc-cards-grid">
          ${scenario.cards
            .map(
              (card) => `
            <button class="taichi-card-btn" data-card-id="${card.id}">
              <span class="taichi-card-text">${card.text}</span>
            </button>
          `
            )
            .join('')}
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const timerBadge = overlay.querySelector('#tc-timer');
    const timerFill = overlay.querySelector('#tc-timer-fill');
    const cardEl = overlay.querySelector('.modal-card');

    const finishGame = (cardId = null) => {
      if (isFinished) return;
      isFinished = true;
      clearInterval(timerId);

      const evalResult = MiniGameRunner.evaluateTaiChiBattle(scenario.id, cardId);

      // Apply deltas
      if (evalResult.suspicionDelta) {
        state.suspicion = Math.max(0, Math.min(100, state.suspicion + evalResult.suspicionDelta));
      }
      if (evalResult.energyDelta) {
        state.energy = Math.max(0, Math.min(100, state.energy + evalResult.energyDelta));
      }
      state.flags.lastTaiChiGrade = evalResult.grade;
      if (evalResult.grade === 'PERFECT') {
        state.flags.taichiMaster = true;
      }

      state.addLog(evalResult.msg, evalResult.grade === 'PERFECT' ? 'achievement' : evalResult.grade === 'PASS' ? 'info' : 'alert');

      if (evalResult.grade === 'PERFECT') {
        sound.playSuccess();
        toast.show(evalResult.msg, 'success', 3500);
      } else if (evalResult.grade === 'PASS') {
        sound.playClick();
        toast.show(evalResult.msg, 'info', 3000);
      } else {
        sound.playFail();
        toast.show(evalResult.msg, 'warning', 3500);
      }

      // Show settlement
      cardEl.classList.add('settled');
      const isPerf = evalResult.grade === 'PERFECT';
      const isPass = evalResult.grade === 'PASS';

      const settleEl = document.createElement('div');
      settleEl.className = 'settlement-overlay taichi-settlement-overlay slide-up';
      settleEl.innerHTML = `
        <div class="settlement-card-inner">
          <div class="qte-settle-head">
            <div class="qte-settle-titles">
              <span class="qte-settle-badge">☯️ 职场太极推诿结算</span>
              <span class="qte-settle-sub">${scenario.opponent} 面对你的回应</span>
            </div>
          </div>

          <div class="qte-receipt-paper" style="margin-top: 10px;">
            <div class="receipt-header-row">
              <span>推诿心法评级</span>
              <strong class="${isPerf ? 'text-success' : isPass ? 'text-warning' : 'text-danger'}">
                ${isPerf ? '🌟 完美推诿 (PERFECT)' : isPass ? '👌 合格化解 (PASS)' : '💥 惨遭甩锅 (FAIL)'}
              </strong>
            </div>

            <div class="rcpt-footer-dashed" style="margin: 12px 0; font-size: 0.95rem; line-height: 1.5;">
              ${evalResult.msg}
            </div>

            <div class="receipt-header-row receipt-meta-row">
              <span>老板怀疑度: <strong class="${evalResult.suspicionDelta > 0 ? 'text-danger' : 'text-success'}">${evalResult.suspicionDelta > 0 ? '+' : ''}${evalResult.suspicionDelta}%</strong></span>
              <span>身心体能: <strong class="${evalResult.energyDelta >= 0 ? 'text-success' : 'text-danger'}">${evalResult.energyDelta >= 0 ? '+' : ''}${evalResult.energyDelta}</strong></span>
            </div>
          </div>

          <div class="settle-actions-row" style="margin-top: 14px;">
            <button id="btn-close-taichi-settle" class="btn btn-primary" style="width:100%;">
              💨 乘胜追击 · 继续逃脱！
            </button>
          </div>
        </div>
      `;
      cardEl.appendChild(settleEl);

      settleEl.querySelector('#btn-close-taichi-settle')?.addEventListener('click', () => {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        if (typeof onComplete === 'function') onComplete(evalResult);
        if (engine && engine.checkVictoryConditions) engine.checkVictoryConditions();
      });
    };

    // Timer loop
    timerId = setInterval(() => {
      timeLeft -= 0.1;
      if (timeLeft <= 0) {
        timeLeft = 0;
        timerBadge.textContent = '⏳ 0.0s';
        timerFill.style.width = '0%';
        finishGame(null); // Timeout
        return;
      }
      timerBadge.textContent = `⏳ ${timeLeft.toFixed(1)}s`;
      timerFill.style.width = `${(timeLeft / 8) * 100}%`;
    }, 100);

    // Cards click
    overlay.querySelectorAll('.taichi-card-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const cardId = btn.getAttribute('data-card-id');
        finishGame(cardId);
      });
    });
  }

  /**
   * 5. Keyboard Pretender / Frenzy (工位狂暴装忙敲键盘)
   */
  static showKeyboardFrenzy(state, engine, onComplete) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-backdrop fade-in';
    overlay.id = 'keyboard-game-modal';

    let timeLeft = 5.0;
    let timerId = null;
    let isFinished = false;
    let hits = 0;

    const fakeCodeSnippets = [
      'git checkout -b hotfix/rescue-prod-db',
      'SELECT * FROM orders WHERE status = "pending" FOR UPDATE;',
      'sudo systemctl restart cluster-worker.service',
      'docker logs -f core-engine-gateway --tail 50',
      'kubectl scale deployment/pay-api --replicas=32',
      'grep -rn "NullPointerException" /var/log/app.log',
      'npm run build -- --mode=production --optimize',
      'curl -X POST https://api.internal/v1/failover -d \'{"force":true}\'',
      '[INFO] Memory heap garbage collected: freed 4.2GB',
      'chmod +x /deploy/emergency_rollback.sh && ./emergency_rollback.sh',
      'cargo test --release --all-features -- --nocapture',
      'ssh root@node-master-01 "sync && echo 3 > /proc/sys/vm/drop_caches"'
    ];

    overlay.innerHTML = `
      <div class="modal-card minigame-card slide-up keyboard-modal-card">
        <div class="minigame-header">
          <div class="minigame-title-group">
            <span class="minigame-avatar">⌨️</span>
            <div>
              <h3 class="minigame-title">工位狂暴装忙敲击 · 终端救火</h3>
              <span class="minigame-sub">狂敲任意键或高频点击，假装正在抢修生产P0！</span>
            </div>
          </div>
          <div class="minigame-timer-badge" id="kb-timer">⏳ 5.0s</div>
        </div>

        <div class="minigame-timer-bar-track">
          <div class="minigame-timer-bar-fill" id="kb-timer-fill" style="width: 100%"></div>
        </div>

        <div class="keyboard-stats-bar">
          <div class="kb-stat-col">
            <span class="kb-stat-lbl">敲击次数</span>
            <strong class="kb-stat-val" id="kb-hit-count">0</strong>
          </div>
          <div class="kb-stat-col">
            <span class="kb-stat-lbl">装忙充能</span>
            <strong class="kb-stat-val" id="kb-frenzy-pct">0%</strong>
          </div>
          <div class="kb-stat-col">
            <span class="kb-stat-lbl">手速频率</span>
            <strong class="kb-stat-val" id="kb-cps-val">0.0 CPS</strong>
          </div>
        </div>

        <div class="cyber-terminal-screen" id="kb-terminal-screen">
          <div class="terminal-line text-muted">// 正在捕获按键与终端高频指令...</div>
          <div class="terminal-line text-info">$ init emergency-work-mode --speed=max</div>
        </div>

        <div class="keyboard-action-zone">
          <button id="btn-mash-keyboard" class="btn btn-mash-giant">
            ⚡ 狂暴敲键盘！(或直接按键盘任意键) ⚡
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const timerBadge = overlay.querySelector('#kb-timer');
    const timerFill = overlay.querySelector('#kb-timer-fill');
    const hitCountEl = overlay.querySelector('#kb-hit-count');
    const frenzyPctEl = overlay.querySelector('#kb-frenzy-pct');
    const cpsValEl = overlay.querySelector('#kb-cps-val');
    const terminalScreen = overlay.querySelector('#kb-terminal-screen');
    const mashBtn = overlay.querySelector('#btn-mash-keyboard');
    const cardEl = overlay.querySelector('.modal-card');

    const registerHit = () => {
      if (isFinished) return;
      hits++;
      sound.playClick();

      const elapsed = Math.max(0.1, 5.0 - timeLeft);
      const cps = (hits / elapsed).toFixed(1);
      const pct = Math.min(100, Math.round((hits / 25) * 100));

      hitCountEl.textContent = hits;
      frenzyPctEl.textContent = `${pct}%`;
      cpsValEl.textContent = `${cps} CPS`;

      // Append terminal line
      const snippet = fakeCodeSnippets[Math.floor(Math.random() * fakeCodeSnippets.length)];
      const line = document.createElement('div');
      line.className = 'terminal-line terminal-line-live';
      line.textContent = `> [${new Date().toTimeString().slice(0, 8)}] ${snippet}`;
      terminalScreen.appendChild(line);
      terminalScreen.scrollTop = terminalScreen.scrollHeight;

      // Animate mash button
      mashBtn.classList.remove('btn-mash-pulse');
      void mashBtn.offsetWidth; // re-flow
      mashBtn.classList.add('btn-mash-pulse');
    };

    const onKeyDown = (e) => {
      if (isFinished) return;
      // Filter out modifier keys if alone
      if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock'].includes(e.key)) return;
      registerHit();
    };

    window.addEventListener('keydown', onKeyDown);
    mashBtn.addEventListener('click', registerHit);

    const finishGame = () => {
      if (isFinished) return;
      isFinished = true;
      clearInterval(timerId);
      window.removeEventListener('keydown', onKeyDown);

      const evalResult = MiniGameRunner.evaluateKeyboardFrenzy(hits, 5);

      if (evalResult.suspicionDelta) {
        state.suspicion = Math.max(0, Math.min(100, state.suspicion + evalResult.suspicionDelta));
      }
      if (evalResult.energyDelta) {
        state.energy = Math.max(0, Math.min(100, state.energy + evalResult.energyDelta));
      }
      state.flags.lastKeyboardGrade = evalResult.grade;
      state.flags.lastKeyboardHits = hits;
      if (evalResult.grade === 'FIRE') {
        state.flags.hasKeyboardGod = true;
      }

      state.addLog(evalResult.msg, evalResult.grade === 'FIRE' ? 'achievement' : 'info');

      if (evalResult.grade === 'FIRE') {
        sound.playSuccess();
        toast.show(evalResult.msg, 'success', 3500);
      } else if (evalResult.grade === 'STEADY') {
        sound.playClick();
        toast.show(evalResult.msg, 'info', 3000);
      } else {
        sound.playFail();
        toast.show(evalResult.msg, 'warning', 3500);
      }

      // Settle overlay
      cardEl.classList.add('settled');
      const isFire = evalResult.grade === 'FIRE';
      const isSteady = evalResult.grade === 'STEADY';

      const settleEl = document.createElement('div');
      settleEl.className = 'settlement-overlay keyboard-settlement-overlay slide-up';
      settleEl.innerHTML = `
        <div class="settlement-card-inner">
          <div class="qte-settle-head">
            <div class="qte-settle-titles">
              <span class="qte-settle-badge">⌨️ 工位敲击装忙战报</span>
              <span class="qte-settle-sub">总敲击 ${hits} 次 · 频率 ${evalResult.cps} CPS</span>
            </div>
          </div>

          <div class="qte-receipt-paper" style="margin-top: 10px;">
            <div class="receipt-header-row">
              <span>装忙气场评级</span>
              <strong class="${isFire ? 'text-success' : isSteady ? 'text-warning' : 'text-danger'}">
                ${isFire ? '🔥 满负荷救火大仙 (100%)' : isSteady ? '⚡ 沉浸式救火专家' : '💤 手速疲软摸鱼露馅'}
              </strong>
            </div>

            <div class="rcpt-footer-dashed" style="margin: 12px 0; font-size: 0.95rem; line-height: 1.5;">
              ${evalResult.msg}
            </div>

            <div class="receipt-header-row receipt-meta-row">
              <span>老板怀疑度: <strong class="${evalResult.suspicionDelta > 0 ? 'text-danger' : 'text-success'}">${evalResult.suspicionDelta > 0 ? '+' : ''}${evalResult.suspicionDelta}%</strong></span>
              <span>身心体能: <strong class="${evalResult.energyDelta >= 0 ? 'text-success' : 'text-danger'}">${evalResult.energyDelta >= 0 ? '+' : ''}${evalResult.energyDelta}</strong></span>
            </div>
          </div>

          <div class="settle-actions-row" style="margin-top: 14px;">
            <button id="btn-close-keyboard-settle" class="btn btn-primary" style="width:100%;">
              🏃 带着救火光环 · 趁机撤退！
            </button>
          </div>
        </div>
      `;
      cardEl.appendChild(settleEl);

      settleEl.querySelector('#btn-close-keyboard-settle')?.addEventListener('click', () => {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        if (typeof onComplete === 'function') onComplete(evalResult);
        if (engine && engine.checkVictoryConditions) engine.checkVictoryConditions();
      });
    };

    // Timer loop
    timerId = setInterval(() => {
      timeLeft -= 0.1;
      if (timeLeft <= 0) {
        timeLeft = 0;
        timerBadge.textContent = '⏳ 0.0s';
        timerFill.style.width = '0%';
        finishGame();
        return;
      }
      timerBadge.textContent = `⏳ ${timeLeft.toFixed(1)}s`;
      timerFill.style.width = `${(timeLeft / 5) * 100}%`;
    }, 100);
  }
}
