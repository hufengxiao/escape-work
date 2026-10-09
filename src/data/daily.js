/**
 * Daily Workplace Almanac (每日职场黄历) & Seeded Challenge System
 */

import { PRNG } from '../utils/prng.js';

export const DAILY_AUSPICIOUS_POOL = [
  { id: 'good_toilet', name: '宜：带薪如厕', desc: '洗手间行动体力恢复翻倍，怀疑度自然衰减加快。' },
  { id: 'good_headphones', name: '宜：戴降噪耳机', desc: '对所有路过同事八卦与HR盘问免疫 1 次。' },
  { id: 'good_stairs', name: '宜：走消防安全梯', desc: '消防步梯体力消耗减少 40%，且绝对安全。' },
  { id: 'good_coffee', name: '宜：手捧热咖啡', desc: '茶水间与走廊移动气场拉满，怀疑度增长降低 30%。' },
  { id: 'good_water', name: '宜：多喝温水', desc: '每回合体力自然回复 +2 点。' }
];

export const DAILY_INAUSPICIOUS_POOL = [
  { id: 'bad_dingtalk', name: '忌：秒回工作消息', desc: '群内消息或来电处理不当将导致怀疑度增长双倍！' },
  { id: 'bad_elevator', name: '忌：走1号高客专梯', desc: '电梯间高管出没概率提升 100%！' },
  { id: 'bad_printer', name: '忌：在打印机前逗留', desc: '打印机卡纸故障率激增，易引来行政主管。' },
  { id: 'bad_overtime_chat', name: '忌：与产品经理对视', desc: '需求刺客阿强初始好感度额外 -25。' },
  { id: 'bad_snack', name: '忌：工位吃重口味零食', desc: '香气四溢容易吸引路过总监侧目。' }
];

export class DailySystem {
  /**
   * Get formatted local date string YYYY-MM-DD
   * @param {Date} [dateObj]
   * @returns {string}
   */
  static getTodayDateString(dateObj = new Date()) {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  /**
   * Generates deterministic daily almanac based on date string
   * @param {string} dateStr
   * @returns {Object}
   */
  static generateDailyAlmanac(dateStr = DailySystem.getTodayDateString()) {
    const prng = new PRNG(dateStr);

    const goodIdx = prng.randInt(0, DAILY_AUSPICIOUS_POOL.length - 1);
    const badIdx = prng.randInt(0, DAILY_INAUSPICIOUS_POOL.length - 1);

    const good = DAILY_AUSPICIOUS_POOL[goodIdx];
    const bad = DAILY_INAUSPICIOUS_POOL[badIdx];

    return {
      date: dateStr,
      seed: dateStr,
      lunarQuote: `岁次丙午 · 周五冲刺 · 忌加班 · 宜准点`,
      good,
      bad
    };
  }

  /**
   * Calculates comprehensive Slacker Score for daily ladder
   * @param {Object} state
   * @returns {number}
   */
  static calculateDailyScore(state) {
    const isWin = state.currentEnding && state.currentEnding.type === 'victory';
    const baseWin = isWin ? 1000 : 200;
    const suspicionBonus = Math.max(0, (100 - state.suspicion) * 15);
    const energyBonus = Math.max(0, state.energy * 10);
    const timePenalty = Math.max(0, state.turns * 25);
    const expBonus = (state.earnedExp || 0) * 3;

    return Math.max(0, Math.round(baseWin + suspicionBonus + energyBonus - timePenalty + expBonus));
  }
}
