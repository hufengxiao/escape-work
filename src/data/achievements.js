/**
 * Achievements System & Trophies
 */

export const ACHIEVEMENTS = [
  {
    id: 'ach_perfect',
    title: '准点刺客',
    icon: '⏱️',
    description: '达成【神仙准点打卡】结局，18:00分秒不差逃出生天。',
    condition: (history) => history.unlockedEndings.includes('ending_perfect_clockout')
  },
  {
    id: 'ach_decoy',
    title: '金蝉脱壳',
    icon: '🧥',
    description: '达成【替身使者·金蝉脱壳】结局，完美戏耍老板。',
    condition: (history) => history.unlockedEndings.includes('ending_decoy_master')
  },
  {
    id: 'ach_ninja',
    title: '楼梯疾风传',
    icon: '🏃',
    description: '走18层安全楼梯脱身，体能超群！',
    condition: (history) => history.unlockedEndings.includes('ending_stair_sprinter')
  },
  {
    id: 'ach_guard',
    title: '保安大爷拜把子',
    icon: '🚬',
    description: '送出华子并走VIP后门逃脱。',
    condition: (history) => history.unlockedEndings.includes('ending_guard_brother')
  },
  {
    id: 'ach_pie',
    title: '画饼大帝',
    icon: '👑',
    description: '达成【反客为主·画饼天尊】，让老板派车相送。',
    condition: (history) => history.unlockedEndings.includes('ending_reverse_pie')
  },
  {
    id: 'ach_law',
    title: '法治之光',
    icon: '⚖️',
    description: '亮出《劳动法》当场震慑管理层。',
    condition: (history) => history.unlockedEndings.includes('ending_labor_law')
  },
  {
    id: 'ach_toilet',
    title: '马桶沉思者',
    icon: '🚽',
    description: '在洗手间坚持苟活并斩获夜宵餐补。',
    condition: (history) => history.unlockedEndings.includes('ending_toilet_philosopher')
  },
  {
    id: 'ach_overtime_victim',
    title: '周五祭品',
    icon: '💀',
    description: '被卷入无休止的深夜会议深渊。',
    condition: (history) => history.unlockedEndings.includes('ending_caught_meeting')
  },
  {
    id: 'ach_pm_bait',
    title: '两分钟的谎言',
    icon: '🐛',
    description: '听信产品经理“两分钟小需求”导致集群崩溃。',
    condition: (history) => history.unlockedEndings.includes('ending_pm_sacrifice')
  },
  {
    id: 'ach_collector',
    title: '摸鱼万宝全书',
    icon: '🎒',
    description: '单局游戏中背包同时集齐 4 件以上摸鱼神物。',
    condition: (history, state) => state && state.inventory && state.inventory.length >= 4
  },
  {
    id: 'ach_delivery',
    title: '美团特约特工',
    icon: '🛵',
    description: '达成【外卖骑手伪装大师】结局，绝妙伪装。',
    condition: (history) => history.unlockedEndings.includes('ending_delivery_disguise')
  },
  {
    id: 'ach_cleaner',
    title: '后勤隐士',
    icon: '🧹',
    description: '达成【保洁阿姨的关门弟子】结局，掌控大厦命脉。',
    condition: (history) => history.unlockedEndings.includes('ending_cleaner_disciple')
  },
  {
    id: 'ach_resign',
    title: '掀桌第一人',
    icon: '💥',
    description: '达成【离职威慑·当场加薪】结局，职场正道之光。',
    condition: (history) => history.unlockedEndings.includes('ending_resign_shock')
  },
  {
    id: 'ach_true_partner',
    title: '反客为主大股东',
    icon: '👑',
    description: '达成【假戏真做·红杉合伙人】结局，下班顺手当老板。',
    condition: (history) => history.unlockedEndings.includes('ending_true_partner')
  },
  {
    id: 'ach_hardcore_win',
    title: '修罗场幸存者',
    icon: '🔥',
    description: '在地狱加班修罗场模式下成功胜利出逃！',
    condition: (history, state) => state && state.isHardcore && state.currentEnding && state.currentEnding.type === 'victory'
  },
  {
    id: 'ach_perk_master',
    title: '职场得道飞升',
    icon: '🧬',
    description: '在摸鱼天赋树中累计点亮至少 3 个永久特质。',
    condition: (history) => history.unlockedPerks && history.unlockedPerks.length >= 3
  },
  {
    id: 'ach_master',
    title: '逃跑大满贯',
    icon: '🌟',
    description: '累计解锁至少 18 个不同结局！',
    condition: (history) => history.unlockedEndings.length >= 18
  },
  {
    id: 'ach_reverse_boss_win',
    title: '阎王铁腕',
    icon: '👑',
    description: '扮演阎总在【阎总抓人模式】中成功抓捕3名以上准点逃兵！',
    condition: (history) => history.unlockedEndings.includes('ending_reverse_boss_win')
  },
  {
    id: 'ach_overtime_god',
    title: '晨曦不灭战神',
    icon: '🌅',
    description: '在【深夜大逃杀】无尽生存模式中成功熬到清晨06:00！',
    condition: (history) => history.unlockedEndings.includes('ending_overtime_god')
  },
  {
    id: 'ach_alchemy_master',
    title: '神装炼金大师',
    icon: '🧪',
    description: '累计成功合成 3 件以上神级羁绊装备！',
    condition: (history) => (history.unlockedRecipes && history.unlockedRecipes.length >= 3) || history.unlockedEndings.includes('ending_synergy_alchemist')
  },
  {
    id: 'ach_social_butterfly',
    title: '职场人脉通天',
    icon: '🤝',
    description: '与至少 2 位职场NPC的好感度达到【盟友(≥80)】状态！',
    condition: (history, state) => state && state.npcRelations && Object.values(state.npcRelations).filter((r) => r.favor >= 80).length >= 2
  },
  {
    id: 'ach_buzzword_king',
    title: '大厂黑话天花板',
    icon: '🗣️',
    description: '在黑话大乱斗中组合出离谱度评分 ≥ 80 的神级黑话句子！',
    condition: (history, state) => state && state.flags && state.flags.lastBuzzwordScore >= 80
  },
  {
    id: 'ach_clock_perfect',
    title: '微秒级神仙指法',
    icon: '🎯',
    description: '在18:00闸机QTE打卡中斩获 PERFECT 完美评价！',
    condition: (history, state) => state && state.flags && state.flags.lastQTEGrade === 'PERFECT'
  },
  {
    id: 'ach_doomsday_hero',
    title: '末日天选打工人',
    icon: '🌪️',
    description: '达成【黑色星期五·末日幸存者】结局，在三重混沌词条中脱身！',
    condition: (history) => history.unlockedEndings.includes('ending_doomsday_survivor')
  },
  {
    id: 'ach_grand_master',
    title: '全通传奇宗师',
    icon: '🏆',
    description: '累计解锁至少 22 个不同结局，受万人打工人敬仰！',
    condition: (history) => history.unlockedEndings && history.unlockedEndings.length >= 22
  },
  {
    id: 'ach_taichi_master',
    title: '太极推诿大宗师',
    icon: '☯️',
    description: '在职场太极推诿对决中斩获 PERFECT 完美借力打力！',
    condition: (history, state) => Boolean(state && state.flags && (state.flags.taichiMaster || state.flags.lastTaiChiGrade === 'PERFECT'))
  },
  {
    id: 'ach_keyboard_god',
    title: '键盘机械降神',
    icon: '⚡',
    description: '在工位狂暴装忙敲键盘挑战中达成 100% 满负荷救火大仙！',
    condition: (history, state) => Boolean(state && state.flags && (state.flags.hasKeyboardGod || state.flags.lastKeyboardGrade === 'FIRE'))
  },
  {
    id: 'ach_intern_mentor',
    title: '00后职场守护神',
    icon: '🐣',
    description: '与清澈实习生小陈的好感度达到【盟友(≥80)】状态！',
    condition: (history, state) => Boolean(state && state.npcRelations && state.npcRelations.intern_chen && state.npcRelations.intern_chen.favorability >= 80)
  },
  {
    id: 'ach_craft_ghost',
    title: '幽灵工位架构师',
    icon: '👻',
    description: '成功合成神装【幽灵工位自动化矩阵】！',
    condition: (history) => Boolean(history.unlockedRecipes && history.unlockedRecipes.includes('recipe_ghost_keyboard'))
  },
  {
    id: 'ach_craft_intern',
    title: '整顿职场总司令',
    icon: '✊',
    description: '成功合成神装【00后整顿职场终极阵线】！',
    condition: (history) => Boolean(history.unlockedRecipes && history.unlockedRecipes.includes('recipe_intern_alliance'))
  },
  {
    id: 'ach_craft_energy',
    title: '赛博续命炼金术',
    icon: '🧪',
    description: '成功合成神装【终极超频续命魔水】！',
    condition: (history) => Boolean(history.unlockedRecipes && history.unlockedRecipes.includes('recipe_energy_burst'))
  }
];

