/**
 * Workplace NPC Relationship Panel Component
 */

import { NPCManager } from '../engine/npcManager.js';
import { NPCS } from '../data/npcs.js';
import { ITEMS } from '../data/items.js';
import { sound } from '../audio/sound.js';
import { toast } from './toast.js';

export class RelationPanel {
  constructor(state, onUpdate) {
    this.state = state;
    this.onUpdate = onUpdate;
    this.modalEl = null;
  }

  show() {
    this.render();
  }

  close() {
    if (this.modalEl && this.modalEl.parentNode) {
      this.modalEl.parentNode.removeChild(this.modalEl);
      this.modalEl = null;
    }
  }

  render() {
    this.close();

    const overlay = document.createElement('div');
    overlay.className = 'modal-backdrop fade-in';
    overlay.id = 'relation-modal-overlay';

    const modal = document.createElement('div');
    modal.className = 'modal-card relation-modal-card slide-up';

    if (!this.state.npcRelations) {
      NPCManager.initRelations(this.state);
    }

    const npcsList = Object.keys(NPCS).map((id) => NPCManager.getRelation(this.state, id));

    modal.innerHTML = `
      <div class="modal-header">
        <div class="modal-title-group">
          <span class="modal-icon">🤝</span>
          <div>
            <h3 class="modal-title">职场人脉网络 · 同事好感度</h3>
            <span class="modal-subtitle">送礼拉拢盟友，解锁专属逃脱特权</span>
          </div>
        </div>
        <button class="modal-close-btn" id="relation-modal-close" aria-label="关闭">&times;</button>
      </div>

      <div class="modal-body relation-list-body">
        <p class="relation-panel-intro">
          在办公室里，谁是你的铁杆盟友，谁是刺客与政委？通过投喂道具提升好感度（满 80 点激活被动神技，低于 -50 点将触发惩罚）！
        </p>

        <div class="relation-cards-grid">
          ${npcsList
            .map((npc) => {
              const favor = npc.favorability;
              const statusBadge = this.getStatusBadge(npc.status);
              const percent = Math.round(((favor + 100) / 200) * 100);

              // Check if player has any favorite items to gift
              const giftableItems = npc.favoriteItems
                .filter((itemId) => this.state.hasItem(itemId))
                .map((itemId) => ITEMS[itemId]);

              return `
                <div class="relation-card status-${npc.status}" data-npc-id="${npc.id}">
                  <div class="relation-card-header">
                    <span class="relation-avatar">${npc.avatar}</span>
                    <div class="relation-header-meta">
                      <div class="relation-name-row">
                        <strong class="relation-name">${npc.name}</strong>
                        ${statusBadge}
                      </div>
                      <span class="relation-title">${npc.title}</span>
                    </div>
                  </div>

                  <!-- Favorability Meter -->
                  <div class="relation-meter-section">
                    <div class="relation-meter-label">
                      <span>好感度</span>
                      <strong class="meter-num ${favor >= 0 ? 'pos' : 'neg'}">${favor > 0 ? '+' : ''}${favor}</strong>
                    </div>
                    <div class="relation-meter-track">
                      <div class="relation-meter-bar fill-${npc.status}" style="width: ${percent}%"></div>
                    </div>
                  </div>

                  <p class="relation-desc">${npc.description}</p>

                  <!-- Perk Status -->
                  <div class="relation-perk-box ${npc.hasGrantedPerk ? 'unlocked' : 'locked'}">
                    <div class="perk-box-title">
                      <span>${npc.hasGrantedPerk ? '✨ 特权已激活' : '🔒 满级特权 (≥80)'}：${npc.perkTitle}</span>
                    </div>
                    <p class="perk-box-desc">${npc.perkDesc}</p>
                  </div>

                  <!-- Gifting Interaction -->
                  <div class="relation-gift-section">
                    <div class="gift-section-title">
                      <span>喜好物品：${npc.favoriteItems.map((id) => ITEMS[id]?.name || id).join('、')}</span>
                    </div>
                    <div class="gift-actions-row">
                      ${
                        giftableItems.length > 0
                          ? giftableItems
                              .map(
                                (item) => `
                              <button class="btn-gift-item" data-npc="${npc.id}" data-item="${item.id}">
                                🎁 赠送【${item.name}】(+35)
                              </button>
                            `
                              )
                              .join('')
                          : `<span class="no-gift-hint">背包中暂无此人喜好物品</span>`
                      }
                    </div>
                  </div>
                </div>
              `;
            })
            .join('')}
        </div>
      </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    this.modalEl = overlay;

    this.bindEvents(overlay);
  }

  getStatusBadge(status) {
    const badges = {
      ally: '<span class="status-badge badge-ally">坚固盟友</span>',
      friendly: '<span class="status-badge badge-friendly">友善同事</span>',
      neutral: '<span class="status-badge badge-neutral">中立观察</span>',
      hostile: '<span class="status-badge badge-hostile">潜在敌对</span>',
      nemesis: '<span class="status-badge badge-nemesis">职场死敌</span>'
    };
    return badges[status] || badges.neutral;
  }

  bindEvents(overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target.id === 'relation-modal-overlay' || e.target.id === 'relation-modal-close') {
        this.close();
      }
    });

    overlay.querySelectorAll('.btn-gift-item').forEach((btn) => {
      btn.addEventListener('click', () => {
        const npcId = btn.dataset.npc;
        const itemId = btn.dataset.item;
        sound.playItem();
        const result = NPCManager.giftItem(this.state, npcId, itemId);
        if (result.success) {
          toast.show(result.message, 'success', 3500);
          if (this.onUpdate) this.onUpdate();
          this.render();
        } else {
          toast.show(result.message, 'alert');
        }
      });
    });
  }
}
