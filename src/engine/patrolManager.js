/**
 * Boss Patrol Engine & Workplace Radar Surveillance Manager
 */

export class PatrolManager {
  /**
   * Initializes or resets Boss patrol state in GameState
   * @param {Object} state
   */
  static initPatrol(state) {
    state.patrolState = {
      bossId: 'boss_yan',
      bossName: '大Boss阎总',
      currentFloor: 19,
      currentArea: '19楼总裁办',
      movementCountdown: 2,
      behaviorState: 'roaming', // 'roaming' | 'alert' | 'distracted'
      threatLevel: 'safe',      // 'safe' | 'warning' | 'danger'
      distractedTurns: 0,
      distractedReason: '',
      lastBroadcast: '【监控简报】[17:45] 阎总正在 19 楼训斥运营总监，距离本层尚远。'
    };
    PatrolManager.updateMapThreatFlags(state);
  }

  /**
   * Advance patrol state by 1 turn and update threats
   * @param {Object} state
   * @returns {Object}
   */
  static stepPatrol(state) {
    if (!state.patrolState) {
      PatrolManager.initPatrol(state);
    }

    const ps = state.patrolState;

    // 1. Handle distracted state
    if (ps.distractedTurns > 0) {
      ps.distractedTurns--;
      if (ps.distractedTurns === 0) {
        ps.behaviorState = 'roaming';
        ps.lastBroadcast = `【监控简报】[${state.getTimeString()}] 阎总察觉异常已被排除，重新恢复巡查动线！`;
      } else {
        ps.behaviorState = 'distracted';
        ps.threatLevel = 'safe';
        ps.lastBroadcast = `【监控简报】[${state.getTimeString()}] 阎总仍被诱饵牵制在【${ps.distractedReason || '其他区域'}】！(剩余 ${ps.distractedTurns} 回合)`;
        PatrolManager.updateMapThreatFlags(state);
        state.emit('patrol:move', ps);
        return ps;
      }
    }

    // 2. Normal patrol motion based on elapsed game turns
    if (state.turns <= 2) {
      ps.currentFloor = 19;
      ps.currentArea = '19楼总裁办';
      ps.lastBroadcast = `【监控简报】[${state.getTimeString()}] 阎总正在 19 楼闭门签署季度预算，本层视野安全。`;
    } else if (state.turns <= 5) {
      ps.currentFloor = 18;
      ps.currentArea = '18楼办公区主走廊';
      ps.lastBroadcast = `【监控简报】[${state.getTimeString()}] 阎总已搭乘消防走梯步入 18 楼！正向茶水间巡视！`;
    } else if (state.turns <= 8) {
      ps.currentFloor = 18;
      ps.currentArea = '18楼电梯厅通道';
      ps.lastBroadcast = `【监控简报】[${state.getTimeString()}] 阎总驻足在 18 楼客梯口，目光扫视周围所有经过员工！`;
    } else {
      ps.currentFloor = 1;
      ps.currentArea = '1楼大堂中央闸机';
      ps.lastBroadcast = `【监控简报】[${state.getTimeString()}] 阎总乘高管专梯直达 1 楼大堂！正在闸机前守株待兔！`;
    }

    // 3. Compute threat level relative to player's current zone
    // Player zones: 1 (Desk), 2 (Corridor), 3 (Elevator), 4 (Lobby)
    if (ps.currentFloor === 18) {
      if (
        (ps.currentArea.includes('走廊') && state.zone === 2) ||
        (ps.currentArea.includes('电梯') && state.zone === 3)
      ) {
        ps.threatLevel = 'danger';
        ps.behaviorState = 'alert';
      } else {
        ps.threatLevel = 'warning';
      }
    } else if (ps.currentFloor === 1 && state.zone === 4) {
      ps.threatLevel = 'danger';
      ps.behaviorState = 'alert';
    } else {
      ps.threatLevel = 'safe';
      ps.behaviorState = 'roaming';
    }

    PatrolManager.updateMapThreatFlags(state);
    state.emit('patrol:move', ps);
    return ps;
  }

  /**
   * Updates map nodes' hasBossThreat boolean in DAG graph
   * @param {Object} state
   */
  static updateMapThreatFlags(state) {
    if (!state.mapGraph || !state.patrolState) return;
    const ps = state.patrolState;

    state.mapGraph.forEach((layer, depth) => {
      layer.forEach((node) => {
        if (ps.threatLevel === 'danger' && depth === state.zone - 1) {
          node.hasBossThreat = true;
        } else if (ps.threatLevel === 'warning' && depth === state.zone - 1) {
          node.hasBossThreat = Math.random() < 0.5;
        } else {
          node.hasBossThreat = false;
        }
      });
    });
  }

  /**
   * Execute environmental decoy tactic
   * @param {Object} state
   * @param {'fake_alarm'|'fake_meeting'|'printer_jam'} decoyType
   * @returns {Object}
   */
  static triggerDecoy(state, decoyType) {
    if (!state.patrolState) PatrolManager.initPatrol(state);
    const ps = state.patrolState;

    if (decoyType === 'fake_alarm') {
      ps.distractedTurns = 3;
      ps.distractedReason = '15楼核心机房P0告警排查';
      ps.currentFloor = 15;
      ps.currentArea = '15楼弱电机房';
      ps.threatLevel = 'safe';
      ps.behaviorState = 'distracted';
      state.suspicion = Math.max(0, state.suspicion - 20);
      state.addLog(
        '🚨【声东击西】伪造的P0运维告警短信生效！阎总带领运维总监奔赴15楼机房！本层威胁清空3回合！',
        'item'
      );
      return { success: true, message: '成功引开阎总至15楼机房！' };
    }

    if (decoyType === 'fake_meeting') {
      ps.distractedTurns = 4;
      ps.distractedReason = '飞书紧急预算审批闭门会';
      ps.currentFloor = 19;
      ps.currentArea = '19楼高管闭门会议室';
      ps.threatLevel = 'safe';
      ps.behaviorState = 'distracted';
      state.suspicion = Math.max(0, state.suspicion - 15);
      state.addLog(
        '📅【声东击西】在飞书日历上预约的“紧急预算闭门会”生效！阎总被锁在会议室等待开会4回合！',
        'item'
      );
      return { success: true, message: '阎总已被虚假会议锁定！' };
    }

    if (decoyType === 'printer_jam') {
      ps.distractedTurns = 2;
      ps.distractedReason = '主打印机狂吐废纸故障骚动';
      ps.threatLevel = 'safe';
      ps.behaviorState = 'distracted';
      state.suspicion = Math.max(0, state.suspicion - 10);
      state.addLog(
        '🖨️【声东击西】打印机狂喷废纸引起全层围观！所有人视线被引开，怀疑度 -10%！',
        'item'
      );
      return { success: true, message: '打印机骚动成功掩护你的行踪！' };
    }

    return { success: false, message: '未知的诱饵指令' };
  }
}
