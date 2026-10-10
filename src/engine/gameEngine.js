/**
 * Core Game Engine: Handles turn loops, encounter triggers, ending conditions & achievements
 */

import { RANDOM_ENCOUNTERS, ZONE_ACTIONS } from '../data/events.js';
import { ENDINGS } from '../data/endings.js';
import { ACHIEVEMENTS } from '../data/achievements.js';
import { ITEMS } from '../data/items.js';
import { sound } from '../audio/sound.js';
import { MapManager } from './mapManager.js';
import { PatrolManager } from './patrolManager.js';
import { DailySystem } from '../data/daily.js';
import { toast } from '../ui/toast.js';

export class GameEngine {
  constructor(state) {
    this.state = state;
  }

  travelToNode(nodeId) {
    if (this.state.currentEnding || this.state.activeEncounter) return;

    const mapGraph = this.state.mapGraph;
    if (!mapGraph) return;

    const targetNode = MapManager.findNode(mapGraph, nodeId);
    if (!targetNode || !targetNode.isAvailable) {
      this.state.addLog('当前路径无法直接前往该节点！', 'warning');
      return;
    }

    sound.playClick();

    // Energy and time costs
    let timeCost = 2;
    let energyCost = 8;

    if (this.state.flags.cyberStimulantActive > 0) {
      this.state.flags.cyberStimulantActive--;
      timeCost = 0;
      energyCost = 0;
      this.state.addLog(
        `⚡【赛博超频】神速移动！耗时与体能消耗为 0（超频剩余 ${this.state.flags.cyberStimulantActive} 次）。`,
        'item'
      );
    } else {
      if (this.state.flags.hasSneakersPerk) {
        energyCost = Math.max(3, Math.round(energyCost * 0.75));
      }
      if (this.state.isHardcore) {
        energyCost = Math.round(energyCost * 1.3);
      }
    }

    if (timeCost > 0) this.state.advanceTime(timeCost);
    this.state.energy = Math.max(0, Math.min(100, this.state.energy - energyCost));
    this.state.turns++;

    // Natural suspicion decay from architect aura
    if (this.state.flags.hasArchitectAura) {
      this.state.suspicion = Math.max(0, Math.round(this.state.suspicion * 0.97));
    }

    // Update node states in graph
    targetNode.isVisited = true;
    this.state.currentMapNodeId = targetNode.id;
    this.state.zone = targetNode.zone || Math.min(5, targetNode.depth + 1);

    // Reset all nodes availability, then activate target's children
    mapGraph.forEach((layer) => {
      layer.forEach((node) => {
        node.isAvailable = false;
      });
    });
    targetNode.nextNodeIds.forEach((childId) => {
      const child = MapManager.findNode(mapGraph, childId);
      if (child) child.isAvailable = true;
    });

    this.state.addLog(`🗺️【路线推进】你穿行抵达了【${targetNode.title}】(${targetNode.zoneName})。`, 'info');

    // Handle node type bonus/events
    if (targetNode.type === 'rest') {
      const recovery = 20;
      this.state.energy = Math.min(100, this.state.energy + recovery);
      this.state.suspicion = Math.max(0, this.state.suspicion - 10);
      this.state.addLog(`☕ 补充能量：喝了杯热饮小憩片刻，体力 +${recovery}，怀疑度 -10%！`, 'item');
    } else if (targetNode.type === 'loot') {
      const lootCandidates = ['warm_coffee', 'bag_snack', 'wind_oil', 'yellow_vest', 'stomach_pill', 'noise_headphones'];
      const lootItem = lootCandidates[Math.floor(Math.random() * lootCandidates.length)];
      if (!this.state.hasItem(lootItem)) {
        this.state.addItem(lootItem);
        this.state.addLog(`📦 翻找收获：在角落搜刮到了关键物资【${ITEMS[lootItem]?.name || lootItem}】！`, 'item');
      } else {
        this.state.energy = Math.min(100, this.state.energy + 10);
        this.state.addLog(`📦 翻找收获：物资已被其他人取走，但你顺手捞到了一颗薄荷糖，体力 +10！`, 'info');
      }
    } else if (targetNode.type === 'secret') {
      this.state.suspicion = Math.max(0, this.state.suspicion - 15);
      this.state.addLog(`🗝️ 隐秘通道：走专用捷径避开了监控与管理层视线，怀疑度 -15%！`, 'item');
    } else if (targetNode.type === 'event') {
      this.evaluateRandomEncounter();
    } else if (targetNode.type === 'boss') {
      this.state.addLog(`🚪 抵达闸机：前面就是一楼大堂终点闸机！等待 18:00 准点打卡脱身！`, 'alert');
    }

    // Step Boss patrol surveillance
    PatrolManager.stepPatrol(this.state);

    if (this.checkVitalConditions()) return;

    this.state.emit('map:update', targetNode);
  }

  executeAction(actionId) {
    if (this.state.currentEnding || this.state.activeEncounter) return;

    sound.playClick();
    const zoneActions = ZONE_ACTIONS[this.state.zone] || [];
    const action = zoneActions.find((a) => a.id === actionId);

    if (!action) return;

    // Calculate energy cost with perks and difficulty
    let energyCost = action.costEnergy || 0;
    if (energyCost > 0) {
      if (this.state.flags.hasSneakersPerk) {
        energyCost = Math.max(1, Math.round(energyCost * 0.85));
      }
      if (this.state.isHardcore) {
        energyCost = Math.round(energyCost * 1.25);
      }
      if (this.state.flags.modQuarterlySprint) {
        energyCost = Math.round(energyCost * 1.2);
      }
    }

    // Advance time and cost energy
    this.state.advanceTime(action.costTime || 1);
    this.state.energy = Math.max(0, Math.min(100, this.state.energy - energyCost));
    this.state.turns++;

    // Execute custom action handler
    const result = action.handler(this.state);

    if (result) {
      if (result.msg) {
        this.state.addLog(result.msg, result.type || 'info');
        toast.show(result.msg, result.type || 'info');
      }

      if (result.triggerEnding) {
        this.triggerEnding(result.triggerEnding);
        return;
      }

      if (result.triggerEncounter) {
        this.triggerEncounterById(result.triggerEncounter);
        return;
      }
    }

    // Step Boss patrol surveillance
    PatrolManager.stepPatrol(this.state);

    // Check life / suspicion thresholds
    if (this.checkVitalConditions()) {
      return;
    }

    // Roll for possible random encounters
    this.evaluateRandomEncounter();
    this.state.notify();
  }

  checkVitalConditions() {
    // 1. Boss suspicion hits 100%
    if (this.state.suspicion >= 100) {
      sound.playAlert();
      this.triggerEnding('ending_caught_meeting');
      return true;
    }

    // 2. Energy hits 0
    if (this.state.energy <= 0) {
      sound.playFail();
      this.triggerEnding('ending_fainted_desk');
      return true;
    }

    // 3. Special condition: Toilet Master if hidden long enough
    if (this.state.flags.toiletMaster && this.state.currentHour >= 21) {
      this.triggerEnding('ending_toilet_philosopher');
      return true;
    }

    return false;
  }

  evaluateRandomEncounter() {
    if (this.state.activeEncounter || this.state.currentEnding) return;

    const possibleEncounters = RANDOM_ENCOUNTERS.filter(
      (enc) => enc.zones.includes(this.state.zone) && !enc.hasOccurred
    );

    let chance = 0.38;
    if (this.state.flags.hasRadarPerk) chance *= 0.75;
    if (this.state.isHardcore) chance *= 1.25;
    if (this.state.flags.modHqInspection && this.state.zone === 2) chance *= 1.3;
    if (this.state.patrolState?.threatLevel === 'danger') {
      chance = Math.min(0.95, chance + 0.35);
    } else if (this.state.patrolState?.threatLevel === 'warning') {
      chance = Math.min(0.95, chance + 0.15);
    }

    if (possibleEncounters.length > 0 && Math.random() < chance) {
      const selected = possibleEncounters[Math.floor(Math.random() * possibleEncounters.length)];
      selected.hasOccurred = true;
      this.triggerEncounter(selected);
    }
  }

  triggerEncounter(encounter) {
    sound.playAlert();
    this.state.activeEncounter = encounter;
    this.state.addLog(`⚠️ 突发状况：${encounter.title}`, 'alert');
    this.state.notify();
  }

  triggerEncounterById(encounterId) {
    const enc = RANDOM_ENCOUNTERS.find((e) => e.id === encounterId);
    if (enc) {
      this.triggerEncounter(enc);
    }
  }

  resolveEncounterChoice(choiceIndex) {
    if (!this.state.activeEncounter) return;

    sound.playClick();
    const encounter = this.state.activeEncounter;
    const choice = encounter.choices[choiceIndex];

    if (!choice) return;

    // Check item requirement if any
    if (choice.requireItem && !this.state.hasItem(choice.requireItem)) {
      this.state.addLog(`道具不足：缺少【${choice.requireItem}】！`, 'warning');
      return;
    }

    const result = choice.outcome(this.state);
    this.state.activeEncounter = null;

    if (result) {
      if (result.msg) {
        this.state.addLog(result.msg, result.type || 'info');
        toast.show(result.msg, result.type || 'info');
      }
      if (result.triggerEnding) {
        this.triggerEnding(result.triggerEnding);
        return result;
      }
    }

    // Check vitals again
    this.checkVitalConditions();
    this.state.notify();
    return result;
  }

  triggerEnding(endingId) {
    const ending = ENDINGS[endingId] || ENDINGS.ending_caught_meeting;
    this.state.currentEnding = ending;

    const isWin = ending.type === 'victory';
    if (isWin) {
      sound.playSuccess();
      this.state.history.victories++;
      this.state.history.roleWins[this.state.selectedRoleId] =
        (this.state.history.roleWins[this.state.selectedRoleId] || 0) + 1;

      if (this.state.isHardcore) {
        this.state.history.hardcoreWins = (this.state.history.hardcoreWins || 0) + 1;
      }
    } else {
      sound.playFail();
    }

    this.state.history.gamesPlayed++;

    if (!this.state.history.unlockedEndings.includes(endingId)) {
      this.state.history.unlockedEndings.push(endingId);
    }

    // Calculate Slacker EXP reward
    let expBase = this.state.turns * 8;
    if (isWin) {
      const rankBonus = {
        'SSS+': 180,
        SSS: 140,
        SS: 110,
        S: 85,
        A: 65,
        B: 45
      };
      expBase += rankBonus[ending.rank] || 50;
    } else {
      expBase += 25; // consolation exp
    }

    if (this.state.isHardcore) expBase *= 1.8;
    if (this.state.flags.modBossRampage) expBase *= 1.5;

    const earnedExp = Math.round(expBase);
    this.state.earnedExp = earnedExp;
    this.state.history.slackerExp = (this.state.history.slackerExp || 0) + earnedExp;

    // Check newly unlocked achievements
    ACHIEVEMENTS.forEach((ach) => {
      if (
        !this.state.history.unlockedAchievements.includes(ach.id) &&
        ach.condition(this.state.history, this.state)
      ) {
        this.state.history.unlockedAchievements.push(ach.id);
        sound.playItem();
        this.state.addLog(`🎉 达成成就：【${ach.title}】 - ${ach.description}`, 'achievement');
      }
    });

    // Daily Challenge score tracking
    if (this.state.dailySeed) {
      if (!this.state.history.dailyHighScores) {
        this.state.history.dailyHighScores = {};
      }
      const dailyScore = DailySystem.calculateDailyScore(this.state);
      const prevScore = this.state.history.dailyHighScores[this.state.dailySeed] || 0;
      if (dailyScore > prevScore) {
        this.state.history.dailyHighScores[this.state.dailySeed] = dailyScore;
      }
    }

    this.state.savePersistentData();
    this.state.notify();
  }

  restart(roleId = null, modifierId = null, isHardcore = null) {
    sound.playClick();
    RANDOM_ENCOUNTERS.forEach((enc) => (enc.hasOccurred = false));
    this.state.reset(roleId, modifierId, isHardcore);
    this.state.notify();
  }
}
