/**
 * Core Game Engine: Handles turn loops, encounter triggers, ending conditions & achievements
 */

import { RANDOM_ENCOUNTERS, ZONE_ACTIONS } from '../data/events.js';
import { ENDINGS } from '../data/endings.js';
import { ACHIEVEMENTS } from '../data/achievements.js';
import { sound } from '../audio/sound.js';

export class GameEngine {
  constructor(state) {
    this.state = state;
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
      }
      if (result.triggerEnding) {
        this.triggerEnding(result.triggerEnding);
        return;
      }
    }

    // Check vitals again
    this.checkVitalConditions();
    this.state.notify();
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
