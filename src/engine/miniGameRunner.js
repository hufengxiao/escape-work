/**
 * Mini-Games Engine: Buzzword battle, red packet minefield, and clock-out QTE runner
 */

import { calculateBuzzwordScore } from '../data/buzzwords.js';

export class MiniGameRunner {
  /**
   * Evaluates the 6-second buzzword battle submission
   * @param {string[]} chosenIds
   * @param {string} roleId
   * @returns {Object}
   */
  static evaluateBuzzwordBattle(chosenIds, roleId = 'backend_dev') {
    const score = calculateBuzzwordScore(chosenIds, roleId);

    if (score >= 80) {
      return {
        grade: 'VICTORY',
        score,
        suspicionDelta: -15,
        energyDelta: 5,
        msg: `🎯【黑话降维打击】得分 ${score}！高管被震慑得连连点头，原地掏出手机做笔记，怀疑度 -15%！`
      };
    } else if (score >= 50) {
      return {
        grade: 'PASS',
        score,
        suspicionDelta: 5,
        energyDelta: -5,
        msg: `👌【勉强拉通对齐】得分 ${score}。高管半信半疑：“行吧，下周一发邮件给我。” 怀疑度 +5%，放行。`
      };
    } else {
      return {
        grade: 'FAIL',
        score,
        suspicionDelta: 25,
        energyDelta: -10,
        msg: `💥【当场破绽百出】得分 ${score}！语无伦次被高管当场揭穿画饼，怀疑度 +25%！`
      };
    }
  }

  /**
   * Resolves red packet choice in WeChat group sprint event
   * @param {'skip'|'first'|'last'} choiceType
   * @param {number} ahWeiFavor
   * @param {number} randomRoll - float in [0, 1)
   * @returns {Object}
   */
  static resolveRedPacketChoice(choiceType, ahWeiFavor = 40, randomRoll = Math.random()) {
    if (choiceType === 'skip') {
      if (ahWeiFavor < 0 && randomRoll < 0.5) {
        return {
          type: 'skip_tagged',
          amount: 0,
          suspicionDelta: 15,
          energyDelta: 0,
          msg: '📴 你忍住没抢红包，但阿伟因好感度低在群里艾特你：“@小李 怎么不抢？还在工位吗？” 老板怀疑度 +15%！'
        };
      }
      return {
        type: 'skip_safe',
        amount: 0,
        suspicionDelta: -5,
        energyDelta: 0,
        msg: '🧘 静观其变：你装作没看见群消息，悄无声息避开焦点，怀疑度 -5%。'
      };
    }

    if (choiceType === 'first') {
      if (randomRoll < 0.7) {
        return {
          type: 'first_poison',
          amount: 0.01,
          suspicionDelta: 25,
          energyDelta: -10,
          msg: '☠️【0.01元剧毒陷阱】你手速极快抢到 0.01 元手气最差！老板立刻发语音：“运气这么好，今晚生产运维值班就交给你了！” 怀疑度 +25%！'
        };
      } else {
        return {
          type: 'first_jackpot',
          amount: 88.0,
          suspicionDelta: -10,
          energyDelta: 20,
          msg: '💰【手气最佳手气王】你一发入魂抢到 88 元暴富红包！同事们纷纷发“老板大气”，注意力被完全转移，体力 +20，怀疑度 -10%！'
        };
      }
    }

    if (choiceType === 'last') {
      if (randomRoll < 0.8) {
        return {
          type: 'last_safe',
          amount: 2.5,
          suspicionDelta: 0,
          energyDelta: 10,
          msg: '🧧【掐表捡漏成功】大家抢完后你淡定收下 2.50 元阳光普照奖，未引起任何高管注意，体力 +10！'
        };
      } else {
        return {
          type: 'last_missed',
          amount: 0,
          suspicionDelta: 0,
          energyDelta: 0,
          msg: '💨【手慢无】红包已被瞬间抢光，好在毫不起眼，安然无恙。'
        };
      }
    }

    return { type: 'unknown', amount: 0, suspicionDelta: 0, energyDelta: 0, msg: '无事发生。' };
  }

  /**
   * Evaluate the exact 18:00 clock-out QTE stop
   * Target timestamp corresponds to exactly 18:00:00.000
   * @param {number} targetTimestamp
   * @param {number} clickedTimestamp
   * @returns {Object}
   */
  static evaluateClockOutQTE(targetTimestamp, clickedTimestamp) {
    const diffMs = clickedTimestamp - targetTimestamp;

    // Window: -200ms to +500ms is PERFECT
    if (diffMs >= -200 && diffMs <= 500) {
      return {
        grade: 'PERFECT',
        diffMs,
        scoreBonus: 2.0,
        triggerVictory: true,
        msg: `⏱️【神仙压线打卡】毫秒差 ${diffMs > 0 ? '+' : ''}${diffMs}ms！分秒不差，完美压线！结算积分翻倍！`
      };
    } else if (diffMs < -200) {
      return {
        grade: 'EARLY',
        diffMs,
        scoreBonus: 0.5,
        suspicionDelta: 35,
        msg: `🚨【早退警报触发】提前了 ${Math.abs(diffMs)}ms！闸机广播大声播报：“考勤异常！”，怀疑度飙升！`
      };
    } else {
      return {
        grade: 'LATE',
        diffMs,
        scoreBonus: 0.8,
        suspicionDelta: 15,
        msg: `⚠️【人流阻塞延迟】晚了 +${diffMs}ms！下班大部队涌入大堂，领导专用直梯开门，行动受阻！`
      };
    }
  }
}
