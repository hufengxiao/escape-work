/**
 * Workplace Radar View Component: Top surveillance ticker & Boss movement tracker
 */

import { PatrolManager } from '../engine/patrolManager.js';
import { sound } from '../audio/sound.js';
import { toast } from './toast.js';

export class RadarView {
  constructor(state, onUpdate) {
    this.state = state;
    this.onUpdate = onUpdate;
  }

  render() {
    if (!this.state.patrolState) {
      PatrolManager.initPatrol(this.state);
    }
    const ps = this.state.patrolState;

    const threatConfig = {
      safe: { led: '🟢', label: '安全', cls: 'threat-safe', desc: '高管相隔较远或在其他楼层，遭遇率极低。' },
      warning: { led: '🟡', label: '警戒', cls: 'threat-warning', desc: '高管正在本层巡视，请小心谨慎！' },
      danger: { led: '🔴', label: '极度危险', cls: 'threat-danger', desc: '高管正位于相邻区域，随时可能迎面遭遇！' }
    };

    const cfg = threatConfig[ps.threatLevel] || threatConfig.safe;

    return `
      <div class="radar-bar-container ${cfg.cls}" id="radar-bar-container">
        <div class="radar-left">
          <span class="radar-led pulse-led" title="${cfg.desc}">${cfg.led}</span>
          <span class="radar-badge ${cfg.cls}">${cfg.label}</span>
          <div class="radar-location-chip">
            <span class="radar-pin">📍</span>
            <span>${ps.currentArea}</span>
          </div>
        </div>

        <div class="radar-ticker-wrap">
          <span class="radar-ticker-text">${ps.lastBroadcast}</span>
        </div>

        <div class="radar-actions">
          <button id="btn-radar-decoy" class="btn-radar-action" title="发动声东击西战术引开高管">
            🎭 声东击西
          </button>
        </div>
      </div>
    `;
  }

  bindEvents(containerEl) {
    if (!containerEl) return;

    const decoyBtn = containerEl.querySelector('#btn-radar-decoy');
    if (decoyBtn) {
      decoyBtn.addEventListener('click', () => {
        sound.playClick();
        this.showDecoyPicker();
      });
    }
  }

  showDecoyPicker() {
    const overlay = document.createElement('div');
    overlay.className = 'modal-backdrop fade-in';
    overlay.id = 'decoy-modal-overlay';

    overlay.innerHTML = `
      <div class="modal-card decoy-modal-card slide-up">
        <div class="modal-header">
          <div class="modal-title-group">
            <span class="modal-icon">🎭</span>
            <div>
              <h3 class="modal-title">声东击西 · 调虎离山战术</h3>
              <span class="modal-subtitle">制造突发意外引开大Boss阎总的巡视路线</span>
            </div>
          </div>
          <button class="modal-close-btn" id="decoy-close">&times;</button>
        </div>

        <div class="decoy-options-grid">
          <button class="decoy-option-card" data-decoy="fake_alarm">
            <span class="decoy-card-icon">🚨</span>
            <div class="decoy-card-info">
              <strong>伪造核心机房 P0 告警短信</strong>
              <small>发送虚假严重日志，引诱阎总赶往 15 楼机房（清空威胁 3 回合，怀疑度 -20%）</small>
            </div>
          </button>

          <button class="decoy-option-card" data-decoy="fake_meeting">
            <span class="decoy-card-icon">📅</span>
            <div class="decoy-card-info">
              <strong>日历预约“紧急预算审批会”</strong>
              <small>以财务名义虚晃一枪，阎总将在 19 楼闭门会议室驻留等待 4 回合（怀疑度 -15%）</small>
            </div>
          </button>

          <button class="decoy-option-card" data-decoy="printer_jam">
            <span class="decoy-card-icon">🖨️</span>
            <div class="decoy-card-info">
              <strong>制造主打印机卡纸喷废纸</strong>
              <small>引发全层骚动，将路人视线全部吸引至走廊另一端（安全 2 回合，怀疑度 -10%）</small>
            </div>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const close = () => {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    };

    overlay.querySelector('#decoy-close').addEventListener('click', close);
    overlay.addEventListener('click', (e) => {
      if (e.target.id === 'decoy-modal-overlay') close();
    });

    overlay.querySelectorAll('.decoy-option-card').forEach((card) => {
      card.addEventListener('click', () => {
        const decoyType = card.dataset.decoy;
        const result = PatrolManager.triggerDecoy(this.state, decoyType);
        sound.playItem();
        toast.show(result.message, 'success', 3500);
        close();
        if (this.onUpdate) this.onUpdate();
      });
    });
  }
}
