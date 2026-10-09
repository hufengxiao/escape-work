/**
 * UI Renderer: Main dashboard, action triggers, modals, inventory, and achievements gallery
 */

import { ZONES, ZONE_ACTIONS } from '../data/events.js';
import { ITEMS } from '../data/items.js';
import { ENDINGS } from '../data/endings.js';
import { ACHIEVEMENTS } from '../data/achievements.js';
import { sound } from '../audio/sound.js';
import { toast } from './toast.js';
import { generatePoster } from './poster.js';

export class UIRenderer {
  constructor(state, engine) {
    this.state = state;
    this.engine = engine;
    this.appEl = document.getElementById('app');
    this.init();
  }

  init() {
    this.buildBaseLayout();
    this.bindGlobalEvents();
    this.render();
    this.state.subscribe(() => this.render());
  }

  buildBaseLayout() {
    this.appEl.innerHTML = `
      <div class="game-wrapper">
        <!-- Top App Bar -->
        <header class="app-header">
          <div class="header-left">
            <span class="header-logo">🏃‍♂️</span>
            <div class="header-title-box">
              <h1 class="header-title">准点下班大作战</h1>
              <span class="header-subtitle">逃离老板视线 · 职场摸鱼生存记</span>
            </div>
          </div>
          <div class="header-actions">
            <button id="btn-sound" class="btn-icon" title="音效开关" aria-label="音效开关">
              ${this.state.history && sound.isMuted ? '🔇' : '🔊'}
            </button>
            <button id="btn-bgm" class="btn-icon" title="背景紧张音效" aria-label="紧张旋律">
              🎵
            </button>
            <button id="btn-archive" class="btn-icon" title="结局与成就图鉴" aria-label="图鉴">
              🏆
            </button>
            <button id="btn-restart" class="btn-icon" title="重新开始" aria-label="重来">
              🔄
            </button>
          </div>
        </header>

        <!-- Status Dashboard -->
        <section class="dashboard">
          <div class="status-card time-card">
            <div class="status-label">
              <span>🕒 当前时刻</span>
              <span id="target-time-badge" class="badge-sub">下班目标 18:00</span>
            </div>
            <div class="time-display" id="time-display">17:45</div>
            <div class="time-progress-bar">
              <div class="time-progress-fill" id="time-progress"></div>
            </div>
          </div>

          <div class="status-card metric-card">
            <div class="metric-item">
              <div class="metric-header">
                <span>👁️ 老板怀疑度</span>
                <span id="suspicion-text" class="metric-val text-safe">15%</span>
              </div>
              <div class="meter-bar">
                <div id="suspicion-bar" class="meter-fill fill-safe" style="width: 15%"></div>
              </div>
              <div class="metric-caption">满 100% 将被当场抓获强制加班！</div>
            </div>

            <div class="metric-item">
              <div class="metric-header">
                <span>⚡ 精神体力</span>
                <span id="energy-text" class="metric-val text-energy">90%</span>
              </div>
              <div class="meter-bar">
                <div id="energy-bar" class="meter-fill fill-energy" style="width: 90%"></div>
              </div>
              <div class="metric-caption">归零将累瘫在工位任人宰割</div>
            </div>
          </div>
        </section>

        <!-- Escape Path Radar (Zone Navigator) -->
        <nav class="zone-stepper" id="zone-stepper" aria-label="逃脱进度">
          <!-- Dynamically populated zones -->
        </nav>

        <!-- Main Workspace Screen -->
        <main class="main-screen">
          <!-- Zone Scene Box -->
          <div class="scene-card" id="scene-card">
            <div class="scene-header">
              <div class="scene-title-group">
                <span class="scene-icon" id="scene-icon">💻</span>
                <div>
                  <h2 class="scene-title" id="scene-title">工位核心区</h2>
                  <span class="scene-sub" id="scene-sub">17:45 - 17:50</span>
                </div>
              </div>
              <div class="scene-tag" id="scene-status-tag">安全隐蔽</div>
            </div>
            <p class="scene-desc" id="scene-desc">
              正在加载场景……
            </p>
          </div>

          <!-- Tactical Action Buttons -->
          <section class="action-section">
            <h3 class="section-title">
              <span>🎯 战术抉择</span>
              <span class="section-hint">合理规划时间与体力</span>
            </h3>
            <div class="action-grid" id="action-grid">
              <!-- Dynamically populated buttons -->
            </div>
          </section>

          <!-- Tactical Backpack Items -->
          <section class="backpack-section">
            <h3 class="section-title">
              <span>🎒 摸鱼背包 (<span id="backpack-count">0</span>)</span>
              <span class="section-hint">点击道具可主动使用或查看效果</span>
            </h3>
            <div class="item-tray" id="item-tray">
              <!-- Dynamically populated items -->
            </div>
          </section>

          <!-- Live Event Feed -->
          <section class="log-section">
            <h3 class="section-title">
              <span>📜 实时动态通报</span>
              <span class="section-hint">分秒必争</span>
            </h3>
            <div class="log-container" id="log-container">
              <!-- Dynamic logs -->
            </div>
          </section>
        </main>

        <!-- Encounters Modal -->
        <div id="encounter-modal" class="modal-backdrop hidden">
          <div class="modal-box encounter-box">
            <div class="encounter-header">
              <span class="encounter-avatar" id="enc-avatar">👓</span>
              <div>
                <h3 class="encounter-title" id="enc-title">突发状况</h3>
                <span class="encounter-character" id="enc-character">产品经理</span>
              </div>
            </div>
            <p class="encounter-desc" id="enc-desc">剧情描述</p>
            <div class="encounter-choices" id="enc-choices">
              <!-- Choice buttons -->
            </div>
          </div>
        </div>

        <!-- Ending Modal -->
        <div id="ending-modal" class="modal-backdrop hidden">
          <div class="modal-box ending-box">
            <div class="ending-rank-badge" id="end-rank">SSS</div>
            <div class="ending-icon" id="end-badge">🏆</div>
            <h2 class="ending-title" id="end-title">神仙准点打卡</h2>
            <div class="ending-summary" id="end-summary">分秒不差，完美隐匿！</div>
            <div class="ending-story" id="end-desc">结局详细故事</div>
            <div class="ending-quote" id="end-quote">“准点下班不是逃避……”</div>

            <div class="ending-actions">
              <button id="btn-share-poster" class="btn btn-primary">
                📜 生成逃脱战绩海报
              </button>
              <button id="btn-ending-restart" class="btn btn-secondary">
                🔄 再来一把
              </button>
            </div>
          </div>
        </div>

        <!-- Poster Share Preview Modal -->
        <div id="poster-modal" class="modal-backdrop hidden">
          <div class="modal-box poster-box">
            <div class="poster-header">
              <h3>🎉 准点下班战役认证证书</h3>
              <button id="btn-close-poster" class="btn-icon" aria-label="关闭">&times;</button>
            </div>
            <div class="poster-image-container" id="poster-container">
              <div class="loading-spinner">正在绘制官方防伪印章与战报……</div>
            </div>
            <div class="poster-footer">
              <button id="btn-download-poster" class="btn btn-primary">
                💾 保存证书图片
              </button>
              <button id="btn-copy-report" class="btn btn-secondary">
                📋 复制战绩文本
              </button>
            </div>
          </div>
        </div>

        <!-- Archive & Achievements Modal -->
        <div id="archive-modal" class="modal-backdrop hidden">
          <div class="modal-box archive-box">
            <div class="archive-header">
              <h3>🏆 战绩与图鉴全览</h3>
              <button id="btn-close-archive" class="btn-icon" aria-label="关闭">&times;</button>
            </div>
            <div class="archive-tabs">
              <button id="tab-endings" class="tab-btn active">结局图鉴 (<span id="unlocked-endings-count">0</span>/12)</button>
              <button id="tab-achievements" class="tab-btn">勋章成就 (<span id="unlocked-achievements-count">0</span>/${ACHIEVEMENTS.length})</button>
            </div>
            <div class="archive-content" id="archive-content">
              <!-- Populated by tab selection -->
            </div>
          </div>
        </div>
      </div>
    `;
  }

  bindGlobalEvents() {
    // Sound toggle
    const btnSound = document.getElementById('btn-sound');
    btnSound.addEventListener('click', () => {
      const isMuted = sound.toggleMute();
      btnSound.textContent = isMuted ? '🔇' : '🔊';
      toast.show(isMuted ? '音效已静音' : '音效已开启', 'info');
    });

    // BGM toggle
    const btnBgm = document.getElementById('btn-bgm');
    btnBgm.addEventListener('click', () => {
      if (sound.bgmPlaying) {
        sound.stopBgm();
        btnBgm.classList.remove('active');
        toast.show('紧张氛围音乐已暂停', 'info');
      } else {
        sound.startBgm();
        btnBgm.classList.add('active');
        toast.show('紧张下班倒计时氛围乐开启', 'info');
      }
    });

    // Restart buttons
    document.getElementById('btn-restart').addEventListener('click', () => {
      if (confirm('确定要放弃当前进度重新开始吗？')) {
        this.engine.restart();
        toast.show('时间已重置为 17:45，新的一局开始！', 'info');
      }
    });

    document.getElementById('btn-ending-restart').addEventListener('click', () => {
      document.getElementById('ending-modal').classList.add('hidden');
      this.engine.restart();
    });

    // Archive Modal
    const archiveModal = document.getElementById('archive-modal');
    document.getElementById('btn-archive').addEventListener('click', () => {
      sound.playClick();
      this.renderArchiveModal('endings');
      archiveModal.classList.remove('hidden');
    });

    document.getElementById('btn-close-archive').addEventListener('click', () => {
      archiveModal.classList.add('hidden');
    });

    document.getElementById('tab-endings').addEventListener('click', () => {
      this.renderArchiveModal('endings');
    });

    document.getElementById('tab-achievements').addEventListener('click', () => {
      this.renderArchiveModal('achievements');
    });

    // Poster Modal
    const posterModal = document.getElementById('poster-modal');
    document.getElementById('btn-close-poster').addEventListener('click', () => {
      posterModal.classList.add('hidden');
    });

    document.getElementById('btn-share-poster').addEventListener('click', async () => {
      if (!this.state.currentEnding) return;
      sound.playClick();
      posterModal.classList.remove('hidden');

      const container = document.getElementById('poster-container');
      container.innerHTML = '<div class="loading-spinner">正在绘制官方防伪印章与战报……</div>';

      const dataUrl = await generatePoster(this.state, this.state.currentEnding);
      container.innerHTML = `<img src="${dataUrl}" alt="准点下班逃脱证书" class="poster-preview-img" />`;

      // Download button
      document.getElementById('btn-download-poster').onclick = () => {
        const link = document.createElement('a');
        link.download = `准点下班战役认证-${this.state.getTimeString().replace(':', '')}.png`;
        link.href = dataUrl;
        link.click();
        toast.show('证书图片已开始下载！', 'success');
      };

      // Copy text button
      document.getElementById('btn-copy-report').onclick = () => {
        const ending = this.state.currentEnding;
        const text = `【准点下班大作战】我达成了【${ending.title}】(${ending.rank}级评价)！\n打卡时刻：${this.state.getTimeString()}\n老板怀疑度：${this.state.suspicion}%\n剩余精气神：${this.state.energy}%\n“${ending.quote}”\n快来挑战不被老板发现的准点逃脱！`;
        navigator.clipboard.writeText(text).then(() => {
          toast.show('战绩文字已成功复制到剪贴板！', 'success');
        }).catch(() => {
          toast.show('复制失败，请手动截图分享', 'warning');
        });
      };
    });
  }

  render() {
    this.renderHeaderAndMetrics();
    this.renderZoneNavigator();
    this.renderSceneInfo();
    this.renderActionButtons();
    this.renderBackpack();
    this.renderLogs();
    this.renderModals();
  }

  renderHeaderAndMetrics() {
    // 1. Time display
    const timeStr = this.state.getTimeString();
    document.getElementById('time-display').textContent = timeStr;

    // Time progress (from 17:45 to 18:05)
    const totalMinutes = (this.state.currentHour - 17) * 60 + (this.state.currentMinute - 45);
    const progressPercent = Math.min(100, Math.max(0, (totalMinutes / 20) * 100));
    document.getElementById('time-progress').style.width = `${progressPercent}%`;

    const targetBadge = document.getElementById('target-time-badge');
    if (this.state.currentHour >= 18) {
      targetBadge.textContent = '已达下班时刻！速撤！';
      targetBadge.className = 'badge-sub badge-urgent';
    } else {
      targetBadge.textContent = `距 18:00 还有 ${15 - totalMinutes} 分钟`;
      targetBadge.className = 'badge-sub';
    }

    // 2. Suspicion Bar
    const susp = Math.min(100, Math.max(0, this.state.suspicion));
    const suspText = document.getElementById('suspicion-text');
    const suspBar = document.getElementById('suspicion-bar');
    suspText.textContent = `${susp}%`;
    suspBar.style.width = `${susp}%`;

    suspBar.className = 'meter-fill';
    suspText.className = 'metric-val';
    if (susp < 40) {
      suspBar.classList.add('fill-safe');
      suspText.classList.add('text-safe');
    } else if (susp < 75) {
      suspBar.classList.add('fill-warn');
      suspText.classList.add('text-warn');
    } else {
      suspBar.classList.add('fill-danger');
      suspText.classList.add('text-danger');
    }

    // 3. Energy Bar
    const energy = Math.min(100, Math.max(0, this.state.energy));
    const energyText = document.getElementById('energy-text');
    const energyBar = document.getElementById('energy-bar');
    energyText.textContent = `${energy}%`;
    energyBar.style.width = `${energy}%`;
  }

  renderZoneNavigator() {
    const stepper = document.getElementById('zone-stepper');
    stepper.innerHTML = ZONES.map((z) => {
      const isCurrent = z.id === this.state.zone;
      const isPast = z.id < this.state.zone;
      const cls = isCurrent ? 'step-item active' : isPast ? 'step-item done' : 'step-item';
      return `
        <div class="${cls}">
          <span class="step-icon">${z.icon}</span>
          <span class="step-label">${z.name}</span>
        </div>
      `;
    }).join('');
  }

  renderSceneInfo() {
    const currentZone = ZONES.find((z) => z.id === this.state.zone) || ZONES[0];
    document.getElementById('scene-icon').textContent = currentZone.icon;
    document.getElementById('scene-title').textContent = currentZone.name;
    document.getElementById('scene-sub').textContent = currentZone.title;
    document.getElementById('scene-desc').textContent = currentZone.description;

    const tag = document.getElementById('scene-status-tag');
    if (this.state.flags.hasDecoyJacket && this.state.zone === 1) {
      tag.textContent = '🧥 替身外套生效中';
      tag.className = 'scene-tag tag-active';
    } else if (this.state.flags.hasCoffeeShield && this.state.zone === 2) {
      tag.textContent = '☕ 马克杯光环生效中';
      tag.className = 'scene-tag tag-active';
    } else if (this.state.suspicion > 70) {
      tag.textContent = '🚨 老板目光逼近！';
      tag.className = 'scene-tag tag-danger';
    } else {
      tag.textContent = '👀 伺机而动';
      tag.className = 'scene-tag';
    }
  }

  renderActionButtons() {
    const grid = document.getElementById('action-grid');
    const actions = ZONE_ACTIONS[this.state.zone] || [];

    grid.innerHTML = actions.map((act) => {
      const costBadge = `
        <span class="cost-pill">
          ${act.costTime ? `⏱️ +${act.costTime}分` : ''}
          ${act.costEnergy ? `⚡ ${act.costEnergy > 0 ? '-' : '+'}${Math.abs(act.costEnergy)}` : ''}
        </span>
      `;
      return `
        <button class="action-btn" data-action="${act.id}">
          <div class="act-top">
            <span class="act-icon">${act.icon}</span>
            <span class="act-name">${act.name}</span>
          </div>
          <div class="act-desc">${act.desc}</div>
          <div class="act-cost">${costBadge}</div>
        </button>
      `;
    }).join('');

    grid.querySelectorAll('.action-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const actionId = btn.getAttribute('data-action');
        this.engine.executeAction(actionId);
      });
    });
  }

  renderBackpack() {
    const tray = document.getElementById('item-tray');
    const countEl = document.getElementById('backpack-count');
    countEl.textContent = this.state.inventory.length;

    if (this.state.inventory.length === 0) {
      tray.innerHTML = '<div class="empty-tray">背包空空如也，可在工位和走廊寻找摸鱼神器……</div>';
      return;
    }

    tray.innerHTML = this.state.inventory.map((itemId) => {
      const item = ITEMS[itemId];
      if (!item) return '';
      return `
        <div class="item-card" data-item="${itemId}">
          <div class="item-head">
            <span class="item-icon">${item.icon}</span>
            <span class="item-name">${item.name}</span>
          </div>
          <div class="item-desc">${item.description}</div>
          <div class="item-effect">${item.effectText}</div>
          <button class="btn-use-item" data-use="${itemId}">使用道具</button>
        </div>
      `;
    }).join('');

    tray.querySelectorAll('.btn-use-item').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const itemId = btn.getAttribute('data-use');
        sound.playItem();
        this.state.useItem(itemId);
      });
    });
  }

  renderLogs() {
    const container = document.getElementById('log-container');
    container.innerHTML = this.state.logs.map((log) => {
      return `
        <div class="log-entry log-${log.type}">
          <span class="log-time">[${log.time}]</span>
          <span class="log-text">${log.text}</span>
        </div>
      `;
    }).join('');
  }

  renderModals() {
    // 1. Encounter modal
    const encModal = document.getElementById('encounter-modal');
    if (this.state.activeEncounter) {
      const enc = this.state.activeEncounter;
      document.getElementById('enc-avatar').textContent = enc.avatar || '⚠️';
      document.getElementById('enc-title').textContent = enc.title;
      document.getElementById('enc-character').textContent = enc.character;
      document.getElementById('enc-desc').textContent = enc.description;

      const choicesContainer = document.getElementById('enc-choices');
      choicesContainer.innerHTML = enc.choices.map((choice, idx) => {
        const hasReq = !choice.requireItem || this.state.hasItem(choice.requireItem);
        const disabled = hasReq ? '' : 'disabled';
        const reqHint = choice.requireItem && !hasReq ? ' (缺少对应道具)' : '';
        return `
          <button class="choice-btn ${disabled ? 'choice-disabled' : ''}" data-idx="${idx}" ${disabled}>
            ${choice.text}${reqHint}
          </button>
        `;
      }).join('');

      choicesContainer.querySelectorAll('.choice-btn:not([disabled])').forEach((btn) => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.getAttribute('data-idx'), 10);
          this.engine.resolveEncounterChoice(idx);
        });
      });

      encModal.classList.remove('hidden');
    } else {
      encModal.classList.add('hidden');
    }

    // 2. Ending modal
    const endingModal = document.getElementById('ending-modal');
    if (this.state.currentEnding) {
      const ending = this.state.currentEnding;
      const rankEl = document.getElementById('end-rank');
      rankEl.textContent = ending.rank;
      rankEl.className = `ending-rank-badge rank-${ending.rank.toLowerCase()}`;

      document.getElementById('end-badge').textContent = ending.badge;
      document.getElementById('end-title').textContent = ending.title;
      document.getElementById('end-summary').textContent = ending.summary;
      document.getElementById('end-desc').textContent = ending.description;
      document.getElementById('end-quote').textContent = `“${ending.quote}”`;

      endingModal.classList.remove('hidden');
    } else {
      endingModal.classList.add('hidden');
    }
  }

  renderArchiveModal(activeTab = 'endings') {
    const tabEndings = document.getElementById('tab-endings');
    const tabAchievements = document.getElementById('tab-achievements');
    const content = document.getElementById('archive-content');

    const unlockedEndings = this.state.history.unlockedEndings || [];
    const unlockedAchievements = this.state.history.unlockedAchievements || [];

    document.getElementById('unlocked-endings-count').textContent = unlockedEndings.length;
    document.getElementById('unlocked-achievements-count').textContent = unlockedAchievements.length;

    if (activeTab === 'endings') {
      tabEndings.classList.add('active');
      tabAchievements.classList.remove('active');

      content.innerHTML = `
        <div class="archive-grid">
          ${Object.values(ENDINGS).map((end) => {
            const isUnlocked = unlockedEndings.includes(end.id);
            return `
              <div class="archive-card ${isUnlocked ? 'unlocked' : 'locked'}">
                <div class="ach-icon">${isUnlocked ? end.badge : '🔒'}</div>
                <div class="ach-info">
                  <div class="ach-title">
                    <span>${isUnlocked ? end.title : '？？？未达成'}</span>
                    <span class="ach-rank rank-${end.rank.toLowerCase()}">${end.rank}</span>
                  </div>
                  <div class="ach-desc">${isUnlocked ? end.summary : '在游戏中探索特定路线或抉择解锁'}</div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    } else {
      tabEndings.classList.remove('active');
      tabAchievements.classList.add('active');

      content.innerHTML = `
        <div class="archive-grid">
          ${ACHIEVEMENTS.map((ach) => {
            const isUnlocked = unlockedAchievements.includes(ach.id);
            return `
              <div class="archive-card ${isUnlocked ? 'unlocked' : 'locked'}">
                <div class="ach-icon">${isUnlocked ? ach.icon : '🔒'}</div>
                <div class="ach-info">
                  <div class="ach-title">${isUnlocked ? ach.title : '？？？隐藏勋章'}</div>
                  <div class="ach-desc">${isUnlocked ? ach.description : '满足特定战术条件后解锁'}</div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }
  }
}
