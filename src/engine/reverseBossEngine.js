/**
 * Reverse Boss Mode Engine: 《阎总的一天：逮捕准点逃兵》
 * Play as Boss Yan to patrol, track, and catch fleeing employees before 18:05!
 */

import { ENDINGS } from '../data/endings.js';

export const BOSS_AREAS = [
  { id: 'area_19_office', name: '19楼总裁办', floor: 19, desc: '俯瞰全公司的高管中枢，拥有专属监控大屏与专梯' },
  { id: 'area_18_desk', name: '18楼工位区', floor: 18, desc: '键盘声稀稀拉拉，员工正在鬼鬼祟祟收拾背包' },
  { id: 'area_18_corridor', name: '18楼走廊通道', floor: 18, desc: '连接茶水间与电梯的核心走廊，脚步匆忙' },
  { id: 'area_18_pantry', name: '18楼茶水间', floor: 18, desc: '微波炉与咖啡机旁，经常有摸鱼聚集密谋' },
  { id: 'area_18_lift', name: '18楼电梯厅', floor: 18, desc: '员工聚在客梯前焦虑按键，随时准备开溜' },
  { id: 'area_1_lobby', name: '1楼大堂中央', floor: 1, desc: '出入大厦必经之地，人脸识别闸机就在此处' }
];

export class ReverseBossEngine {
  constructor() {
    this.reset();
  }

  reset() {
    this.currentHour = 17;
    this.currentMinute = 45;
    this.turn = 0;
    this.maxTurns = 8; // 17:45 -> 18:05
    this.majesty = 100; // 威严值 (0-100)
    this.currentFloor = 19;
    this.currentArea = '19楼总裁办';
    this.caughtEmployees = [];
    this.escapedEmployees = [];
    this.targetCaught = 3;
    this.isFinished = false;
    this.result = null; // 'victory' | 'defeat'
    this.resultEnding = null;
    this.isEmployeesStunned = false;

    this.employees = [
      { id: 'emp_dev', name: '后端小刘', role: '后端攻城狮', area: '18楼工位区', floor: 18, stealth: 60, status: 'packing' },
      { id: 'emp_fe', name: '前端阿杰', role: '前端开发', area: '18楼走廊通道', floor: 18, stealth: 50, status: 'sneaking' },
      { id: 'emp_ui', name: 'UI小美', role: '视觉设计师', area: '18楼茶水间', floor: 18, stealth: 70, status: 'sipping' },
      { id: 'emp_pm', name: '产品老张', role: '产品经理', area: '18楼电梯厅', floor: 18, stealth: 45, status: 'waiting_lift' },
      { id: 'emp_intern', name: '实习生小林', role: '清澈实习生', area: '1楼大堂中央', floor: 1, stealth: 30, status: 'approaching_gate' }
    ];

    this.logs = [
      {
        time: '17:45',
        type: 'boss',
        text: '周五 17:45，你化身为【大Boss阎总】！手握热参茶，眼神如鹰隼。目标：在 18:05 前至少逮捕 3 名准点下班逃兵回会议室加班！'
      }
    ];

    return this.getState();
  }

  getState() {
    return {
      time: this.getTimeString(),
      turn: this.turn,
      maxTurns: this.maxTurns,
      majesty: this.majesty,
      currentArea: this.currentArea,
      currentFloor: this.currentFloor,
      caughtEmployees: [...this.caughtEmployees],
      escapedEmployees: [...this.escapedEmployees],
      caughtCount: this.caughtEmployees.length,
      escapedCount: this.escapedEmployees.length,
      targetCaught: this.targetCaught,
      isFinished: this.isFinished,
      result: this.result,
      resultEnding: this.resultEnding,
      employees: this.employees.map((e) => ({ ...e })),
      logs: [...this.logs]
    };
  }

  getTimeString() {
    const hh = String(this.currentHour).padStart(2, '0');
    const mm = String(this.currentMinute).padStart(2, '0');
    return `${hh}:${mm}`;
  }

  advanceTime() {
    this.turn++;
    this.currentMinute += Math.floor(20 / this.maxTurns);
    if (this.currentMinute >= 60) {
      this.currentHour++;
      this.currentMinute -= 60;
    }
  }

  /**
   * Move Boss Yan to target area
   * @param {string} targetAreaName
   */
  moveTo(targetAreaName) {
    if (this.isFinished) return { success: false, message: '抓捕行动已结束' };

    const target = BOSS_AREAS.find((a) => a.name === targetAreaName);
    if (!target) return { success: false, message: '无效目标区域' };

    this.currentArea = target.name;
    this.currentFloor = target.floor;
    this.majesty = Math.max(0, this.majesty - 5);

    this.logs.push({
      time: this.getTimeString(),
      type: 'action',
      text: `阎总大步流星巡查至【${this.currentArea}】！气场全开，周围员工噤若寒蝉。（威严 -5）`
    });

    this.stepTurn();
    return { success: true, state: this.getState() };
  }

  /**
   * Skill 1: 【夺命艾特】
   * Costs 20 majesty. Pings all staff in WeChat / Feishu group.
   */
  useSkillDeadlyAt() {
    if (this.isFinished) return { success: false, message: '行动已结束' };
    if (this.majesty < 20) return { success: false, message: '威严值不足 20 点！' };

    this.majesty -= 20;
    this.isEmployeesStunned = true;

    this.logs.push({
      time: this.getTimeString(),
      type: 'skill',
      text: '阎总掏出手机在500人全员大群发起【夺命艾特】+ 0.01元冲刺攻坚红包！全楼所有员工被迫驻足查看手机！（全员定身 1 回合）'
    });

    // Check if anyone caught distracted
    const inArea = this.employees.filter((e) => e.area === this.currentArea && !this.caughtEmployees.some((c) => c.id === e.id) && !this.escapedEmployees.some((esc) => esc.id === e.id));
    if (inArea.length > 0) {
      const caughtTarget = inArea[0];
      this.caughtEmployees.push(caughtTarget);
      this.logs.push({
        time: this.getTimeString(),
        type: 'catch',
        text: `【现场擒获】${caughtTarget.name}（${caughtTarget.role}）低头抢红包被阎总当场抓包！“抢了我的红包，今晚留下来攻坚吧！”（抓捕 +1）`
      });
    }

    this.stepTurn(false);
    return { success: true, state: this.getState() };
  }

  /**
   * Skill 2: 【突击查岗】
   * Costs 15 majesty. Thoroughly search current area, uncovering stealthy employees.
   */
  useSkillRaidInspection() {
    if (this.isFinished) return { success: false, message: '行动已结束' };
    if (this.majesty < 15) return { success: false, message: '威严值不足 15 点！' };

    this.majesty -= 15;

    this.logs.push({
      time: this.getTimeString(),
      type: 'skill',
      text: `阎总在【${this.currentArea}】展开【突击查岗】！一把掀开椅背假外套，猛敲洗手间隔板！`
    });

    const activeInArea = this.employees.filter((e) => e.area === this.currentArea && !this.caughtEmployees.some((c) => c.id === e.id) && !this.escapedEmployees.some((esc) => esc.id === e.id));

    if (activeInArea.length > 0) {
      activeInArea.forEach((target) => {
        this.caughtEmployees.push(target);
        this.logs.push({
          time: this.getTimeString(),
          type: 'catch',
          text: `【突击擒获】识破伪装！${target.name}（${target.role}）藏匿在角落被阎总一把揪出！“想金蝉脱壳？回会议室去！”（抓捕 +1）`
        });
      });
    } else {
      this.logs.push({
        time: this.getTimeString(),
        type: 'warning',
        text: `【扑了个空】阎总在【${this.currentArea}】巡视了一圈，除了一台冒烟的饮水机，空无一人！`
      });
    }

    this.stepTurn();
    return { success: true, state: this.getState() };
  }

  /**
   * Skill 3: 【专梯伏击】
   * Costs 30 majesty. Teleports Boss Yan instantly to 1F Lobby gate.
   */
  useSkillLiftAmbush() {
    if (this.isFinished) return { success: false, message: '行动已结束' };
    if (this.majesty < 30) return { success: false, message: '威严值不足 30 点！' };

    this.majesty -= 30;
    this.currentFloor = 1;
    this.currentArea = '1楼大堂中央';

    this.logs.push({
      time: this.getTimeString(),
      type: 'skill',
      text: '阎总刷高管黑金卡，乘坐 1 号总裁专梯无视任何楼层直降 1 楼大堂！如门神般横刀立马堵在打卡闸机前！'
    });

    // Catch anyone currently at 1F lobby trying to punch out
    const lobbyEmployees = this.employees.filter((e) => e.area === '1楼大堂中央' && !this.caughtEmployees.some((c) => c.id === e.id) && !this.escapedEmployees.some((esc) => esc.id === e.id));

    lobbyEmployees.forEach((emp) => {
      this.caughtEmployees.push(emp);
      this.logs.push({
        time: this.getTimeString(),
        type: 'catch',
        text: `【闸机截击】${emp.name}刚想伸脸识别人脸打卡，被电梯里走出来的阎总逮个正着！“小李啊，手速挺快啊，跟我回会议室！”（抓捕 +1）`
      });
    });

    this.stepTurn();
    return { success: true, state: this.getState() };
  }

  /**
   * Skill 4: 【紧急拉会】
   * Costs 25 majesty. Summons an emergency meeting, stunning all escaping employees for 1 turn.
   */
  useSkillEmergencyMeeting() {
    if (this.isFinished) return { success: false, message: '行动已结束' };
    if (this.majesty < 25) return { success: false, message: '威严值不足 25 点！' };

    this.majesty -= 25;
    this.isEmployeesStunned = true;

    this.logs.push({
      time: this.getTimeString(),
      type: 'skill',
      text: '阎总在全员群发出一键召集令：【全员紧急碰头会】！刺耳警报在各区域回荡，所有正在撤退的员工步伐被迫定身 1 回合！'
    });

    this.stepTurn(false);
    return { success: true, state: this.getState() };
  }


  /**
   * Step world turn, advance employees AI, and check game outcome
   */
  stepTurn(allowEmployeeMove = true) {
    this.advanceTime();

    // 1. Employees advance towards exit unless stunned
    if (allowEmployeeMove && !this.isEmployeesStunned) {
      this.employees.forEach((emp) => {
        // Skip already resolved
        if (this.caughtEmployees.some((c) => c.id === emp.id)) return;
        if (this.escapedEmployees.some((esc) => esc.id === emp.id)) return;

        // Path: 18F 工位/茶水 -> 18F 走廊 -> 18F 电梯厅 -> 1F 大堂 -> 逃脱
        if (emp.area === '18楼工位区' || emp.area === '18楼茶水间') {
          emp.area = '18楼走廊通道';
          emp.status = 'sneaking';
        } else if (emp.area === '18楼走廊通道') {
          emp.area = '18楼电梯厅';
          emp.status = 'waiting_lift';
        } else if (emp.area === '18楼电梯厅') {
          emp.area = '1楼大堂中央';
          emp.floor = 1;
          emp.status = 'approaching_gate';
        } else if (emp.area === '1楼大堂中央') {
          // If boss is at lobby, intercept!
          if (this.currentArea === '1楼大堂中央') {
            this.caughtEmployees.push(emp);
            this.logs.push({
              time: this.getTimeString(),
              type: 'catch',
              text: `【撞个满怀】${emp.name}冲向旋转门，正好撞进阎总怀里！当场被拎小鸡般扣押！（抓捕 +1）`
            });
          } else {
            // Otherwise, escaped!
            this.escapedEmployees.push(emp);
            this.logs.push({
              time: this.getTimeString(),
              type: 'escape',
              text: `【员工逃脱】${emp.name}（${emp.role}）趁着一楼无老板，刷卡冲出旋转门顺利下班！（逃离 +1）`
            });
          }
        }
      });
    }

    this.isEmployeesStunned = false;

    // 2. Check Victory / Defeat conditions
    if (this.caughtEmployees.length >= this.targetCaught) {
      this.isFinished = true;
      this.result = 'victory';
      this.resultEnding = ENDINGS.ending_reverse_boss_win;
      this.logs.push({
        time: this.getTimeString(),
        type: 'victory',
        text: '🎉【抓捕大捷】阎总已抓获 3 名核心骨干！今晚会议室座无虚席，战略拉通圆满达成！'
      });
      return;
    }

    if (this.escapedEmployees.length >= 3) {
      this.isFinished = true;
      this.result = 'defeat';
      this.resultEnding = ENDINGS.ending_reverse_boss_loss;
      this.logs.push({
        time: this.getTimeString(),
        type: 'defeat',
        text: '💔【抓捕失败】已有 3 名员工逃离大厦！工位区空空荡荡，阎总只能独自面对孤独的白板！'
      });
      return;
    }

    if (this.turn >= this.maxTurns) {
      this.isFinished = true;
      if (this.caughtEmployees.length >= this.targetCaught) {
        this.result = 'victory';
        this.resultEnding = ENDINGS.ending_reverse_boss_win;
      } else {
        this.result = 'defeat';
        this.resultEnding = ENDINGS.ending_reverse_boss_loss;
      }
      return;
    }

    if (this.majesty <= 0) {
      this.isFinished = true;
      this.result = 'defeat';
      this.resultEnding = ENDINGS.ending_reverse_boss_loss;
      this.logs.push({
        time: this.getTimeString(),
        type: 'defeat',
        text: '💔【威信扫地】阎总威严耗尽，员工们对查岗视若无睹，堂而皇之从身边走过！'
      });
    }
  }
}
