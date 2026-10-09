/**
 * Workplace Modifiers & Daily Weather Conditions
 * Adds rogue-lite unpredictability and situational bonuses/penalties to each run
 */

export const MODIFIERS = [
  {
    id: 'mod_normal',
    name: '平静周五',
    icon: '☀️',
    badge: '常态',
    color: '#38bdf8',
    description: '普通的周五傍晚，办公室暗流涌动，大家都在等待18:00的钟声。',
    effectText: '标准游戏规则与常规环境。',
    apply: () => {}
  },
  {
    id: 'mod_boss_rampage',
    name: '阎总暴走日',
    icon: '⚡',
    badge: '高危挑战',
    color: '#f43f5e',
    description: '大Boss刚被投资人质询，心情极度暴躁，正背着手全场巡逻！',
    effectText: '初始老板怀疑度 +15%，行动怀疑度增加 +20%，通关结算悟性点数翻倍！',
    apply: (state) => {
      state.suspicion += 15;
      state.flags.modBossRampage = true;
    }
  },
  {
    id: 'mod_network_crash',
    name: '全司内网宕机',
    icon: '🌐',
    badge: '混乱摸鱼',
    color: '#a855f7',
    description: '核心路由器突发故障，全公司断网，工位电脑全部瘫痪！',
    effectText: '障眼法效果极大增强，技术伪装怀疑度降低翻倍，阎总难以查证实际进度。',
    apply: (state) => {
      state.flags.modNetworkDown = true;
    }
  },
  {
    id: 'mod_hq_inspection',
    name: '集团总部突击飞巡',
    icon: '👔',
    badge: '戒严巡察',
    color: '#f59e0b',
    description: '集团VP突然带队巡视，走廊与电梯厅戒备森严，但一楼侧门管理出现混乱。',
    effectText: '走廊遭遇概率提升，但保安老王更加倾向于掩护基层员工。',
    apply: (state) => {
      state.flags.modHqInspection = true;
    }
  },
  {
    id: 'mod_friday_tea',
    name: '下午茶投喂狂欢',
    icon: '🍕',
    badge: '体力充沛',
    color: '#10b981',
    description: '行政今天订了超大份免费蛋挞、奶茶和披萨，整个茶水间香气扑鼻！',
    effectText: '所有零食与饮料体力恢复效果提升 50%，工位搜索更易发现额外补给。',
    apply: (state) => {
      state.flags.modFridayTea = true;
    }
  },
  {
    id: 'mod_quarterly_sprint',
    name: '季度OKR决战周',
    icon: '🚨',
    badge: '风声鹤唳',
    color: '#e11d48',
    description: '季度最后冲刺阶段，各部门都在抓壮丁通宵，群里红包陷阱频繁！',
    effectText: '行动消耗体力 +20%，随机遭遇中产品经理阿强出现率翻倍。',
    apply: (state) => {
      state.flags.modQuarterlySprint = true;
    }
  }
];

export function getRandomModifier() {
  const rand = Math.floor(Math.random() * MODIFIERS.length);
  return MODIFIERS[rand];
}
