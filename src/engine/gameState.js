/**
 * Reactive Game State Management & LocalStorage Persistence
 */

import { ITEMS } from '../data/items.js';

export class GameState {
  constructor() {
    this.reset();
    this.loadPersistentData();
  }

  reset() {
    this.currentHour = 17;
    this.currentMinute = 45;
    this.energy = 90; // 0 to 100
    this.suspicion = 15; // 0 to 100
    this.zone = 1; // 1 to 4
    this.turns = 0;

    // Starting items in cubicle drawer
    this.inventory = ['chair_jacket', 'fake_bsod'];

    this.flags = {
      bagPacked: 0,
      hasDecoyJacket: false,
      hasFakeScreen: false,
      hasCoffeeShield: false,
      hasBugShield: false,
      hasHeadphoneShield: false,
      hasBribedGuard: false,
      hasLaborLawArmed: false,
      hasMedicalExcuse: false,
      hasFolderCover: false,
      talkedAhwei: false,
      toiletTurns: 0,
      toiletMaster: false,
      tookStairs: false
    };

    this.activeEncounter = null;
    this.currentEnding = null;
    this.logs = [
      {
        time: '17:45',
        type: 'system',
        text: '周五 17:45，距离准点下班还有 15 分钟。办公室键盘敲得震天响，老板阎总正在巡视。目标：在老板怀疑度达到 100% 之前，安全从一楼大门撤退！'
      }
    ];

    this.listeners = [];
  }

  loadPersistentData() {
    try {
      const data = JSON.parse(localStorage.getItem('escape_work_save') || '{}');
      this.history = {
        gamesPlayed: data.gamesPlayed || 0,
        victories: data.victories || 0,
        unlockedEndings: data.unlockedEndings || [],
        unlockedAchievements: data.unlockedAchievements || []
      };
    } catch {
      this.history = {
        gamesPlayed: 0,
        victories: 0,
        unlockedEndings: [],
        unlockedAchievements: []
      };
    }
  }

  savePersistentData() {
    try {
      localStorage.setItem('escape_work_save', JSON.stringify(this.history));
    } catch (e) {
      console.warn('Failed to save state to localStorage', e);
    }
  }

  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  notify() {
    this.listeners.forEach((cb) => cb(this));
  }

  getTimeString() {
    const hh = String(this.currentHour).padStart(2, '0');
    const mm = String(this.currentMinute).padStart(2, '0');
    return `${hh}:${mm}`;
  }

  advanceTime(minutes = 1) {
    this.currentMinute += minutes;
    while (this.currentMinute >= 60) {
      this.currentHour += 1;
      this.currentMinute -= 60;
    }
  }

  addLog(text, type = 'info') {
    this.logs.unshift({
      time: this.getTimeString(),
      type,
      text
    });
    // Keep max 60 logs
    if (this.logs.length > 60) {
      this.logs.pop();
    }
    this.notify();
  }

  hasItem(itemId) {
    return this.inventory.includes(itemId);
  }

  addItem(itemId) {
    if (!this.inventory.includes(itemId) && ITEMS[itemId]) {
      this.inventory.push(itemId);
      this.notify();
      return true;
    }
    return false;
  }

  removeItem(itemId) {
    const idx = this.inventory.indexOf(itemId);
    if (idx !== -1) {
      this.inventory.splice(idx, 1);
      this.notify();
      return true;
    }
    return false;
  }

  useItem(itemId) {
    const item = ITEMS[itemId];
    if (!item) return { success: false, message: '未知道具' };
    if (!this.hasItem(itemId)) return { success: false, message: '背包中没有该道具' };

    const result = item.onUse(this);
    if (result.success) {
      this.removeItem(itemId);
      this.addLog(`【使用道具】${result.message}`, 'item');
    }
    this.notify();
    return result;
  }
}
