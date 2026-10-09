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
    id: 'ach_master',
    title: '逃跑大满贯',
    icon: '🌟',
    description: '累计解锁全部 12 个结局！',
    condition: (history) => history.unlockedEndings.length >= 12
  }
];
