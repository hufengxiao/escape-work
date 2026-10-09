/**
 * Overtime Nightmare Survival Engine: 《周五深夜大逃杀》
 * Endure the endless overtime from Friday 20:00 to Saturday 06:00!
 */

import { OVERTIME_EVENTS, OVERTIME_ACTIONS } from '../data/overtimeEvents.js';
import { ENDINGS } from '../data/endings.js';

export class OvertimeEngine {
  constructor() {
    this.reset();
  }

  reset() {
    this.currentHour = 20;
    this.currentMinute = 0;
    this.turn = 0;
    this.maxTurns = 20; // 20 turns * 30 min = 10 hours -> 06:00
    this.sanity = 100;
    this.energy = 100;
    this.presence = 40; // Safe zone: 20 ~ 60
    this.isFinished = false;
    this.result = null; // 'victory' | 'defeat'
    this.resultEnding = null;
    this.defeatReason = '';

    this.logs = [
      {
        time: '20:00',
        type: 'system',
        text: '周五 20:00，逃脱失败的你被抓进了第 1 会议室！大门已被反锁。目标：在清醒值与体能归零前保持合理存在感（20%~60%），硬熬至明晨 06:00 晨曦破晓！'
      }
    ];

    return this.getState();
  }

  getState() {
    return {
      time: this.getTimeString(),
      turn: this.turn,
      maxTurns: this.maxTurns,
      sanity: this.sanity,
      energy: this.energy,
      presence: this.presence,
      isPresenceSafe: this.presence >= 20 && this.presence <= 60,
      isFinished: this.isFinished,
      result: this.result,
      resultEnding: this.resultEnding,
      defeatReason: this.defeatReason,
      logs: [...this.logs]
    };
  }

  getTimeString() {
    const hh = String(this.currentHour).padStart(2, '0');
    const mm = String(this.currentMinute).padStart(2, '0');
    return `${hh}:${mm}`;
  }

  advanceClock() {
    this.turn++;
    this.currentMinute += 30;
    if (this.currentMinute >= 60) {
      this.currentHour = (this.currentHour + 1) % 24;
      this.currentMinute = 0;
    }
  }

  /**
   * Execute an overtime survival action
   * @param {string} actionId
   */
  performAction(actionId) {
    if (this.isFinished) {
      return { success: false, message: '夜战已结束' };
    }

    const action = OVERTIME_ACTIONS.find((a) => a.id === actionId);
    if (!action) {
      return { success: false, message: '无效行动' };
    }

    // 1. Apply action effects
    this.sanity = Math.max(0, Math.min(100, this.sanity + action.sanity));
    this.energy = Math.max(0, Math.min(100, this.energy + action.energy));
    this.presence = Math.max(0, Math.min(100, this.presence + action.presence));

    this.logs.push({
      time: this.getTimeString(),
      type: 'action',
      text: action.log
    });

    // 2. Natural decay over 30 minutes
    this.sanity = Math.max(0, this.sanity - 3);
    this.energy = Math.max(0, this.energy - 3);

    // 3. Presence danger evaluation
    if (this.presence < 20) {
      this.sanity = Math.max(0, this.sanity - 10);
      this.logs.push({
        time: this.getTimeString(),
        type: 'warning',
        text: '⚠️【存在感过低】阎总猛一转头盯住角落：“小李你是不是在走神摸鱼？！”冷汗直流，精神高度紧绷！（清醒 -10）'
      });
    } else if (this.presence > 60) {
      this.energy = Math.max(0, this.energy - 15);
      this.sanity = Math.max(0, this.sanity - 10);
      this.logs.push({
        time: this.getTimeString(),
        type: 'warning',
        text: '⚠️【存在感过高】阎总赞赏地点点头：“小李很有主人翁意识！今晚会议纪要与明天宣讲PPT由你连夜整理！”（体能 -15，清醒 -10）'
      });
    }

    // 4. Advance clock by 30 mins
    this.advanceClock();

    // 5. Random event encounter on certain turns
    this.checkRandomEvent();

    // 6. Check End Conditions
    if (this.sanity <= 0) {
      this.isFinished = true;
      this.result = 'defeat';
      this.resultEnding = ENDINGS.ending_overtime_collapse;
      this.defeatReason = '清醒值归零！你在会议桌上呼呼大睡，口水浸湿了OKR方案，被阎总抓了现行！';
      this.logs.push({
        time: this.getTimeString(),
        type: 'defeat',
        text: `💔【精神崩溃】${this.defeatReason}`
      });
    } else if (this.energy <= 0) {
      this.isFinished = true;
      this.result = 'defeat';
      this.resultEnding = ENDINGS.ending_overtime_collapse;
      this.defeatReason = '体能彻底耗尽！连续高压熬夜导致两眼发黑，被行政小花扶进医务室挂水！';
      this.logs.push({
        time: this.getTimeString(),
        type: 'defeat',
        text: `💔【身体透支】${this.defeatReason}`
      });
    } else if (this.turn >= this.maxTurns) {
      this.isFinished = true;
      this.result = 'victory';
      this.resultEnding = ENDINGS.ending_overtime_god;
      this.logs.push({
        time: this.getTimeString(),
        type: 'victory',
        text: '🌅【晨曦破晓】06:00 已到！阎总趴在白板前打鼾，你迎着朝阳昂首踏出会议室！达成传奇结局【职场不灭战神】！'
      });
    }

    return { success: true, state: this.getState() };
  }

  checkRandomEvent() {
    // 30% chance each turn to trigger a narrative event matching hour
    if (Math.random() < 0.35) {
      const candidates = OVERTIME_EVENTS.filter((ev) => this.currentHour >= ev.minHour || (this.currentHour <= 6 && ev.minHour <= 6));
      if (candidates.length > 0) {
        const ev = candidates[Math.floor(Math.random() * candidates.length)];
        if (ev.effect.sanity) this.sanity = Math.max(0, Math.min(100, this.sanity + ev.effect.sanity));
        if (ev.effect.energy) this.energy = Math.max(0, Math.min(100, this.energy + ev.effect.energy));
        if (ev.effect.presenceMod) this.presence = Math.max(0, Math.min(100, this.presence + ev.effect.presenceMod));

        this.logs.push({
          time: this.getTimeString(),
          type: 'event',
          text: `⚡【突发】${ev.title}：${ev.text}`
        });
      }
    }
  }
}
