/**
 * UI Renderer: Main dashboard, action triggers, modals, inventory, and achievements gallery
 */

import { ZONES, ZONE_ACTIONS } from '../data/events.js';
import { ITEMS } from '../data/items.js';
import { ENDINGS } from '../data/endings.js';
import { ACHIEVEMENTS } from '../data/achievements.js';
import { CHARACTERS } from '../data/characters.js';
import { PERKS } from '../data/perks.js';
import { sound } from '../audio/sound.js';
import { toast } from './toast.js';
import { generatePoster } from './poster.js';
import { CHANGELOGS, CURRENT_VERSION } from '../data/changelog.js';
import { TUTORIAL_STEPS, ZONE_STEP_TIPS, GUIDE_SECTIONS, INTERACTIVE_TOUR_STEPS } from '../data/guide.js';
import { MapView } from './mapView.js';
import { CraftModal } from './craftModal.js';
import { RelationPanel } from './relationPanel.js';
import { MiniGameUI } from './miniGames.js';
import { RadarView } from './radarView.js';
import { DailySystem } from '../data/daily.js';
import { ReverseBossView } from './reverseBossView.js';
import { OvertimeView } from './overtimeView.js';
import { MapManager } from '../engine/mapManager.js';
import { NODE_TYPES } from '../data/maps.js';

export class UIRenderer {
  constructor(state, engine) {
    this.state = state;
    this.engine = engine;
    this.mapView = new MapView(
      this.state,
      (nodeId) => {
        this.engine.travelToNode(nodeId);
        this.setActiveTab('action');
      },
      (tab) => this.setActiveTab(tab || 'action')
    );
    this.activeTab = 'action';
    this.activeBottomNavTab = 'escape';
    this.craftModal = new CraftModal(
      this.state,
      () => this.render(),
      () => this.updateBottomTabHighlight(this.activeBottomNavTab || 'escape')
    );
    this.relationPanel = new RelationPanel(this.state, () => this.render());
    this.radarView = new RadarView(this.state, () => this.render());
    this.reverseBossView = new ReverseBossView(this.state, () => {
      this.updateBottomTabHighlight(this.activeBottomNavTab || 'escape');
      this.render();
    });
    this.overtimeView = new OvertimeView(this.state, () => {
      this.updateBottomTabHighlight(this.activeBottomNavTab || 'escape');
      this.render();
    });
    this.guideCurrentStep = 0;
    this.tourActive = false;
    this.currentTourStep = 0;
    this.onTourWindowUpdate = () => {
      if (this.tourActive) {
        this.updateTourPositions();
      }
    };
    this.appEl = document.getElementById('app');
    this.init();
  }

  init() {
    this.buildBaseLayout();
    this.renderChangelogModal();
    this.renderGuideModal();
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
              <div class="header-title-row">
                <h1 class="header-title">准点下班大作战</h1>
                <span class="header-version-pill">v${CURRENT_VERSION}</span>
              </div>
              <span class="header-subtitle">逃离老板视线 · 职场摸鱼生存记</span>
            </div>
          </div>
          <div class="header-actions">
            <button id="btn-guide" class="btn-icon" title="玩法介绍与出逃指引" aria-label="新手指引">
              📖
            </button>
            <button id="btn-changelog" class="btn-icon" title="版本更新说明" aria-label="更新说明">
              📢
            </button>
            <button id="btn-sound" class="btn-icon" title="音效开关" aria-label="音效开关">
              ${this.state.history && sound.isMuted ? '🔇' : '🔊'}
            </button>
            <button id="btn-bgm" class="btn-icon" title="紧张氛围音乐：已关闭 (点击开启)" aria-label="开启背景氛围音乐">
              🎵
            </button>
            <button id="btn-restart" class="btn-icon" title="重新开始游戏" aria-label="重新开始">
              🔄
            </button>
          </div>
        </header>

        <!-- Escape Gameplay View Container (Tab: escape) -->
        <div id="escape-view-container" class="escape-view-container">
          <!-- Role & Workplace Environment Meta Bar -->
          <div class="meta-strip">
            <button id="strip-role-chip" class="meta-chip chip-role" title="点击切换职场角色">
              <span id="meta-role-avatar">👨‍💻</span>
              <span id="meta-role-name">后端攻城狮</span>
            </button>
            <div id="strip-mod-chip" class="meta-chip chip-weather" title="今日办公区环境词条 (点击查看每日黄历)">
              <span id="meta-mod-icon">☀️</span>
              <span id="meta-mod-name">平静周五</span>
            </div>
            <button id="strip-exp-chip" class="meta-chip chip-exp" title="点击打开摸鱼悟性天赋树">
              <span>🧬</span>
              <span id="meta-exp-val">0 悟性</span>
            </button>
            <button id="strip-relation-chip" class="meta-chip chip-relation" title="点击查看职场人脉网络与送礼">
              <span>🤝</span>
              <span id="meta-relation-val">职场人脉</span>
            </button>
            <span id="strip-hardcore-tag" class="meta-chip chip-hardcore hidden">🔥 修罗场</span>
          </div>

          <!-- Status Dashboard -->
          <section class="dashboard">
            <div class="status-card time-card" id="status-card-time">
              <div class="status-label">
                <span class="status-label-title">🕒 当前时刻</span>
                <span id="target-time-badge" class="badge-sub">18:00打卡</span>
              </div>
              <div class="time-display-row">
                <div class="time-display" id="time-display">17:45</div>
                <span id="time-delta" class="stat-delta-chip delta-time hidden"></span>
              </div>
              <div class="time-progress-bar">
                <div class="time-progress-fill" id="time-progress"></div>
              </div>
            </div>

            <div class="status-card metric-card" id="status-card-metrics">
              <div class="metric-item" id="metric-item-suspicion">
                <div class="metric-header">
                  <span>👁️ 老板怀疑度</span>
                  <div class="metric-val-wrapper">
                    <span id="suspicion-delta" class="stat-delta-chip hidden"></span>
                    <span id="suspicion-text" class="metric-val text-safe">15%</span>
                  </div>
                </div>
                <div class="meter-bar">
                  <div id="suspicion-bar" class="meter-fill fill-safe" style="width: 15%"></div>
                </div>
                <div class="metric-caption">满 100% 将被当场抓获强制加班！</div>
              </div>

              <div class="metric-item" id="metric-item-energy">
                <div class="metric-header">
                  <span>⚡ 精神体力</span>
                  <div class="metric-val-wrapper">
                    <span id="energy-delta" class="stat-delta-chip hidden"></span>
                    <span id="energy-text" class="metric-val text-energy">90%</span>
                  </div>
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

          <!-- Tactical Step Guidance Bar -->
          <div class="tactical-step-bar" id="tactical-step-bar">
            <div class="tactical-step-content">
              <div class="tactical-step-header">
                <span class="tactical-step-badge" id="tactical-step-badge">第 1 阶段 / 工位潜行</span>
                <button id="btn-step-guide-link" class="tactical-step-link" title="点击打开本阶段详细向导">
                  📖 玩法向导
                </button>
              </div>
              <div class="tactical-step-text" id="tactical-step-text">加载提示中...</div>
            </div>
          </div>

          <!-- Cyber Segmented Navigation for Compact Playability (4 fixed columns, zero horizontal scroll) -->
          <nav class="view-tab-nav" aria-label="主界面视图导航">
            <button class="view-tab-btn active" data-tab="action" id="tab-btn-action">
              <span class="tab-icon">🎯</span>
              <span class="tab-label">现场抉择</span>
            </button>
            <button class="view-tab-btn" data-tab="map" id="tab-btn-map">
              <span class="tab-icon">🗺️</span>
              <span class="tab-label">逃脱路线</span>
              <span class="tab-badge hidden" id="map-avail-badge"></span>
            </button>
            <button class="view-tab-btn" data-tab="backpack" id="tab-btn-backpack">
              <span class="tab-icon">🎒</span>
              <span class="tab-label">摸鱼背包</span>
              <span class="tab-badge hidden" id="backpack-tab-badge">0</span>
            </button>
            <button class="view-tab-btn" data-tab="log" id="tab-btn-log">
              <span class="tab-icon">📜</span>
              <span class="tab-label">动态通报</span>
            </button>
          </nav>

          <!-- Tab Panel: Main Workspace Screen (Action & Scene) -->
          <main class="main-screen view-tab-panel" data-panel="action">
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

            <!-- Route Advance Branch Section (Synchronized with DAG Escape Map) -->
            <section class="route-advance-section" id="route-advance-section">
              <!-- Dynamically populated branch routes -->
            </section>

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

            <!-- Quick Action Log Preview Strip -->
            <div class="action-log-ticker" id="action-log-ticker" title="点击查看全部通报动态">
              <span class="action-log-icon">📜</span>
              <span class="action-log-text" id="action-log-preview">周五 17:45，逃脱战役正式打响！</span>
              <span class="action-log-more">全部动态 ➡️</span>
            </div>
          </main>

          <!-- Tab Panel: DAG Workplace Exploration Map Slot & Boss Radar -->
          <div id="map-view-panel" class="view-tab-panel panel-hidden" data-panel="map">
            <!-- Boss Surveillance Radar Slot: Integrated into Escape Route -->
            <div id="radar-slot"></div>
            <!-- DAG Workplace Exploration Map Slot -->
            <div id="map-view-slot"></div>
          </div>

          <!-- Tab Panel: Tactical Backpack Items -->
          <section class="backpack-section view-tab-panel panel-hidden" data-panel="backpack">
            <h3 class="section-title">
              <div style="display:flex;align-items:center;gap:8px;">
                <span>🎒 摸鱼背包 (<span id="backpack-count">0</span>)</span>
                <button id="btn-quick-craft" class="btn-craft-badge" title="合成羁绊神装">🧪 妙手合成</button>
              </div>
              <span class="section-hint">点击道具可主动使用或合成神装</span>
            </h3>

            <!-- 2-Column Responsive Item Grid (No horizontal swiping) -->
            <div class="item-tray" id="item-tray">
              <!-- Dynamically populated items -->
            </div>

            <!-- Empty space utilization: Crafting Synthesis Showcase & Quick Workbench Portal -->
            <div class="backpack-craft-portal" id="backpack-craft-portal">
              <div class="craft-portal-header">
                <div class="craft-portal-title">
                  <span class="craft-portal-icon">🧪</span>
                  <div>
                    <h4 class="portal-heading">职场合成工坊 · 羁绊配方</h4>
                    <span class="portal-sub">2件基础道具可融合为顶级破局神装</span>
                  </div>
                </div>
                <button id="btn-backpack-go-craft" class="btn-craft-portal-go" title="前往工坊合成">
                  进入工坊 ➔
                </button>
              </div>

              <div class="craft-recipes-preview">
                <div class="recipe-chip" title="风油精 + 咖啡 = 提神续命水">
                  <span class="recipe-icons">🧪+☕</span>
                  <span class="recipe-name">提神续命水</span>
                  <span class="recipe-tag">体力+25</span>
                </div>
                <div class="recipe-chip" title="防风外套 + 降噪耳机 = 隐身摸鱼结界">
                  <span class="recipe-icons">🧥+🎧</span>
                  <span class="recipe-name">隐身摸鱼结界</span>
                  <span class="recipe-tag">老板免察</span>
                </div>
                <div class="recipe-chip" title="劳动法 + 离职申请书 = 仲裁神剑">
                  <span class="recipe-icons">⚖️+📄</span>
                  <span class="recipe-name">仲裁神剑</span>
                  <span class="recipe-tag">必定脱身</span>
                </div>
                <div class="recipe-chip" title="墨镜 + 录音笔 = 职场调查专员">
                  <span class="recipe-icons">🕶️+🎙️</span>
                  <span class="recipe-name">职场调查专员</span>
                  <span class="recipe-tag">窥探雷达</span>
                </div>
              </div>
            </div>

            <!-- Empty space utilization: Tactical Backpack Tips -->
            <div class="backpack-tips-card">
              <div class="tips-card-head">
                <span class="tips-card-icon">💡</span>
                <span class="tips-card-title">摸鱼背包战术指引</span>
              </div>
              <ul class="tips-card-list">
                <li><span>🎒</span> 使用道具即时生效，不消耗当前时刻与行动力。</li>
                <li><span>🧪</span> 收集 2 件道具即可触发羁绊，合成威力强大的专属神装。</li>
                <li><span>🔎</span> 在工位、茶水间、走廊各区域探索可搜寻更多职场破局神器。</li>
              </ul>
            </div>
          </section>

          <!-- Tab Panel: Live Event Feed -->
          <section class="log-section view-tab-panel panel-hidden" data-panel="log">
            <h3 class="section-title">
              <div style="display:flex;align-items:center;gap:8px;">
                <span>📜 实时动态通报</span>
                <span class="log-count-badge" id="log-count-badge">0 条动态</span>
              </div>
              <span class="section-hint">分秒必争 · 步步为营</span>
            </h3>
            <div class="log-container" id="log-container">
              <!-- Dynamic logs -->
            </div>
          </section>
        </div>

        <!-- Modes Hub Container (Combined Tab: 阎总模式 + 深夜逃杀 + 职场工坊 + 图鉴成就) -->
        <div id="modes-hub-container" class="modes-hub-container hidden">
          <div class="modes-hub-view">
            <div class="modes-hub-header">
              <div class="modes-hub-title-group">
                <span class="modes-hub-avatar">🎛️</span>
                <div>
                  <h2 class="modes-hub-title">职场多元模式中心</h2>
                  <span class="modes-hub-subtitle">四大扩展玩法 · 一站式沉浸体验</span>
                </div>
              </div>
            </div>

            <div class="modes-hub-grid">
              <!-- 1. 阎总模式 -->
              <div class="mode-portal-card card-boss" id="card-mode-boss" role="button" tabindex="0">
                <div class="mode-card-header">
                  <span class="mode-card-icon">👑</span>
                  <span class="mode-card-badge badge-boss">角色反转</span>
                </div>
                <h3 class="mode-card-title">阎总模式 · 逮捕摸鱼</h3>
                <p class="mode-card-desc">反转扮演公司大Boss阎总！巡视 6 大办公区，布控抓捕潜逃员工，守护公司加班秩序！</p>
                <div class="mode-card-footer">
                  <span class="mode-card-stat">🏢 6大巡逻区 · 策略布控</span>
                  <button class="btn btn-primary btn-sm mode-enter-btn" id="btn-enter-boss">立即接管 ➔</button>
                </div>
              </div>

              <!-- 2. 深夜逃杀 -->
              <div class="mode-portal-card card-overtime" id="card-mode-overtime" role="button" tabindex="0">
                <div class="mode-card-header">
                  <span class="mode-card-icon">🌙</span>
                  <span class="mode-card-badge badge-overtime">无尽生存</span>
                </div>
                <h3 class="mode-card-title">深夜大逃杀 · 绝地生存</h3>
                <p class="mode-card-desc">周五深夜被困办公室？极限管控摸鱼度与存在感，熬过 20 个通宵回合迎来周六黎明曙光！</p>
                <div class="mode-card-footer">
                  <span class="mode-card-stat">⏳ 20回合 · 极限挑战</span>
                  <button class="btn btn-primary btn-sm mode-enter-btn" id="btn-enter-overtime">开启大逃杀 ➔</button>
                </div>
              </div>

              <!-- 3. 职场工坊 -->
              <div class="mode-portal-card card-workshop" id="card-mode-workshop" role="button" tabindex="0">
                <div class="mode-card-header">
                  <span class="mode-card-icon">🧪</span>
                  <span class="mode-card-badge badge-workshop">神装与人脉</span>
                </div>
                <h3 class="mode-card-title">职场工坊 · 妙手合成</h3>
                <p class="mode-card-desc">探索摸鱼道具无序配方，合成强力羁绊神装；管理 4 位职场同事好感度网络，获取送礼羁绊。</p>
                <div class="mode-card-footer">
                  <span class="mode-card-stat">✨ 10款神装 · 4大关系网</span>
                  <button class="btn btn-primary btn-sm mode-enter-btn" id="btn-enter-workshop">进入工坊 ➔</button>
                </div>
              </div>

              <!-- 4. 图鉴与成就 -->
              <div class="mode-portal-card card-archive" id="card-mode-archive" role="button" tabindex="0">
                <div class="mode-card-header">
                  <span class="mode-card-icon">🏆</span>
                  <span class="mode-card-badge badge-archive">战绩与收藏</span>
                </div>
                <h3 class="mode-card-title">图鉴成就 · 档案全览</h3>
                <p class="mode-card-desc">全景检阅 26 大结局分支、20 枚成就勋章、职业成长记录与官方出逃指南，见证摸鱼传奇。</p>
                <div class="mode-card-footer">
                  <span class="mode-card-stat" id="hub-archive-counter">🏆 结局与勋章</span>
                  <button class="btn btn-primary btn-sm mode-enter-btn" id="btn-enter-archive">查阅图鉴 ➔</button>
                </div>
              </div>
            </div>
          </div>
        </div>

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
            <div class="ending-exp-badge" id="end-exp-badge">✨ 摸鱼悟性 +0 EXP</div>
            <div class="ending-story" id="end-desc">结局详细故事</div>
            <div class="ending-quote" id="end-quote">“准点下班不是逃避……”</div>

            <div class="ending-actions">
              <button id="btn-share-poster" class="btn btn-primary">
                📜 生成逃脱战绩海报
              </button>
              <button id="btn-ending-role" class="btn btn-secondary">
                🎭 换个职业再来
              </button>
              <button id="btn-ending-restart" class="btn btn-secondary">
                🔄 直接再来一把
              </button>
              <button id="btn-ending-overtime" class="btn btn-secondary" style="border-color:#4338ca; color:#c7d2fe;">
                🌙 触发周五深夜大逃杀
              </button>
              <button id="btn-ending-boss-mode" class="btn btn-secondary" style="border-color:#b91c1c; color:#fca5a5;">
                👑 换位扮演阎总抓逃兵
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

        <!-- Role Selection Modal -->
        <div id="role-modal" class="modal-backdrop hidden">
          <div class="modal-box role-box">
            <div class="modal-custom-header">
              <div>
                <h3>🎭 职场角色特质选择</h3>
                <span class="sub-hint">不同工种拥有独特被动特质、初始属性与对白分支</span>
              </div>
              <button id="btn-close-role" class="btn-icon" aria-label="关闭">&times;</button>
            </div>

            <div class="role-grid" id="role-grid">
              <!-- Dynamically rendered role cards -->
            </div>

            <div class="hardcore-toggle-bar">
              <label class="hardcore-label">
                <input type="checkbox" id="check-hardcore" />
                <span class="hardcore-text">🔥 开启【地狱加班修罗场】模式</span>
              </label>
              <span class="hardcore-tip">阎总提前查岗，初始怀疑度增高，全结算悟性 +80%！</span>
            </div>

            <div class="modal-footer">
              <button id="btn-confirm-role" class="btn btn-primary btn-block">
                🚀 以所选角色开始逃脱
              </button>
            </div>
          </div>
        </div>

        <!-- Talent Tree (Perks) Modal -->
        <div id="talent-modal" class="modal-backdrop hidden">
          <div class="modal-box talent-box">
            <div class="modal-custom-header">
              <div>
                <h3>🧬 摸鱼悟性与永久天赋树</h3>
                <span class="sub-hint">局内结算获得悟性，跨局永久点亮被动神技</span>
              </div>
              <button id="btn-close-talent" class="btn-icon" aria-label="关闭">&times;</button>
            </div>

            <div class="talent-balance-bar">
              <span>当前可用摸鱼悟性：</span>
              <span class="exp-counter" id="talent-exp-count">0 EXP</span>
            </div>

            <div class="talent-grid" id="talent-grid">
              <!-- Dynamically rendered perks -->
            </div>
          </div>
        </div>

        <!-- Changelog / Version Update Notice Modal -->
        <div id="changelog-modal" class="modal-backdrop hidden">
          <div class="modal-box changelog-box">
            <div class="changelog-header">
              <div class="changelog-title-group">
                <span class="changelog-icon">🎉</span>
                <div>
                  <h3 class="changelog-title">版本更新日志</h3>
                  <span class="changelog-badge">当前最新 v${CURRENT_VERSION} · 历史版本全览</span>
                </div>
              </div>
              <button id="btn-close-changelog" class="btn-icon" aria-label="关闭">&times;</button>
            </div>

            <div class="changelog-body" id="changelog-body-list">
              <!-- Dynamically populated from CHANGELOGS -->
            </div>

            <div class="changelog-footer">
              <button id="btn-confirm-changelog" class="btn-primary btn btn-block">
                🚀 我知道了，立刻体验！
              </button>
            </div>
          </div>
        </div>

        <!-- Gameplay Step-by-Step Guide Modal -->
        <div id="guide-modal" class="modal-backdrop hidden">
          <div class="modal-box guide-box">
            <div class="guide-header">
              <div class="guide-title-group">
                <span class="guide-icon">📖</span>
                <div>
                  <h3 class="guide-title">准点下班 · 逃脱行动向导</h3>
                  <span id="guide-step-counter-badge" class="guide-badge">步骤 1 / 8 · 终极目标</span>
                </div>
              </div>
              <button id="btn-close-guide" class="btn-icon" aria-label="关闭">&times;</button>
            </div>

            <!-- Stepper Tab Bar -->
            <div class="guide-stepper" id="guide-stepper">
              <!-- 5 step buttons rendered dynamically -->
            </div>

            <!-- Step Content Body -->
            <div class="guide-step-body" id="guide-step-body">
              <!-- Rendered dynamically -->
            </div>

            <!-- Step Navigation Controls -->
            <div class="guide-step-controls">
              <button id="btn-guide-prev" class="btn btn-secondary guide-nav-btn">
                ⬅️ 上一步
              </button>
              <div class="guide-step-dots" id="guide-step-dots">
                <!-- Dots rendered dynamically -->
              </div>
              <button id="btn-guide-next" class="btn btn-primary guide-nav-btn">
                下一步 ➡️
              </button>
            </div>

            <div class="guide-skip-bar">
              <button id="btn-guide-skip" class="guide-skip-link">跳过指引，直接开启逃脱</button>
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
              <button id="tab-endings" class="tab-btn active">结局图鉴 (<span id="unlocked-endings-count">0</span>/${Object.keys(ENDINGS).length})</button>
              <button id="tab-achievements" class="tab-btn">勋章成就 (<span id="unlocked-achievements-count">0</span>/${ACHIEVEMENTS.length})</button>
              <button id="tab-career" class="tab-btn">职场档案</button>
              <button id="tab-guide" class="tab-btn">📖 玩法指南</button>
            </div>
            <div class="archive-content" id="archive-content">
              <!-- Populated by tab selection -->
            </div>
          </div>
        </div>

        <!-- Custom Cyberpunk Restart Confirmation Modal -->
        <div id="restart-modal" class="modal-backdrop hidden" role="dialog" aria-modal="true" aria-labelledby="restart-modal-title">
          <div class="modal-box restart-modal-box slide-up">
            <div class="modal-header">
              <div class="modal-title-group">
                <span class="modal-avatar">🔄</span>
                <div>
                  <h3 class="modal-title" id="restart-modal-title">放弃进度 · 重新开始？</h3>
                  <span class="modal-subtitle">即将重置本轮局内时间与摸鱼状态</span>
                </div>
              </div>
              <button id="btn-close-restart-x" class="modal-close-btn" aria-label="关闭">&times;</button>
            </div>

            <div class="modal-body restart-modal-body">
              <div class="restart-info-card">
                <div class="restart-status-row">
                  <div class="restart-stat-item">
                    <span class="stat-lbl">当前时刻</span>
                    <strong class="stat-val text-warning" id="restart-curr-time">17:45</strong>
                  </div>
                  <div class="restart-stat-item">
                    <span class="stat-lbl">老板怀疑度</span>
                    <strong class="stat-val text-danger" id="restart-curr-susp">0%</strong>
                  </div>
                  <div class="restart-stat-item">
                    <span class="stat-lbl">已行动步数</span>
                    <strong class="stat-val text-info" id="restart-curr-turns">0 步</strong>
                  </div>
                </div>
                <p class="restart-desc">
                  重新开始将把当前时间重置回 <strong>17:45</strong>，背包道具与局内进度清空。
                </p>
                <div class="restart-safe-notice">
                  <span class="safe-badge">🛡️ 战绩保险</span>
                  <span>已解锁的结局图鉴、勋章成就与档案悟性将<strong>完整保留</strong>，不会丢失。</span>
                </div>
              </div>
            </div>

            <div class="modal-footer restart-modal-footer">
              <button id="btn-cancel-restart" class="btn btn-secondary">
                🏃 继续当前逃脱
              </button>
              <button id="btn-confirm-restart" class="btn btn-danger">
                🔄 确认重开新局
              </button>
            </div>
          </div>
        </div>

        <!-- Interactive UI Spotlight Tour Overlay -->
        <div id="tour-overlay" class="tour-overlay hidden" aria-modal="true" role="dialog">
          <div class="tour-backdrop" id="tour-backdrop"></div>
          <div id="tour-spotlight" class="tour-spotlight">
            <div class="tour-spotlight-pulse"></div>
          </div>
          <div id="tour-card" class="tour-card">
            <div class="tour-card-header">
              <div class="tour-step-badge">
                <span class="tour-step-icon" id="tour-card-icon">🕒</span>
                <span id="tour-card-step">步骤 1 / 7</span>
              </div>
              <button id="btn-tour-close" class="tour-btn-close" aria-label="关闭指引">&times;</button>
            </div>
            <div class="tour-card-body">
              <h3 class="tour-card-title" id="tour-card-title">当前时刻与下班倒计时</h3>
              <p class="tour-card-desc" id="tour-card-desc">描述内容</p>
              <div class="tour-card-tip" id="tour-card-tip">
                <span class="tour-tip-badge">💡 避坑秘诀</span>
                <span class="tour-tip-text" id="tour-tip-text">秘诀文本</span>
              </div>
            </div>
            <div class="tour-card-footer">
              <button id="btn-tour-prev" class="tour-btn tour-btn-secondary">上一步</button>
              <div class="tour-dots" id="tour-dots"></div>
              <button id="btn-tour-next" class="tour-btn tour-btn-primary">下一步 ➔</button>
            </div>
            <div class="tour-skip-bar">
              <button id="btn-tour-skip" class="tour-skip-link">跳过新手引导</button>
            </div>
          </div>
        </div>

        <!-- Cyber Bottom Navigation Bar -->
        <nav class="cyber-bottom-nav" id="cyber-bottom-nav" aria-label="底栏主导航">
          <button class="bottom-tab-btn active" data-tab="escape" id="nav-tab-escape" title="准点下班 · 现场突围">
            <span class="bottom-tab-icon">🏃</span>
            <span class="bottom-tab-label">现场突围</span>
          </button>
          <button class="bottom-tab-btn" data-tab="modes" id="nav-tab-modes" title="职场中心 · 阎总/逃杀/工坊/成就">
            <span class="bottom-tab-icon">🎛️</span>
            <span class="bottom-tab-label">职场中心</span>
          </button>
        </nav>
      </div>
    `;
  }

  bindGlobalEvents() {
    // Interactive UI Spotlight Tour Events
    document.getElementById('btn-tour-close')?.addEventListener('click', () => {
      this.closeTour();
    });
    document.getElementById('btn-tour-skip')?.addEventListener('click', () => {
      this.closeTour();
    });
    document.getElementById('btn-tour-prev')?.addEventListener('click', () => {
      this.prevTourStep();
    });
    document.getElementById('btn-tour-next')?.addEventListener('click', () => {
      this.nextTourStep();
    });
    document.getElementById('tour-backdrop')?.addEventListener('click', () => {
      this.nextTourStep();
    });

    // Header 📖 and quick buttons start the UI Tour!
    document.getElementById('btn-guide')?.addEventListener('click', () => {
      sound.playClick();
      this.startTour(0);
    });
    document.getElementById('btn-quick-guide')?.addEventListener('click', () => {
      sound.playClick();
      this.startTour(0);
    });
    document.getElementById('btn-step-guide-link')?.addEventListener('click', () => {
      sound.playClick();
      this.startTour(0);
    });

    // Keyboard navigation (Tour has priority, fallback to guide modal)
    window.addEventListener('keydown', (e) => {
      if (this.tourActive) {
        if (e.key === 'ArrowRight' || e.key === 'Enter') {
          e.preventDefault();
          this.nextTourStep();
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          this.prevTourStep();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          this.closeTour();
        }
        return;
      }

      if (guideModal && !guideModal.classList.contains('hidden')) {
        if (e.key === 'ArrowRight' || e.key === 'Enter') {
          e.preventDefault();
          this.nextGuideStep();
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          this.prevGuideStep();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          closeGuide();
        }
      }
    });

    // Changelog Notice (Auto-sync with CURRENT_VERSION) & First-time onboarding check
    const changelogModal = document.getElementById('changelog-modal');
    const savedVer = typeof localStorage !== 'undefined' ? localStorage.getItem('escape_work_changelog_ver') : null;
    const hasSeenTour = typeof localStorage !== 'undefined' ? localStorage.getItem('escape_work_has_seen_tour') : null;

    if (savedVer !== CURRENT_VERSION) {
      changelogModal.classList.remove('hidden');
    } else if (!hasSeenTour) {
      setTimeout(() => {
        this.startTour(0);
      }, 350);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('escape_work_has_seen_tour', 'true');
      }
    }

    const closeChangelog = () => {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('escape_work_changelog_ver', CURRENT_VERSION);
      }
      changelogModal.classList.add('hidden');
      if (!hasSeenTour) {
        setTimeout(() => {
          this.startTour(0);
        }, 350);
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('escape_work_has_seen_tour', 'true');
        }
      }
    };

    document.getElementById('btn-close-changelog').addEventListener('click', closeChangelog);
    document.getElementById('btn-confirm-changelog').addEventListener('click', closeChangelog);
    document.getElementById('btn-changelog').addEventListener('click', () => {
      sound.playClick();
      changelogModal.classList.remove('hidden');
    });

    // Sound & BGM toggles
    const btnSound = document.getElementById('btn-sound');
    const btnBgm = document.getElementById('btn-bgm');

    const updateBgmUI = (isPlaying = sound.bgmPlaying) => {
      if (!btnBgm) return;
      if (isPlaying) {
        btnBgm.classList.add('active');
        btnBgm.textContent = '🎶';
        btnBgm.title = '紧张氛围音乐：播放中 (点击关闭)';
        btnBgm.setAttribute('aria-label', '关闭背景氛围音乐');
      } else {
        btnBgm.classList.remove('active');
        btnBgm.textContent = '🎵';
        btnBgm.title = '紧张氛围音乐：已关闭 (点击开启)';
        btnBgm.setAttribute('aria-label', '开启背景氛围音乐');
      }
    };

    const updateSoundUI = () => {
      if (!btnSound) return;
      btnSound.textContent = sound.isMuted ? '🔇' : '🔊';
      btnSound.title = sound.isMuted ? '音效：已静音 (点击开启)' : '音效：已开启 (点击静音)';
      btnSound.setAttribute('aria-label', sound.isMuted ? '开启音效' : '关闭音效');
    };

    btnBgm?.addEventListener('click', () => {
      const isPlaying = sound.toggleBgm();
      updateBgmUI(isPlaying);
      updateSoundUI();
      toast.show(isPlaying ? '🎶 紧张下班倒计时氛围乐已开启' : '🎵 紧张氛围音乐已关闭', 'info');
    });

    btnSound?.addEventListener('click', () => {
      const isMuted = sound.toggleMute();
      updateSoundUI();
      updateBgmUI(sound.bgmPlaying);
      toast.show(isMuted ? '🔇 音效已静音' : '🔊 音效已开启', 'info');
    });

    // Initialize audio buttons state
    updateBgmUI(sound.bgmPlaying);
    updateSoundUI();

    // Custom Restart Confirmation Modal
    const restartModal = document.getElementById('restart-modal');
    const openRestartModal = () => {
      sound.playClick();
      const currTimeEl = document.getElementById('restart-curr-time');
      const currSuspEl = document.getElementById('restart-curr-susp');
      const currTurnsEl = document.getElementById('restart-curr-turns');
      if (currTimeEl) currTimeEl.textContent = this.state.getTimeString();
      if (currSuspEl) currSuspEl.textContent = `${Math.min(100, Math.max(0, this.state.suspicion))}%`;
      if (currTurnsEl) currTurnsEl.textContent = `${this.state.turns || 0} 步`;

      restartModal?.classList.remove('hidden');
    };

    const closeRestartModal = () => {
      sound.playClick();
      restartModal?.classList.add('hidden');
    };

    const confirmRestart = () => {
      sound.playClick();
      restartModal?.classList.add('hidden');
      document.getElementById('ending-modal')?.classList.add('hidden');
      document.getElementById('poster-modal')?.classList.add('hidden');
      document.getElementById('encounter-modal')?.classList.add('hidden');
      this.prevSusp = undefined;
      this.prevEnergy = undefined;
      this.prevTimeMinutes = undefined;
      this.engine.restart();
      toast.show('时间已重置为 17:45，新的一局开始！', 'info');
    };

    document.getElementById('btn-restart')?.addEventListener('click', openRestartModal);
    document.getElementById('btn-close-restart-x')?.addEventListener('click', closeRestartModal);
    document.getElementById('btn-cancel-restart')?.addEventListener('click', closeRestartModal);
    document.getElementById('btn-confirm-restart')?.addEventListener('click', confirmRestart);

    restartModal?.addEventListener('click', (e) => {
      if (e.target === restartModal) {
        closeRestartModal();
      }
    });

    document.getElementById('btn-ending-restart').addEventListener('click', () => {
      document.getElementById('ending-modal')?.classList.add('hidden');
      document.getElementById('poster-modal')?.classList.add('hidden');
      document.getElementById('encounter-modal')?.classList.add('hidden');
      this.prevSusp = undefined;
      this.prevEnergy = undefined;
      this.prevTimeMinutes = undefined;
      this.engine.restart();
      toast.show('时间已重置为 17:45，新的一局开始！', 'info');
    });

    // Ending modal change role button
    document.getElementById('btn-ending-role').addEventListener('click', () => {
      document.getElementById('ending-modal').classList.add('hidden');
      this.openRoleModal();
    });

    // Ending modal: trigger Overtime Nightmare
    document.getElementById('btn-ending-overtime')?.addEventListener('click', () => {
      document.getElementById('ending-modal')?.classList.add('hidden');
      sound.playClick();
      this.overtimeView.show();
    });

    // Ending modal: trigger Reverse Boss Mode
    document.getElementById('btn-ending-boss-mode')?.addEventListener('click', () => {
      document.getElementById('ending-modal')?.classList.add('hidden');
      sound.playClick();
      this.reverseBossView.show();
    });

    // Modes Hub Cards & Buttons
    const handleEnterBoss = () => {
      sound.playClick();
      this.reverseBossView?.show();
    };
    document.getElementById('card-mode-boss')?.addEventListener('click', handleEnterBoss);
    document.getElementById('btn-enter-boss')?.addEventListener('click', (e) => {
      e.stopPropagation();
      handleEnterBoss();
    });

    const handleEnterOvertime = () => {
      sound.playClick();
      this.overtimeView?.show();
    };
    document.getElementById('card-mode-overtime')?.addEventListener('click', handleEnterOvertime);
    document.getElementById('btn-enter-overtime')?.addEventListener('click', (e) => {
      e.stopPropagation();
      handleEnterOvertime();
    });

    const handleEnterWorkshop = () => {
      sound.playClick();
      this.craftModal?.show();
    };
    document.getElementById('card-mode-workshop')?.addEventListener('click', handleEnterWorkshop);
    document.getElementById('btn-enter-workshop')?.addEventListener('click', (e) => {
      e.stopPropagation();
      handleEnterWorkshop();
    });

    const handleEnterArchive = () => {
      sound.playClick();
      this.renderArchiveModal('endings');
      document.getElementById('archive-modal')?.classList.remove('hidden');
    };
    document.getElementById('card-mode-archive')?.addEventListener('click', handleEnterArchive);
    document.getElementById('btn-enter-archive')?.addEventListener('click', (e) => {
      e.stopPropagation();
      handleEnterArchive();
    });

    // Top Bar mode buttons
    document.getElementById('btn-boss-mode')?.addEventListener('click', () => {
      sound.playClick();
      this.reverseBossView?.show();
    });

    document.getElementById('btn-overtime-mode')?.addEventListener('click', () => {
      sound.playClick();
      this.overtimeView?.show();
    });

    // Role modal
    const roleModal = document.getElementById('role-modal');
    document.getElementById('btn-role')?.addEventListener('click', () => this.openRoleModal());
    document.getElementById('strip-role-chip')?.addEventListener('click', () => this.openRoleModal());
    document.getElementById('btn-close-role')?.addEventListener('click', () => {
      roleModal?.classList.add('hidden');
      this.updateBottomTabHighlight(this.activeBottomNavTab || 'escape');
    });

    document.getElementById('btn-confirm-role')?.addEventListener('click', () => {
      const selectedRadio = document.querySelector('input[name="role-select"]:checked');
      const roleId = selectedRadio ? selectedRadio.value : this.state.selectedRoleId;
      const isHardcore = document.getElementById('check-hardcore')?.checked;
      this.engine.restart(roleId, null, isHardcore);
      roleModal?.classList.add('hidden');
      this.updateBottomTabHighlight('escape');
      toast.show(`已化身【${CHARACTERS[roleId].name}】开启逃脱！`, 'success');
    });

    // Talent modal
    const talentModal = document.getElementById('talent-modal');
    document.getElementById('btn-talent')?.addEventListener('click', () => this.openTalentModal());
    document.getElementById('strip-exp-chip')?.addEventListener('click', () => this.openTalentModal());
    document.getElementById('btn-close-talent')?.addEventListener('click', () => {
      talentModal?.classList.add('hidden');
      this.updateBottomTabHighlight(this.activeBottomNavTab || 'escape');
    });

    // Craft modal
    document.getElementById('btn-craft')?.addEventListener('click', () => {
      sound.playClick();
      this.craftModal?.show();
    });
    document.getElementById('btn-quick-craft')?.addEventListener('click', () => {
      sound.playClick();
      this.craftModal?.show();
    });
    document.getElementById('btn-backpack-go-craft')?.addEventListener('click', () => {
      sound.playClick();
      this.craftModal?.show();
    });
    document.querySelectorAll('.recipe-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        sound.playClick();
        this.craftModal?.show();
      });
    });

    // Relation panel
    document.getElementById('btn-relation')?.addEventListener('click', () => {
      sound.playClick();
      this.relationPanel?.show();
    });

    // Daily Almanac modal
    document.getElementById('btn-daily')?.addEventListener('click', () => {
      this.openDailyModal();
    });

    // Archive Modal
    const archiveModal = document.getElementById('archive-modal');
    document.getElementById('btn-archive')?.addEventListener('click', () => {
      sound.playClick();
      this.renderArchiveModal('endings');
      archiveModal?.classList.remove('hidden');
    });

    document.getElementById('btn-close-archive')?.addEventListener('click', () => {
      archiveModal?.classList.add('hidden');
      this.updateBottomTabHighlight(this.activeBottomNavTab || 'escape');
    });

    document.getElementById('tab-endings').addEventListener('click', () => this.renderArchiveModal('endings'));
    document.getElementById('tab-achievements').addEventListener('click', () => this.renderArchiveModal('achievements'));
    document.getElementById('tab-career').addEventListener('click', () => this.renderArchiveModal('career'));
    document.getElementById('tab-guide')?.addEventListener('click', () => this.renderArchiveModal('guide'));

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
        const role = CHARACTERS[this.state.selectedRoleId];
        const text = `【准点下班大作战】我使用【${role.name}】达成了【${ending.title}】(${ending.rank}级评价)！\n办公区环境：${this.state.currentModifier?.name || '平静周五'}\n打卡时刻：${this.state.getTimeString()}\n老板怀疑度：${this.state.suspicion}%\n剩余精气神：${this.state.energy}%\n获得摸鱼悟性：+${this.state.earnedExp || 0} EXP\n“${ending.quote}”\n快来挑战不被老板发现的准点逃脱！`;
        navigator.clipboard.writeText(text).then(() => {
          toast.show('战绩文字已成功复制到剪贴板！', 'success');
        }).catch(() => {
          toast.show('复制失败，请手动截图分享', 'warning');
        });
      };
    });

    // View Tab Navigation events
    document.querySelectorAll('.view-tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        sound.playClick();
        const tab = btn.getAttribute('data-tab');
        this.setActiveTab(tab);
      });
    });

    document.getElementById('action-log-ticker')?.addEventListener('click', () => {
      sound.playClick();
      this.setActiveTab('log');
    });

    // Cyber Bottom Tab Navigation events
    document.querySelectorAll('.bottom-tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        this.switchBottomNavTab(tab);
      });
    });

    // Meta strip relation & weather chips
    document.getElementById('strip-relation-chip')?.addEventListener('click', () => {
      sound.playClick();
      this.relationPanel.show();
    });

    document.getElementById('strip-mod-chip')?.addEventListener('click', () => {
      this.openDailyModal();
    });
  }

  openRoleModal() {
    sound.playClick();
    const grid = document.getElementById('role-grid');
    const roles = Object.values(CHARACTERS);

    document.getElementById('check-hardcore').checked = this.state.isHardcore;

    grid.innerHTML = roles.map((role) => {
      const isSelected = role.id === this.state.selectedRoleId;
      return `
        <label class="role-card ${isSelected ? 'selected' : ''}" style="--role-accent: ${role.color}">
          <input type="radio" name="role-select" value="${role.id}" ${isSelected ? 'checked' : ''} class="role-radio" />
          <div class="role-top">
            <span class="role-avatar">${role.avatar}</span>
            <div class="role-name-box">
              <span class="role-name">${role.name}</span>
              <span class="role-title">${role.title}</span>
            </div>
          </div>
          <div class="role-desc">${role.description}</div>
          <div class="role-passive">
            <span class="passive-badge">${role.passiveTitle}</span>
            <span>${role.passiveDesc}</span>
          </div>
          <div class="role-stats">
            <span>⚡ 初始体力: ${role.baseEnergy}%</span>
            <span>👁️ 初始怀疑: ${role.baseSuspicion}%</span>
          </div>
        </label>
      `;
    }).join('');

    grid.querySelectorAll('.role-card').forEach((card) => {
      card.addEventListener('click', () => {
        grid.querySelectorAll('.role-card').forEach((c) => c.classList.remove('selected'));
        card.classList.add('selected');
        const radio = card.querySelector('input[type="radio"]');
        if (radio) radio.checked = true;
      });
    });

    document.getElementById('role-modal').classList.remove('hidden');
  }

  openTalentModal() {
    sound.playClick();
    this.renderTalentModal();
    document.getElementById('talent-modal').classList.remove('hidden');
  }

  renderTalentModal() {
    const expCountEl = document.getElementById('talent-exp-count');
    expCountEl.textContent = `${this.state.history.slackerExp || 0} EXP`;

    const grid = document.getElementById('talent-grid');
    const unlocked = this.state.history.unlockedPerks || [];
    const currentExp = this.state.history.slackerExp || 0;

    grid.innerHTML = PERKS.map((perk) => {
      const isUnlocked = unlocked.includes(perk.id);
      const canAfford = currentExp >= perk.cost;

      let btnHtml = '';
      if (isUnlocked) {
        btnHtml = '<span class="perk-badge-unlocked">✅ 已永久领悟</span>';
      } else if (canAfford) {
        btnHtml = `<button class="btn-unlock-perk" data-perk="${perk.id}">点亮 (${perk.cost} EXP)</button>`;
      } else {
        btnHtml = `<span class="perk-badge-locked">需 ${perk.cost} EXP</span>`;
      }

      return `
        <div class="perk-card ${isUnlocked ? 'perk-active' : ''}">
          <div class="perk-top">
            <span class="perk-icon">${perk.icon}</span>
            <div class="perk-info">
              <span class="perk-name">${perk.name}</span>
              <span class="perk-effect">${perk.effectText}</span>
            </div>
          </div>
          <div class="perk-desc">${perk.description}</div>
          <div class="perk-action">${btnHtml}</div>
        </div>
      `;
    }).join('');

    grid.querySelectorAll('.btn-unlock-perk').forEach((btn) => {
      btn.addEventListener('click', () => {
        const perkId = btn.getAttribute('data-perk');
        sound.playItem();
        const res = this.state.unlockPerk(perkId);
        if (res.success) {
          toast.show(res.message, 'success');
          this.renderTalentModal();
        } else {
          toast.show(res.message, 'warning');
        }
      });
    });
  }

  renderChangelogModal() {
    const listEl = document.getElementById('changelog-body-list');
    if (!listEl) return;
    listEl.innerHTML = CHANGELOGS.map((ver) => `
      <section class="changelog-section">
        <div class="changelog-version-header ${ver.isLatest ? 'latest' : ''}">
          <div class="version-left">
            <span class="version-tag">v${ver.version}</span>
            <span class="version-pill ${ver.isLatest ? 'latest' : ''}">${ver.badge}</span>
            <span class="version-title">${ver.title}</span>
          </div>
          <span class="version-date">${ver.date}</span>
        </div>
        ${ver.items.map((item) => `
          <div class="changelog-item">
            <div class="changelog-item-title">${item.title}</div>
            <div class="changelog-item-desc">${item.desc}</div>
          </div>
        `).join('')}
      </section>
    `).join('');
  }

  startTour(initialStep = 0) {
    sound.playClick();
    this.tourActive = true;
    this.currentTourStep = initialStep;
    const overlay = document.getElementById('tour-overlay');
    if (!overlay) return;
    overlay.classList.remove('hidden');

    window.removeEventListener('resize', this.onTourWindowUpdate);
    window.removeEventListener('scroll', this.onTourWindowUpdate);
    window.addEventListener('resize', this.onTourWindowUpdate);
    window.addEventListener('scroll', this.onTourWindowUpdate, { passive: true });

    this.renderTourStep(initialStep);
  }

  closeTour() {
    if (!this.tourActive) return;
    this.tourActive = false;
    const overlay = document.getElementById('tour-overlay');
    if (overlay) overlay.classList.add('hidden');

    window.removeEventListener('resize', this.onTourWindowUpdate);
    window.removeEventListener('scroll', this.onTourWindowUpdate);

    this.switchBottomNavTab('escape', false);
    this.setActiveTab('action');

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('escape_work_has_seen_tour', 'true');
    }
  }

  nextTourStep() {
    if (this.currentTourStep < INTERACTIVE_TOUR_STEPS.length - 1) {
      this.goToTourStep(this.currentTourStep + 1);
    } else {
      this.closeTour();
      sound.playClick();
      toast.show('🎉 新手全流程指引完成，祝你准点逃脱！', 'success');
    }
  }

  prevTourStep() {
    if (this.currentTourStep > 0) {
      this.goToTourStep(this.currentTourStep - 1);
    }
  }

  goToTourStep(index) {
    if (index < 0 || index >= INTERACTIVE_TOUR_STEPS.length) return;
    sound.playClick();
    this.currentTourStep = index;
    this.renderTourStep(index);
  }

  getTourTargetElement(selector) {
    if (!selector) return null;
    const candidates = document.querySelectorAll(selector);
    for (const el of candidates) {
      const r = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      if (r.width > 0 && r.height > 0 && style.display !== 'none' && style.visibility !== 'hidden') {
        return el;
      }
    }
    return candidates.length > 0 ? candidates[0] : null;
  }

  renderTourStep(index) {
    const step = INTERACTIVE_TOUR_STEPS[index];
    if (!step) return;

    // Automatically switch the user to the corresponding tab & view!
    if (step.step === 4) {
      this.switchBottomNavTab('modes', false);
    } else {
      this.switchBottomNavTab('escape', false);
      if (step.step === 3 || step.step === 5) {
        this.setActiveTab('map');
      } else if (step.step === 8) {
        this.setActiveTab('backpack');
      } else {
        this.setActiveTab('action');
      }
    }

    // 1. Update text & metadata
    const iconEl = document.getElementById('tour-card-icon');
    const stepEl = document.getElementById('tour-card-step');
    const titleEl = document.getElementById('tour-card-title');
    const descEl = document.getElementById('tour-card-desc');
    const tipEl = document.getElementById('tour-tip-text');

    if (iconEl) iconEl.textContent = step.icon;
    if (stepEl) stepEl.textContent = step.badge;
    if (titleEl) titleEl.textContent = step.title;
    if (descEl) descEl.textContent = step.desc;
    if (tipEl) tipEl.textContent = step.tip;

    // 2. Update prev/next buttons
    const prevBtn = document.getElementById('btn-tour-prev');
    if (prevBtn) {
      if (index === 0) {
        prevBtn.classList.add('disabled');
        prevBtn.disabled = true;
      } else {
        prevBtn.classList.remove('disabled');
        prevBtn.disabled = false;
      }
    }

    const nextBtn = document.getElementById('btn-tour-next');
    if (nextBtn) {
      if (index === INTERACTIVE_TOUR_STEPS.length - 1) {
        nextBtn.textContent = '🎉 开启下班逃脱！';
        nextBtn.className = 'tour-btn tour-btn-primary tour-btn-finish';
      } else {
        nextBtn.textContent = '下一步 ➔';
        nextBtn.className = 'tour-btn tour-btn-primary';
      }
    }

    // 3. Update step dots
    const dotsEl = document.getElementById('tour-dots');
    if (dotsEl) {
      dotsEl.innerHTML = INTERACTIVE_TOUR_STEPS.map((_, i) => `
        <button class="tour-dot ${i === index ? 'active' : ''}" data-tdot="${i}" aria-label="第 ${i + 1} 步"></button>
      `).join('');

      dotsEl.querySelectorAll('.tour-dot').forEach((dot) => {
        dot.addEventListener('click', (e) => {
          e.stopPropagation();
          const targetIdx = parseInt(dot.getAttribute('data-tdot'), 10);
          this.goToTourStep(targetIdx);
        });
      });
    }

    // 4. Scroll target into view (if not fixed) & update spotlight box & card
    const targetEl = this.getTourTargetElement(step.selector);
    if (targetEl) {
      const style = window.getComputedStyle(targetEl);
      if (style.position !== 'fixed') {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    this.updateTourPositions();
    setTimeout(() => this.updateTourPositions(), 80);
    setTimeout(() => this.updateTourPositions(), 220);
    setTimeout(() => this.updateTourPositions(), 360);
  }

  updateTourPositions() {
    if (!this.tourActive) return;
    const step = INTERACTIVE_TOUR_STEPS[this.currentTourStep];
    if (!step) return;

    const targetEl = this.getTourTargetElement(step.selector);
    const spotlight = document.getElementById('tour-spotlight');
    const cardEl = document.getElementById('tour-card');
    if (!spotlight || !cardEl) return;

    if (!targetEl) {
      spotlight.style.opacity = '0';
      return;
    }

    const rect = targetEl.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      spotlight.style.opacity = '0';
      return;
    }

    const padding = step.padding || 8;

    const top = Math.max(2, rect.top - padding);
    const left = Math.max(2, rect.left - padding);
    const width = Math.min(window.innerWidth - left - 4, rect.width + padding * 2);
    const height = Math.min(window.innerHeight - top - 2, rect.height + padding * 2);

    spotlight.style.opacity = '1';
    spotlight.style.top = `${Math.round(top)}px`;
    spotlight.style.left = `${Math.round(left)}px`;
    spotlight.style.width = `${Math.round(width)}px`;
    spotlight.style.height = `${Math.round(height)}px`;

    // Position floating card
    const cardRect = cardEl.getBoundingClientRect();
    const cardHeight = cardRect.height || 260;
    const cardWidth = cardRect.width || Math.min(390, window.innerWidth - 28);
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    let cardTop;
    const spaceBelow = viewportHeight - (top + height);
    const spaceAbove = top;

    if (spaceBelow >= cardHeight + 16) {
      cardTop = top + height + 10;
    } else if (spaceAbove >= cardHeight + 16) {
      cardTop = top - cardHeight - 10;
    } else {
      if (spaceBelow > spaceAbove) {
        cardTop = Math.max(10, viewportHeight - cardHeight - 14);
      } else {
        cardTop = 14;
      }
    }

    let cardLeft = left + width / 2 - cardWidth / 2;
    cardLeft = Math.max(12, Math.min(viewportWidth - cardWidth - 12, cardLeft));

    cardEl.style.top = `${Math.round(cardTop)}px`;
    cardEl.style.left = `${Math.round(cardLeft)}px`;
  }

  openGuideModal(stepOrId = 0) {
    sound.playClick();
    let index = 0;
    if (typeof stepOrId === 'number') {
      index = Math.max(0, Math.min(TUTORIAL_STEPS.length - 1, stepOrId));
    } else if (typeof stepOrId === 'string') {
      const foundIdx = TUTORIAL_STEPS.findIndex((s) => s.id === stepOrId);
      if (foundIdx !== -1) index = foundIdx;
    }
    this.guideCurrentStep = index;
    this.renderGuideModal(index);
    document.getElementById('guide-modal').classList.remove('hidden');
  }

  goToGuideStep(index) {
    if (index < 0 || index >= TUTORIAL_STEPS.length) return;
    sound.playClick();
    this.guideCurrentStep = index;
    this.renderGuideModal(index);
  }

  nextGuideStep() {
    if (this.guideCurrentStep < TUTORIAL_STEPS.length - 1) {
      this.goToGuideStep(this.guideCurrentStep + 1);
    } else {
      sound.playClick();
      document.getElementById('guide-modal').classList.add('hidden');
      toast.show('已掌握准点下班秘诀，祝你顺利出逃！', 'success');
    }
  }

  prevGuideStep() {
    if (this.guideCurrentStep > 0) {
      this.goToGuideStep(this.guideCurrentStep - 1);
    }
  }

  renderGuideModal(stepIndex = 0) {
    const step = TUTORIAL_STEPS[stepIndex] || TUTORIAL_STEPS[0];
    const counterBadge = document.getElementById('guide-step-counter-badge');
    if (counterBadge) {
      counterBadge.textContent = `步骤 ${step.step} / ${TUTORIAL_STEPS.length} · ${step.shortTitle}`;
    }

    // Stepper Pills
    const stepperEl = document.getElementById('guide-stepper');
    if (stepperEl) {
      stepperEl.innerHTML = TUTORIAL_STEPS.map((s, i) => `
        <button class="guide-step-pill ${i === stepIndex ? 'active' : ''} ${i < stepIndex ? 'completed' : ''}" data-gstep="${i}">
          <span class="pill-num">${i + 1}</span>
          <span class="pill-name">${s.shortTitle}</span>
        </button>
      `).join('');

      stepperEl.querySelectorAll('.guide-step-pill').forEach((btn) => {
        btn.addEventListener('click', () => {
          const targetIdx = parseInt(btn.getAttribute('data-gstep'), 10);
          this.goToGuideStep(targetIdx);
        });
      });
    }

    // Step Card Content
    const bodyEl = document.getElementById('guide-step-body');
    if (bodyEl) {
      bodyEl.innerHTML = `
        <div class="guide-step-hero">
          <span class="guide-step-icon">${step.icon}</span>
          <div class="guide-step-headings">
            <span class="guide-step-tag">${step.tag}</span>
            <h4 class="guide-step-title">${step.title}</h4>
            <div class="guide-step-subtitle">${step.subtitle}</div>
          </div>
        </div>

        <div class="guide-step-highlights">
          ${step.highlights.map((h) => `
            <div class="guide-highlight-card">
              <span class="hl-card-icon">${h.icon}</span>
              <div class="hl-card-text">
                <span class="hl-card-title">${h.title}</span>
                <span class="hl-card-desc">${h.desc}</span>
              </div>
            </div>
          `).join('')}
        </div>

        <div class="guide-step-protip">
          <span class="protip-badge">💡 避坑指南</span>
          <span class="protip-text">${step.proTip}</span>
        </div>
      `;
    }

    // Dots
    const dotsEl = document.getElementById('guide-step-dots');
    if (dotsEl) {
      dotsEl.innerHTML = TUTORIAL_STEPS.map((_, i) => `
        <button class="guide-dot ${i === stepIndex ? 'active' : ''}" data-gdot="${i}" aria-label="第 ${i + 1} 步"></button>
      `).join('');

      dotsEl.querySelectorAll('.guide-dot').forEach((dot) => {
        dot.addEventListener('click', () => {
          const targetIdx = parseInt(dot.getAttribute('data-gdot'), 10);
          this.goToGuideStep(targetIdx);
        });
      });
    }

    // Prev & Next Buttons
    const prevBtn = document.getElementById('btn-guide-prev');
    if (prevBtn) {
      if (stepIndex === 0) {
        prevBtn.classList.add('disabled');
        prevBtn.disabled = true;
      } else {
        prevBtn.classList.remove('disabled');
        prevBtn.disabled = false;
      }
    }

    const nextBtn = document.getElementById('btn-guide-next');
    if (nextBtn) {
      if (stepIndex === TUTORIAL_STEPS.length - 1) {
        nextBtn.innerHTML = '🚀 我懂了，立即出发！';
        nextBtn.className = 'btn btn-primary guide-nav-btn guide-nav-finish';
      } else {
        nextBtn.innerHTML = '下一步 ➡️';
        nextBtn.className = 'btn btn-primary guide-nav-btn';
      }
    }
  }

  renderTacticalStepBar() {
    const barEl = document.getElementById('tactical-step-bar');
    const badgeEl = document.getElementById('tactical-step-badge');
    const textEl = document.getElementById('tactical-step-text');
    if (!barEl || !badgeEl || !textEl) return;

    let badgeText = '';
    let hintText = '';
    let isUrgent = false;

    if (this.state.suspicion >= 75) {
      badgeText = '🚨 怀疑警报';
      hintText = `阎总怀疑度已达 ${this.state.suspicion}%！建议立即使用防监控道具或转入隐蔽通道！`;
      isUrgent = true;
    } else if (this.state.energy <= 20) {
      badgeText = '🪫 体力虚脱';
      hintText = `剩余体力仅 ${this.state.energy}%！务必去茶水间或洗手间回血，严防工位瘫倒！`;
      isUrgent = true;
    } else if (this.state.zone === 4 && (this.state.currentHour < 18 || (this.state.currentHour === 17 && this.state.currentMinute < 60))) {
      badgeText = '🛑 考勤铁律';
      hintText = '未满 18:00 切勿早退冲卡！点击【⏱️ 闸机旁掐表读秒】稳到 18:00 整再刷脸！';
      isUrgent = true;
    } else if (this.state.zone === 4 && this.state.currentHour >= 18) {
      badgeText = '🎉 下班时间到！';
      hintText = '✅ 已达 18:00 下班时刻！立即进行【⏱️ 毫秒压线打卡】或【📸 人脸识别打卡】冲出大门！';
      isUrgent = false;
    } else {
      const tipData = ZONE_STEP_TIPS[this.state.zone] || ZONE_STEP_TIPS[1];
      badgeText = tipData.stepNum;
      hintText = tipData.tip;
    }

    badgeEl.textContent = badgeText;
    textEl.textContent = hintText;

    if (isUrgent) {
      barEl.classList.add('tactical-urgent');
    } else {
      barEl.classList.remove('tactical-urgent');
    }
  }

  render() {
    this.renderHeaderAndMetrics();
    this.renderMetaStrip();
    this.renderRadarView();
    this.renderZoneNavigator();
    this.renderTacticalStepBar();
    this.renderMapView();
    this.renderSceneInfo();
    this.renderRouteAdvanceSection();
    this.renderActionButtons();
    this.renderBackpack();
    this.renderLogs();
    this.renderModals();
    this.updateTabBadges();
    this.syncActiveTabUI();
  }

  switchBottomNavTab(tabId, playAudio = true) {
    if (playAudio) sound.playClick();
    this.activeBottomNavTab = tabId;

    const escapeView = document.getElementById('escape-view-container');
    const modesHub = document.getElementById('modes-hub-container');

    if (tabId === 'escape') {
      if (escapeView) escapeView.classList.remove('hidden');
      if (modesHub) modesHub.classList.add('hidden');
      this.reverseBossView?.hide();
      this.overtimeView?.hide();
      this.craftModal?.close();
      document.getElementById('archive-modal')?.classList.add('hidden');
      document.getElementById('role-modal')?.classList.add('hidden');
      document.getElementById('talent-modal')?.classList.add('hidden');
    } else if (tabId === 'modes') {
      if (escapeView) escapeView.classList.add('hidden');
      if (modesHub) modesHub.classList.remove('hidden');
      this.updateModesHubStats();
      this.reverseBossView?.hide();
      this.overtimeView?.hide();
      this.craftModal?.close();
      document.getElementById('archive-modal')?.classList.add('hidden');
      document.getElementById('role-modal')?.classList.add('hidden');
      document.getElementById('talent-modal')?.classList.add('hidden');
    } else if (tabId === 'boss') {
      this.switchBottomNavTab('modes', false);
      this.reverseBossView?.show();
      return;
    } else if (tabId === 'overtime') {
      this.switchBottomNavTab('modes', false);
      this.overtimeView?.show();
      return;
    } else if (tabId === 'workshop') {
      this.switchBottomNavTab('modes', false);
      this.craftModal?.show();
      return;
    } else if (tabId === 'archive') {
      this.switchBottomNavTab('modes', false);
      this.renderArchiveModal('endings');
      document.getElementById('archive-modal')?.classList.remove('hidden');
      return;
    }

    this.updateBottomTabHighlight(tabId);
  }

  updateModesHubStats() {
    const archiveCounter = document.getElementById('hub-archive-counter');
    if (archiveCounter) {
      const unlockedEndings = this.state.unlockedEndings ? this.state.unlockedEndings.length : 0;
      const totalEndings = Object.keys(ENDINGS).length;
      const unlockedAchievements = this.state.unlockedAchievements ? this.state.unlockedAchievements.length : 0;
      const totalAchievements = ACHIEVEMENTS.length;
      archiveCounter.textContent = `🏆 结局 ${unlockedEndings}/${totalEndings} · 勋章 ${unlockedAchievements}/${totalAchievements}`;
    }
  }

  updateBottomTabHighlight(tabId) {
    this.activeBottomNavTab = tabId;
    const tabBtns = document.querySelectorAll('.bottom-tab-btn');
    tabBtns.forEach((btn) => {
      const isMatch = btn.getAttribute('data-tab') === tabId;
      btn.classList.toggle('active', isMatch);
    });
  }

  setActiveTab(tabName) {
    if (tabName === 'radar') tabName = 'map';
    this.activeTab = tabName;
    this.syncActiveTabUI();
    if (this.tourActive) {
      this.updateTourPositions();
    }
  }

  syncActiveTabUI() {
    const currentTab = this.activeTab || 'action';
    const tabBtns = document.querySelectorAll('.view-tab-btn');
    tabBtns.forEach((btn) => {
      const tab = btn.getAttribute('data-tab');
      if (tab === currentTab) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    const panels = document.querySelectorAll('.view-tab-panel');
    panels.forEach((panel) => {
      const panelName = panel.getAttribute('data-panel');
      if (currentTab === 'all') {
        panel.classList.remove('panel-hidden');
      } else if (panelName === currentTab) {
        panel.classList.remove('panel-hidden');
      } else {
        panel.classList.add('panel-hidden');
      }
    });
  }

  updateTabBadges() {
    const mapBadge = document.getElementById('map-avail-badge');
    if (mapBadge && this.state.mapGraph) {
      let availCount = 0;
      this.state.mapGraph.forEach((layer) => {
        layer.forEach((node) => {
          if (node.isAvailable) availCount++;
        });
      });
      if (availCount > 0) {
        mapBadge.textContent = `${availCount}可选`;
        mapBadge.classList.remove('hidden');
      } else {
        mapBadge.classList.add('hidden');
      }
    }

    const backpackBadge = document.getElementById('backpack-tab-badge');
    if (backpackBadge) {
      const count = this.state.inventory ? this.state.inventory.length : 0;
      backpackBadge.textContent = count;
      if (count > 0) {
        backpackBadge.classList.remove('hidden');
      } else {
        backpackBadge.classList.add('hidden');
      }
    }

    const logPreview = document.getElementById('action-log-preview');
    const ticker = document.getElementById('action-log-ticker');
    if (logPreview && this.state.logs && this.state.logs.length > 0) {
      const latest = this.state.logs[0];
      const newText = `[${latest.time}] ${latest.text}`;
      if (this.lastLogText !== newText) {
        logPreview.textContent = newText;
        if (ticker) {
          ticker.classList.remove('ticker-flash-alert', 'ticker-flash-warning', 'ticker-flash-info');
          void ticker.offsetWidth;
          if (latest.type === 'alert' || latest.type === 'warning') {
            ticker.classList.add(`ticker-flash-${latest.type}`);
          } else {
            ticker.classList.add('ticker-flash-info');
          }
        }
        this.lastLogText = newText;
      }
    }
  }

  renderRadarView() {
    const slot = document.getElementById('radar-slot');
    if (slot && this.radarView) {
      slot.innerHTML = this.radarView.render();
      this.radarView.bindEvents(slot);
    }
  }

  renderMapView() {
    const slot = document.getElementById('map-view-slot');
    if (slot && this.mapView) {
      slot.innerHTML = this.mapView.render();
      this.mapView.bindEvents(slot);
    }
  }

  openDailyModal() {
    sound.playClick();
    const almanac = DailySystem.generateDailyAlmanac(DailySystem.getTodayDateString());
    const isTodaySeeded = this.state.dailySeed === almanac.date;

    const overlay = document.createElement('div');
    overlay.className = 'modal-backdrop fade-in';
    overlay.id = 'daily-modal-overlay';

    const highScores = this.state.history.dailyHighScores || {};
    const todayHighScore = highScores[almanac.date] || 0;

    overlay.innerHTML = `
      <div class="modal-card daily-modal-card slide-up">
        <div class="modal-header">
          <div class="modal-title-group">
            <span class="modal-icon">📅</span>
            <div>
              <h3 class="modal-title">每日职场黄历 · 天梯挑战</h3>
              <span class="modal-subtitle">全球统一种子 · 每日专属运势词缀与排行</span>
            </div>
          </div>
          <button class="modal-close-btn" id="daily-close">&times;</button>
        </div>

        <div class="modal-body">
          <div class="daily-almanac-banner">
            <span class="daily-almanac-date">公历 ${almanac.date} · 今日种子 [${almanac.seed}]</span>
            <p class="daily-almanac-quote">${almanac.lunarQuote}</p>
          </div>

          <div class="daily-good-bad-grid">
            <div class="daily-card-good">
              <strong class="good-title">${almanac.good.name}</strong>
              <p class="good-desc">${almanac.good.desc}</p>
            </div>
            <div class="daily-card-bad">
              <strong class="bad-title">${almanac.bad.name}</strong>
              <p class="bad-desc">${almanac.bad.desc}</p>
            </div>
          </div>

          <div class="daily-ladder-section">
            <div class="daily-ladder-title">🏆 今日挑战最高得分记录</div>
            <div class="daily-ladder-table">
              <div class="ladder-row">
                <span>🥇 本机历史最佳 (${almanac.date})</span>
                <strong style="color:#fbbf24;">${todayHighScore > 0 ? `${todayHighScore} 分` : '暂未挑战'}</strong>
              </div>
              <div class="ladder-row">
                <span>🥈 社区标杆榜 (Top 1%)</span>
                <strong style="color:#38bdf8;">2,450 分</strong>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button id="btn-start-daily-run" class="btn btn-primary btn-block">
            ${isTodaySeeded ? '🔄 重新挑战今日黄历关卡' : '🚀 立即开启今日黄历挑战 (统一随机种子)'}
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const close = () => {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    };

    overlay.querySelector('#daily-close').addEventListener('click', close);
    overlay.addEventListener('click', (e) => {
      if (e.target.id === 'daily-modal-overlay') close();
    });

    overlay.querySelector('#btn-start-daily-run').addEventListener('click', () => {
      close();
      this.state.dailySeed = almanac.date;
      this.engine.restart(this.state.selectedRoleId, null, this.state.isHardcore);
      toast.show(`已载入今日黄历种子 [${almanac.date}]！开启挑战！`, 'success');
    });
  }

  renderMetaStrip() {
    const role = CHARACTERS[this.state.selectedRoleId] || CHARACTERS.backend_dev;
    document.getElementById('meta-role-avatar').textContent = role.avatar;
    document.getElementById('meta-role-name').textContent = role.name;

    const mod = this.state.currentModifier;
    document.getElementById('meta-mod-icon').textContent = mod?.icon || '☀️';
    document.getElementById('meta-mod-name').textContent = mod?.name || '平静周五';

    document.getElementById('meta-exp-val').textContent = `${this.state.history.slackerExp || 0} 悟性`;

    const hcTag = document.getElementById('strip-hardcore-tag');
    if (this.state.isHardcore) {
      hcTag.classList.remove('hidden');
    } else {
      hcTag.classList.add('hidden');
    }
  }

  renderHeaderAndMetrics() {
    // 1. Time display
    const timeStr = this.state.getTimeString();
    const timeDisplayEl = document.getElementById('time-display');
    const timeDeltaEl = document.getElementById('time-delta');
    if (timeDisplayEl) timeDisplayEl.textContent = timeStr;

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

    if (this.prevTimeMinutes !== undefined && totalMinutes !== this.prevTimeMinutes) {
      const minDiff = totalMinutes - this.prevTimeMinutes;
      if (minDiff > 0 && timeDeltaEl && timeDisplayEl) {
        timeDeltaEl.textContent = `+${minDiff}分`;
        timeDeltaEl.className = 'stat-delta-chip delta-time';
        timeDeltaEl.classList.remove('hidden');
        timeDisplayEl.classList.remove('stat-flash-time');
        void timeDisplayEl.offsetWidth;
        timeDisplayEl.classList.add('stat-flash-time');
        clearTimeout(this.timeDeltaTimer);
        this.timeDeltaTimer = setTimeout(() => {
          timeDeltaEl?.classList.add('hidden');
        }, 2200);
      }
    }
    this.prevTimeMinutes = totalMinutes;

    // 2. Suspicion Bar
    const susp = Math.min(100, Math.max(0, this.state.suspicion));
    const suspText = document.getElementById('suspicion-text');
    const suspBar = document.getElementById('suspicion-bar');
    const suspDeltaEl = document.getElementById('suspicion-delta');
    const suspItemEl = document.getElementById('metric-item-suspicion');
    if (suspText) suspText.textContent = `${susp}%`;
    if (suspBar) suspBar.style.width = `${susp}%`;

    if (suspBar && suspText) {
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
    }

    if (this.prevSusp !== undefined && this.prevSusp !== susp) {
      const suspDiff = susp - this.prevSusp;
      if (suspDeltaEl && suspText) {
        if (suspDiff > 0) {
          suspDeltaEl.textContent = `+${suspDiff}%`;
          suspDeltaEl.className = 'stat-delta-chip delta-danger';
          suspDeltaEl.classList.remove('hidden');
          suspText.classList.remove('stat-flash-danger', 'stat-flash-safe');
          void suspText.offsetWidth;
          suspText.classList.add('stat-flash-danger');
          suspItemEl?.classList.remove('box-pulse-danger', 'box-pulse-safe');
          void suspItemEl?.offsetWidth;
          suspItemEl?.classList.add('box-pulse-danger');
        } else {
          suspDeltaEl.textContent = `${suspDiff}%`;
          suspDeltaEl.className = 'stat-delta-chip delta-safe';
          suspDeltaEl.classList.remove('hidden');
          suspText.classList.remove('stat-flash-danger', 'stat-flash-safe');
          void suspText.offsetWidth;
          suspText.classList.add('stat-flash-safe');
          suspItemEl?.classList.remove('box-pulse-danger', 'box-pulse-safe');
          void suspItemEl?.offsetWidth;
          suspItemEl?.classList.add('box-pulse-safe');
        }
        clearTimeout(this.suspDeltaTimer);
        this.suspDeltaTimer = setTimeout(() => {
          suspDeltaEl?.classList.add('hidden');
        }, 2500);
      }
    }
    this.prevSusp = susp;

    // 3. Energy Bar
    const energy = Math.min(100, Math.max(0, this.state.energy));
    const energyText = document.getElementById('energy-text');
    const energyBar = document.getElementById('energy-bar');
    const energyDeltaEl = document.getElementById('energy-delta');
    const energyItemEl = document.getElementById('metric-item-energy');
    if (energyText) energyText.textContent = `${energy}%`;
    if (energyBar) energyBar.style.width = `${energy}%`;

    if (this.prevEnergy !== undefined && this.prevEnergy !== energy) {
      const energyDiff = energy - this.prevEnergy;
      if (energyDeltaEl && energyText) {
        if (energyDiff > 0) {
          energyDeltaEl.textContent = `+${energyDiff}`;
          energyDeltaEl.className = 'stat-delta-chip delta-safe';
          energyDeltaEl.classList.remove('hidden');
          energyText.classList.remove('stat-flash-safe', 'stat-flash-danger');
          void energyText.offsetWidth;
          energyText.classList.add('stat-flash-safe');
          energyItemEl?.classList.remove('box-pulse-safe', 'box-pulse-danger');
          void energyItemEl?.offsetWidth;
          energyItemEl?.classList.add('box-pulse-safe');
        } else {
          energyDeltaEl.textContent = `${energyDiff}`;
          energyDeltaEl.className = 'stat-delta-chip delta-danger';
          energyDeltaEl.classList.remove('hidden');
          energyText.classList.remove('stat-flash-safe', 'stat-flash-danger');
          void energyText.offsetWidth;
          energyText.classList.add('stat-flash-danger');
          energyItemEl?.classList.remove('box-pulse-safe', 'box-pulse-danger');
          void energyItemEl?.offsetWidth;
          energyItemEl?.classList.add('box-pulse-danger');
        }
        clearTimeout(this.energyDeltaTimer);
        this.energyDeltaTimer = setTimeout(() => {
          energyDeltaEl?.classList.add('hidden');
        }, 2500);
      }
    }
    this.prevEnergy = energy;
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
    const currentNode = MapManager.findNode(this.state.mapGraph, this.state.currentMapNodeId);

    document.getElementById('scene-icon').textContent = currentNode?.icon || currentZone.icon;
    document.getElementById('scene-title').textContent = currentZone.name;
    document.getElementById('scene-sub').textContent = currentNode
      ? `${currentNode.title} · ${this.state.getTimeString()}`
      : currentZone.title;

    const baseDesc = currentZone.description;
    const nodeNarrative = currentNode?.desc ? `【当前探索点 · ${currentNode.title}】：${currentNode.desc}` : '';
    document.getElementById('scene-desc').textContent = nodeNarrative ? `${baseDesc} ${nodeNarrative}` : baseDesc;

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

  renderRouteAdvanceSection() {
    const container = document.getElementById('route-advance-section');
    if (!container) return;

    const mapGraph = this.state.mapGraph;
    if (!mapGraph) {
      container.innerHTML = '';
      return;
    }

    const currentNodeId = this.state.currentMapNodeId;
    const availableNextNodes = MapManager.getAvailableNextNodes(mapGraph, currentNodeId);
    const nextZoneMeta = ZONES.find((z) => z.id === this.state.zone + 1);

    if (this.state.zone >= 4 && availableNextNodes.length === 0) {
      container.innerHTML = `
        <div class="route-advance-card final-gate-card">
          <div class="route-advance-header">
            <div class="route-title-box">
              <span class="route-header-icon">🏁</span>
              <div>
                <h4 class="route-header-title">逃生最终关口 · 一楼大堂闸机</h4>
                <span class="route-header-sub">已突破全段拓扑逃脱路线！请在下方【战术抉择】中打卡冲关；未满 18:00 请先掐表读秒！</span>
              </div>
            </div>
            <button class="btn-jump-to-map" id="btn-quick-map-link" title="查看已走过的逃脱路线拓扑">
              🗺️ 逃脱路线 ➔
            </button>
          </div>
        </div>
      `;
    } else if (availableNextNodes.length > 0) {
      container.innerHTML = `
        <div class="route-advance-card">
          <div class="route-advance-header">
            <div class="route-title-box">
              <span class="route-header-icon">🗺️</span>
              <div>
                <h4 class="route-header-title">突围路线分支 · 前往下一区域${nextZoneMeta ? ` (${nextZoneMeta.name})` : ''}</h4>
                <span class="route-header-sub">选择前进路线直接切入目标场景，获得专属物资/回血/密道增益并同步逃脱路线</span>
              </div>
            </div>
            <button class="btn-jump-to-map" id="btn-quick-map-link" title="在拓扑图中查看全局所有分支">
              🗺️ 完整拓扑 ➔
            </button>
          </div>
          <div class="route-branch-list">
            ${availableNextNodes
              .map((node) => {
                const typeMeta = NODE_TYPES[node.type] || NODE_TYPES.action;
                const threatTag = node.hasBossThreat
                  ? `<span class="branch-threat-tag">⚠️ 高管视线逼近</span>`
                  : '';
                return `
                  <div class="route-branch-item ${node.hasBossThreat ? 'item-threat' : ''}" data-branch-id="${node.id}">
                    <div class="branch-item-top">
                      <div class="branch-item-title-row">
                        <span class="branch-node-icon">${node.icon}</span>
                        <strong class="branch-node-title">${node.title}</strong>
                        <span class="branch-type-pill ${typeMeta.badgeClass}">${typeMeta.name}</span>
                        ${threatTag}
                      </div>
                      <button class="btn-branch-travel" data-travel-id="${node.id}">
                        🚶 前进 (⏱️+2分 ⚡-8)
                      </button>
                    </div>
                    <div class="branch-item-desc">${node.desc}</div>
                  </div>
                `;
              })
              .join('')}
          </div>
        </div>
      `;
    } else {
      container.innerHTML = '';
    }

    const mapLinkBtn = container.querySelector('#btn-quick-map-link');
    if (mapLinkBtn) {
      mapLinkBtn.addEventListener('click', () => {
        sound.playClick();
        this.setActiveTab('map');
      });
    }

    container.querySelectorAll('.btn-branch-travel').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const nodeId = btn.getAttribute('data-travel-id');
        if (nodeId) {
          this.engine.travelToNode(nodeId);
        }
      });
    });
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

    const quickCraftBtn = document.getElementById('btn-quick-craft');
    if (quickCraftBtn) {
      if (this.state.inventory.length >= 2) {
        quickCraftBtn.classList.add('has-craftable');
        quickCraftBtn.innerHTML = '🧪 妙手合成 ✨';
        quickCraftBtn.title = '当前持有 2+ 道具，可进入工坊合成羁绊神装！';
      } else {
        quickCraftBtn.classList.remove('has-craftable');
        quickCraftBtn.innerHTML = '🧪 妙手合成';
        quickCraftBtn.title = '合成羁绊神装 · 探索职场化学反应';
      }
    }

    if (this.state.inventory.length === 0) {
      tray.innerHTML = `
        <div class="empty-tray-box">
          <div class="empty-tray-icon">🎒</div>
          <div class="empty-tray-title">背包暂无道具</div>
          <div class="empty-tray-desc">在工位、走廊或茶水间进行战术抉择以搜集神器，下方合成工坊已就绪！</div>
        </div>
      `;
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
        const res = this.state.useItem(itemId);
        if (res && res.message) {
          toast.show(`【${ITEMS[itemId]?.name || '道具'}】${res.message}`, res.success ? 'item' : 'warning');
        }
      });
    });
  }

  renderLogs() {
    const container = document.getElementById('log-container');
    const badge = document.getElementById('log-count-badge');
    if (badge) {
      badge.textContent = `${this.state.logs ? this.state.logs.length : 0} 条动态`;
    }
    if (!container) return;
    container.innerHTML = this.state.logs.map((log) => {
      const textHtml = log.text
        .replace(/(\(怀疑度\s*\+\d+%\))/g, '<span class="log-stat-chip chip-danger">$1</span>')
        .replace(/(\(怀疑度\s*-\d+%\))/g, '<span class="log-stat-chip chip-safe">$1</span>')
        .replace(/(\(体力\s*-\d+\))/g, '<span class="log-stat-chip chip-warn">$1</span>')
        .replace(/(\(体力\s*\+\d+\))/g, '<span class="log-stat-chip chip-energy">$1</span>');
      return `
        <div class="log-entry log-${log.type}">
          <span class="log-time">[${log.time}]</span>
          <span class="log-text">${textHtml}</span>
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

        // Dynamic contextual hint for internship halo option
        let displayText = choice.text;
        if (choice.text.includes('实习生萌新光环')) {
          if (!this.state.flags.isIntern) {
            displayText = '【实习生萌新光环】“周姐，其实我也是刚来的实习生……” (⚠️ 非实习生装嫩将+8%怀疑度)';
          } else {
            displayText = '【实习生萌新光环】“周姐，其实我也是刚来的实习生，我不会面呀……” (✨ 实习生专属免祸)';
          }
        }

        return `
          <button class="choice-btn ${disabled ? 'choice-disabled' : ''}" data-idx="${idx}" ${disabled}>
            ${displayText}${reqHint}
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

      const expBadge = document.getElementById('end-exp-badge');
      expBadge.textContent = `✨ 本局摸鱼悟性结算 +${this.state.earnedExp || 0} EXP (总持: ${this.state.history.slackerExp})`;

      endingModal.classList.remove('hidden');
    } else {
      endingModal.classList.add('hidden');
    }
  }

  renderArchiveModal(activeTab = 'endings') {
    const tabEndings = document.getElementById('tab-endings');
    const tabAchievements = document.getElementById('tab-achievements');
    const tabCareer = document.getElementById('tab-career');
    const tabGuide = document.getElementById('tab-guide');
    const content = document.getElementById('archive-content');

    const unlockedEndings = this.state.history.unlockedEndings || [];
    const unlockedAchievements = this.state.history.unlockedAchievements || [];

    document.getElementById('unlocked-endings-count').textContent = unlockedEndings.length;
    document.getElementById('unlocked-achievements-count').textContent = unlockedAchievements.length;

    tabEndings.classList.toggle('active', activeTab === 'endings');
    tabAchievements.classList.toggle('active', activeTab === 'achievements');
    tabCareer.classList.toggle('active', activeTab === 'career');
    if (tabGuide) tabGuide.classList.toggle('active', activeTab === 'guide');

    if (activeTab === 'endings') {
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
    } else if (activeTab === 'achievements') {
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
    } else if (activeTab === 'career') {
      // Career stats
      const h = this.state.history;
      const roleWins = h.roleWins || {};
      content.innerHTML = `
        <div class="career-stats-box">
          <div class="career-metric-grid">
            <div class="career-stat-card">
              <span class="c-val">${h.gamesPlayed || 0}</span>
              <span class="c-lbl">总对局数</span>
            </div>
            <div class="career-stat-card">
              <span class="c-val text-success">${h.victories || 0}</span>
              <span class="c-lbl">准点胜利</span>
            </div>
            <div class="career-stat-card">
              <span class="c-val text-fire">${h.hardcoreWins || 0}</span>
              <span class="c-lbl">修罗场胜利</span>
            </div>
            <div class="career-stat-card">
              <span class="c-val text-exp">${h.slackerExp || 0}</span>
              <span class="c-lbl">当前悟性EXP</span>
            </div>
          </div>

          <h4 class="career-subhead">🎭 各职业胜场档案</h4>
          <div class="role-wins-list">
            ${Object.values(CHARACTERS).map((r) => {
              const wins = roleWins[r.id] || 0;
              return `
                <div class="role-win-item">
                  <span class="r-win-name">${r.avatar} ${r.name}</span>
                  <span class="r-win-count">${wins} 次成功脱逃</span>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    } else if (activeTab === 'guide') {
      content.innerHTML = `
        <div class="archive-guide-container">
          <div class="guide-stepper" id="archive-guide-stepper">
            ${TUTORIAL_STEPS.map((s, i) => `
              <button class="guide-step-pill ${i === 0 ? 'active' : ''}" data-arch-step="${i}">
                <span class="pill-num">${i + 1}</span>
                <span class="pill-name">${s.shortTitle}</span>
              </button>
            `).join('')}
          </div>
          <div class="guide-step-body" id="archive-guide-body"></div>
        </div>
      `;

      const renderArchStep = (idx) => {
        const s = TUTORIAL_STEPS[idx] || TUTORIAL_STEPS[0];
        const bodyEl = document.getElementById('archive-guide-body');
        if (!bodyEl) return;
        bodyEl.innerHTML = `
          <div class="guide-step-hero">
            <span class="guide-step-icon">${s.icon}</span>
            <div class="guide-step-headings">
              <span class="guide-step-tag">${s.tag}</span>
              <h4 class="guide-step-title">${s.title}</h4>
              <div class="guide-step-subtitle">${s.subtitle}</div>
            </div>
          </div>

          <div class="guide-step-highlights">
            ${s.highlights.map((h) => `
              <div class="guide-highlight-card">
                <span class="hl-card-icon">${h.icon}</span>
                <div class="hl-card-text">
                  <span class="hl-card-title">${h.title}</span>
                  <span class="hl-card-desc">${h.desc}</span>
                </div>
              </div>
            `).join('')}
          </div>

          <div class="guide-step-protip">
            <span class="protip-badge">💡 避坑指南</span>
            <span class="protip-text">${s.proTip}</span>
          </div>
        `;
      };

      renderArchStep(0);

      content.querySelectorAll('#archive-guide-stepper .guide-step-pill').forEach((btn) => {
        btn.addEventListener('click', () => {
          sound.playClick();
          content.querySelectorAll('#archive-guide-stepper .guide-step-pill').forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          const idx = parseInt(btn.getAttribute('data-arch-step'), 10);
          renderArchStep(idx);
        });
      });
    }
  }
}
