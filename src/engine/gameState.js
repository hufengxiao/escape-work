/**
 * Reactive Game State Management & LocalStorage Persistence
 */

import { ITEMS } from '../data/items.js';
import { CHARACTERS } from '../data/characters.js';
import { getRandomModifier, MODIFIERS } from '../data/modifiers.js';
import { PERKS } from '../data/perks.js';
import { MapManager } from './mapManager.js';
import { NPCManager } from './npcManager.js';
import { PatrolManager } from './patrolManager.js';

export const STORAGE_KEY_V1 = 'escape_work_save';
export const STORAGE_KEY_V2 = 'ESCAPE_WORK_SAVE_V2';

export function migrateSaveData() {
  if (typeof localStorage === 'undefined') return null;
  try {
    const v2Raw = localStorage.getItem(STORAGE_KEY_V2);
    if (v2Raw) {
      return JSON.parse(v2Raw);
    }

    const v1Raw = localStorage.getItem(STORAGE_KEY_V1) || localStorage.getItem('ESCAPE_WORK_SAVE');
    if (v1Raw) {
      const v1Data = JSON.parse(v1Raw);
      const migrated = {
        version: 2,
        meta: {
          totalRuns: v1Data.gamesPlayed || v1Data.totalRuns || 0,
          escapedRuns: v1Data.victories || v1Data.escapedRuns || 0,
          totalExp: typeof v1Data.slackerExp === 'number' ? v1Data.slackerExp : (v1Data.exp || 50),
          unlockedPerks: v1Data.unlockedPerks || [],
          unlockedEndings: v1Data.unlockedEndings || v1Data.endings || [],
          unlockedAchievements: v1Data.unlockedAchievements || [],
          unlockedRecipes: v1Data.unlockedRecipes || [],
          dailyHighScores: v1Data.dailyHighScores || {},
          roleWins: v1Data.roleWins || {},
          hardcoreWins: v1Data.hardcoreWins || 0
        },
        settings: {
          soundEnabled: true,
          hapticsEnabled: true,
          fastText: false
        }
      };
      localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(migrated));
      return migrated;
    }
  } catch (err) {
    console.warn('[Migration] Error migrating save data:', err);
  }
  return null;
}

export class GameState {
  constructor() {
    this.listeners = [];
    this.channels = {};
    this.loadPersistentData();
    this.selectedRoleId = 'backend_dev';
    this.isHardcore = false;
    this.currentModifier = getRandomModifier();
    this.dailySeed = null;
    this.reset();
  }

  reset(roleId = null, modifierId = null, isHardcore = null) {
    if (roleId && CHARACTERS[roleId]) {
      this.selectedRoleId = roleId;
    }
    if (isHardcore !== null) {
      this.isHardcore = Boolean(isHardcore);
    }
    if (modifierId) {
      const found = MODIFIERS.find((m) => m.id === modifierId);
      if (found) this.currentModifier = found;
    } else {
      this.currentModifier = getRandomModifier();
    }

    const role = CHARACTERS[this.selectedRoleId] || CHARACTERS.backend_dev;

    this.currentHour = 17;
    this.currentMinute = 45;
    this.energy = role.baseEnergy || 90;
    this.suspicion = role.baseSuspicion || 15;
    this.turns = 0;

    // Generate DAG map and sync zone
    this.mapGraph = MapManager.generateDungeonMap(this.dailySeed || Date.now());
    this.currentMapNodeId = this.mapGraph[0][0].id;
    this.zone = this.mapGraph[0][0].zone || 1;

    // Initialize NPC workplace relations
    NPCManager.initRelations(this);

    // Initialize Boss patrol tracking
    PatrolManager.initPatrol(this);

    // Inventory starting items based on character
    this.inventory = [...(role.startingItems || ['chair_jacket', 'fake_bsod'])];

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
      hasDeliveryDisguise: false,
      talkedAhwei: false,
      toiletTurns: 0,
      toiletMaster: false,
      tookStairs: false
    };

    // Apply role bonus
    if (role.applyBonus) {
      role.applyBonus(this);
    }

    // Apply Hardcore mode penalties
    if (this.isHardcore) {
      this.suspicion += 20;
      this.energy = Math.max(40, this.energy - 10);
      this.flags.isHardcore = true;
    }

    // Apply current workplace modifier
    if (this.currentModifier && this.currentModifier.apply) {
      this.currentModifier.apply(this);
    }

    // Apply unlocked perks from talent tree
    this.applyPerks();

    this.activeEncounter = null;
    this.currentEnding = null;
    this.earnedExp = 0;

    const hardcoreText = this.isHardcore ? '【🔥地狱修罗场模式】' : '';
    this.logs = [
      {
        time: '17:45',
        type: 'system',
        text: `周五 17:45，你化身【${role.name}】(${role.title})${hardcoreText}。今日办公区环境：【${this.currentModifier.icon} ${this.currentModifier.name}】。目标：在老板怀疑度达到 100% 之前准点逃脱！`
      }
    ];
  }

  applyPerks() {
    const unlocked = this.history?.unlockedPerks || [];
    unlocked.forEach((perkId) => {
      const perk = PERKS.find((p) => p.id === perkId);
      if (perk && perk.apply) {
        perk.apply(this);
      }
    });

    // If extra pocket perk unlocked, randomly give 1 extra item
    if (this.flags.hasExtraPocketPerk) {
      const candidates = ['sunglasses', 'wind_oil', 'fake_call'];
      const chosen = candidates[Math.floor(Math.random() * candidates.length)];
      if (!this.hasItem(chosen)) {
        this.addItem(chosen);
      }
    }
  }

  loadPersistentData() {
    try {
      const v2Data = migrateSaveData();
      if (v2Data && v2Data.meta) {
        const m = v2Data.meta;
        this.history = {
          gamesPlayed: m.totalRuns || 0,
          victories: m.escapedRuns || 0,
          unlockedEndings: m.unlockedEndings || [],
          unlockedAchievements: m.unlockedAchievements || [],
          slackerExp: typeof m.totalExp === 'number' ? m.totalExp : 50,
          unlockedPerks: m.unlockedPerks || [],
          unlockedRecipes: m.unlockedRecipes || [],
          dailyHighScores: m.dailyHighScores || {},
          roleWins: m.roleWins || {},
          hardcoreWins: m.hardcoreWins || 0
        };
        this.settings = v2Data.settings || { soundEnabled: true, hapticsEnabled: true, fastText: false };
        return;
      }

      const raw = typeof localStorage !== 'undefined' ? (localStorage.getItem(STORAGE_KEY_V1) || localStorage.getItem('ESCAPE_WORK_SAVE')) : null;
      const data = raw ? JSON.parse(raw) : {};
      this.history = {
        gamesPlayed: data.gamesPlayed || 0,
        victories: data.victories || 0,
        unlockedEndings: data.unlockedEndings || [],
        unlockedAchievements: data.unlockedAchievements || [],
        slackerExp: typeof data.slackerExp === 'number' ? data.slackerExp : 50,
        unlockedPerks: data.unlockedPerks || [],
        unlockedRecipes: data.unlockedRecipes || [],
        dailyHighScores: data.dailyHighScores || {},
        roleWins: data.roleWins || {},
        hardcoreWins: data.hardcoreWins || {}
      };
    } catch {
      this.history = {
        gamesPlayed: 0,
        victories: 0,
        unlockedEndings: [],
        unlockedAchievements: [],
        slackerExp: 50,
        unlockedPerks: [],
        unlockedRecipes: [],
        dailyHighScores: {},
        roleWins: {},
        hardcoreWins: 0
      };
    }
  }

  savePersistentData() {
    if (typeof localStorage === 'undefined') return;
    try {
      const v2Data = {
        version: 2,
        meta: {
          totalRuns: this.history.gamesPlayed,
          escapedRuns: this.history.victories,
          totalExp: this.history.slackerExp,
          unlockedPerks: this.history.unlockedPerks,
          unlockedEndings: this.history.unlockedEndings,
          unlockedAchievements: this.history.unlockedAchievements,
          unlockedRecipes: this.history.unlockedRecipes,
          dailyHighScores: this.history.dailyHighScores || {},
          roleWins: this.history.roleWins,
          hardcoreWins: this.history.hardcoreWins
        },
        settings: this.settings || { soundEnabled: true, hapticsEnabled: true, fastText: false }
      };
      localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(v2Data));
      localStorage.setItem(STORAGE_KEY_V1, JSON.stringify(this.history));
    } catch (e) {
      console.warn('Failed to save state to localStorage', e);
    }
  }

  unlockPerk(perkId) {
    const perk = PERKS.find((p) => p.id === perkId);
    if (!perk) return { success: false, message: '特质不存在' };
    if (this.history.unlockedPerks.includes(perkId)) {
      return { success: false, message: '该特质已点亮' };
    }
    if (this.history.slackerExp < perk.cost) {
      return { success: false, message: `摸鱼悟性不足（需要 ${perk.cost}，当前 ${this.history.slackerExp}）` };
    }

    this.history.slackerExp -= perk.cost;
    this.history.unlockedPerks.push(perkId);
    this.savePersistentData();
    this.notify();
    return { success: true, message: `成功点亮【${perk.name}】！` };
  }

  subscribe(channelOrCallback, callback) {
    if (typeof channelOrCallback === 'function') {
      this.listeners.push(channelOrCallback);
      return () => {
        this.listeners = this.listeners.filter((cb) => cb !== channelOrCallback);
      };
    }
    const channel = channelOrCallback;
    if (!this.channels) this.channels = {};
    if (!this.channels[channel]) this.channels[channel] = [];
    this.channels[channel].push(callback);
    return () => {
      this.channels[channel] = this.channels[channel].filter((cb) => cb !== callback);
    };
  }

  emit(channel, payload) {
    if (this.channels && this.channels[channel]) {
      this.channels[channel].forEach((cb) => cb(payload));
    }
    this.notify();
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
