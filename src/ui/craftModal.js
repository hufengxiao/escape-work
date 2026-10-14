/**
 * Craft Modal Component: Interactive workplace alchemy and synergy recipe book
 */

import { CraftManager } from '../engine/craftManager.js';
import { ITEMS } from '../data/items.js';
import { sound } from '../audio/sound.js';
import { toast } from './toast.js';

export class CraftModal {
  constructor(state, onUpdate, onClose = null) {
    this.state = state;
    this.onUpdate = onUpdate;
    this.onClose = onClose;
    this.selectedItemIds = [];
    this.activeTab = 'craft'; // 'craft' | 'book'
    this.modalEl = null;
  }

  show() {
    this.selectedItemIds = [];
    this.render();
  }

  close() {
    if (this.modalEl && this.modalEl.parentNode) {
      this.modalEl.parentNode.removeChild(this.modalEl);
      this.modalEl = null;
    }
    if (this.onClose) {
      this.onClose();
    }
  }

  render() {
    if (this.modalEl && this.modalEl.parentNode) {
      this.updateView();
      return;
    }

    const overlay = document.createElement('div');
    overlay.className = 'modal-backdrop fade-in';
    overlay.id = 'craft-modal-overlay';

    const modal = document.createElement('div');
    modal.className = 'modal-card craft-modal-card slide-up';

    const recipeBook = CraftManager.getRecipeBook(this.state);
    const unlockedCount = recipeBook.filter((r) => r.isUnlocked).length;

    modal.innerHTML = `
      <div class="modal-header">
        <div class="modal-title-group">
          <span class="modal-icon">🧪</span>
          <div>
            <h3 class="modal-title">职场妙手合成 · 羁绊神装</h3>
            <span class="modal-subtitle">放入任意 2 件道具探索职场化学反应</span>
          </div>
        </div>
        <button class="modal-close-btn" id="craft-modal-close" aria-label="关闭">&times;</button>
      </div>

      <!-- Tab Navigation -->
      <div class="craft-tab-bar">
        <button class="craft-tab-btn ${this.activeTab === 'craft' ? 'active' : ''}" id="craft-tab-forge">
          ⚗️ 合成工作台
        </button>
        <button class="craft-tab-btn ${this.activeTab === 'book' ? 'active' : ''}" id="craft-tab-book">
          📖 羁绊图鉴 (<span id="craft-unlocked-count">${unlockedCount}</span>/${recipeBook.length})
        </button>
      </div>

      <div class="modal-body" id="craft-tab-content">
        ${this.activeTab === 'craft' ? this.renderForgeContent() : this.renderBookContent(recipeBook)}
      </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    this.modalEl = overlay;

    this.bindEvents(overlay);
  }

  updateView() {
    if (!this.modalEl) return;
    const recipeBook = CraftManager.getRecipeBook(this.state);
    const unlockedCount = recipeBook.filter((r) => r.isUnlocked).length;

    const forgeTab = this.modalEl.querySelector('#craft-tab-forge');
    const bookTab = this.modalEl.querySelector('#craft-tab-book');
    const countEl = this.modalEl.querySelector('#craft-unlocked-count');
    if (forgeTab) forgeTab.className = `craft-tab-btn ${this.activeTab === 'craft' ? 'active' : ''}`;
    if (bookTab) bookTab.className = `craft-tab-btn ${this.activeTab === 'book' ? 'active' : ''}`;
    if (countEl) countEl.textContent = unlockedCount;

    const contentEl = this.modalEl.querySelector('#craft-tab-content');
    if (contentEl) {
      contentEl.innerHTML = this.activeTab === 'craft' ? this.renderForgeContent() : this.renderBookContent(recipeBook);
    }
  }

  renderForgeContent() {
    const slot1Item = this.selectedItemIds[0] ? ITEMS[this.selectedItemIds[0]] : null;
    const slot2Item = this.selectedItemIds[1] ? ITEMS[this.selectedItemIds[1]] : null;

    // Filter backpack items suitable for crafting
    const inventoryItems = this.state.inventory.map((id) => ITEMS[id]).filter(Boolean);

    return `
      <div class="craft-forge-container">
        <!-- Crafting Slots -->
        <div class="craft-slots-wrapper">
          <div class="craft-slot ${slot1Item ? 'has-item' : 'empty'}" data-slot="0">
            ${
              slot1Item
                ? `<div class="craft-slot-inner">
                    <span class="craft-slot-icon">${slot1Item.icon}</span>
                    <span class="craft-slot-name">${slot1Item.name}</span>
                    <button class="craft-slot-remove" data-remove="0" title="移除">×</button>
                  </div>`
                : `<div class="craft-slot-empty-text"><span>➕ 原料 1</span><small>点击下方选择</small></div>`
            }
          </div>

          <div class="craft-plus-sign">➕</div>

          <div class="craft-slot ${slot2Item ? 'has-item' : 'empty'}" data-slot="1">
            ${
              slot2Item
                ? `<div class="craft-slot-inner">
                    <span class="craft-slot-icon">${slot2Item.icon}</span>
                    <span class="craft-slot-name">${slot2Item.name}</span>
                    <button class="craft-slot-remove" data-remove="1" title="移除">×</button>
                  </div>`
                : `<div class="craft-slot-empty-text"><span>➕ 原料 2</span><small>点击下方选择</small></div>`
            }
          </div>
        </div>

        <!-- Craft Button & Action -->
        <div class="craft-action-row">
          <button id="btn-do-craft" class="btn btn-primary craft-trigger-btn" ${
            this.selectedItemIds.length < 2 ? 'disabled' : ''
          }>
            ⚡ 触发职场化学反应！
          </button>
          <button id="btn-clear-craft" class="btn btn-ghost" ${
            this.selectedItemIds.length === 0 ? 'disabled' : ''
          }>
            清空已选
          </button>
        </div>

        <!-- Inventory Picker -->
        <div class="craft-picker-section">
          <div class="craft-picker-header">
            <span>🎒 背包可选材料 (${inventoryItems.length})</span>
            <small class="craft-hint">点击放入上方槽位</small>
          </div>
          <div class="craft-picker-grid">
            ${
              inventoryItems.length === 0
                ? `<div class="craft-empty-inventory">当前背包空空如也，快去搜寻点或行动收集道具吧！</div>`
                : inventoryItems
                    .map((item, idx) => {
                      const isSelected = this.selectedItemIds.includes(item.id);
                      return `
                        <button class="craft-picker-chip ${isSelected ? 'selected' : ''}" data-item-id="${item.id}" ${isSelected ? 'disabled' : ''}>
                          <span class="chip-icon">${item.icon}</span>
                          <span class="chip-name">${item.name}</span>
                        </button>
                      `;
                    })
                    .join('')
            }
          </div>
        </div>
      </div>
    `;
  }

  renderBookContent(recipeBook) {
    return `
      <div class="craft-book-container">
        <p class="craft-book-desc">
          探索隐藏在摸鱼打工日常中的神级组合，发现并解锁合成图鉴可永久获得摸鱼悟性奖励！
        </p>
        <div class="craft-book-list">
          ${recipeBook
            .map((r) => {
              const ing1 = ITEMS[r.ingredients[0]];
              const ing2 = ITEMS[r.ingredients[1]];
              if (r.isUnlocked) {
                return `
                  <div class="craft-book-card unlocked">
                    <div class="book-card-header">
                      <span class="badge badge-${r.rarity.toLowerCase()}">${r.rarity}</span>
                      <strong class="book-card-title">${r.name}</strong>
                    </div>
                    <div class="book-formula">
                      <span>${ing1?.icon || '❓'} ${ing1?.name || r.ingredients[0]}</span>
                      <span>+</span>
                      <span>${ing2?.icon || '❓'} ${ing2?.name || r.ingredients[1]}</span>
                    </div>
                    <p class="book-synergy">${r.synergyDesc}</p>
                  </div>
                `;
              } else {
                return `
                  <div class="craft-book-card locked">
                    <div class="book-card-header">
                      <span class="badge badge-locked">🔒 未解锁</span>
                      <strong class="book-card-title">???</strong>
                    </div>
                    <div class="book-formula">
                      <span>🔒 绝密原料 A</span>
                      <span>+</span>
                      <span>🔒 绝密原料 B</span>
                    </div>
                    <p class="book-synergy">在工位或物资点尝试两两合成以揭晓图鉴秘籍...</p>
                  </div>
                `;
              }
            })
            .join('')}
        </div>
      </div>
    `;
  }

  bindEvents(overlay) {
    overlay.addEventListener('click', (e) => {
      // Close button or backdrop click
      if (e.target.id === 'craft-modal-overlay' || e.target.closest('#craft-modal-close')) {
        this.close();
        return;
      }

      // Tab switching
      if (e.target.closest('#craft-tab-forge')) {
        if (this.activeTab !== 'craft') {
          sound.playClick();
          this.activeTab = 'craft';
          this.updateView();
        }
        return;
      }
      if (e.target.closest('#craft-tab-book')) {
        if (this.activeTab !== 'book') {
          sound.playClick();
          this.activeTab = 'book';
          this.updateView();
        }
        return;
      }

      // Remove button in slot
      const removeBtn = e.target.closest('.craft-slot-remove');
      if (removeBtn) {
        e.stopPropagation();
        const slotIdx = parseInt(removeBtn.dataset.remove, 10);
        this.selectedItemIds.splice(slotIdx, 1);
        sound.playClick();
        this.updateView();
        return;
      }

      // Material picker chip click
      const chip = e.target.closest('.craft-picker-chip:not([disabled])');
      if (chip) {
        const itemId = chip.dataset.itemId;
        if (this.selectedItemIds.length < 2 && !this.selectedItemIds.includes(itemId)) {
          this.selectedItemIds.push(itemId);
          sound.playClick();
          this.updateView();
        }
        return;
      }

      // Clear button
      if (e.target.closest('#btn-clear-craft')) {
        this.selectedItemIds = [];
        sound.playClick();
        this.updateView();
        return;
      }

      // Trigger craft
      if (e.target.closest('#btn-do-craft')) {
        const result = CraftManager.craft(this.state, this.selectedItemIds);
        if (result.success) {
          sound.playItem();
          toast.show(result.message, 'success', 3500);
          this.selectedItemIds = [];
          if (this.onUpdate) this.onUpdate();
          this.updateView();
        } else {
          sound.playFail();
          toast.show(result.message, 'alert', 3500);
        }
        return;
      }
    });
  }
}
