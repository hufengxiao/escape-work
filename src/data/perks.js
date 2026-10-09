/**
 * Slacker Talent Tree (Permanent Meta-Progression Perks)
 * Unlocked using "摸鱼悟性" (Slacker EXP) accumulated across games
 */

export const PERKS = [
  {
    id: 'perk_sneakers',
    name: '轻便消音气垫鞋',
    icon: '👟',
    cost: 80,
    description: '下班专用神鞋，走路不带半点声响。',
    effectText: '所有战术行动消耗体力减少 15%',
    apply: (state) => {
      state.flags.hasSneakersPerk = true;
    }
  },
  {
    id: 'perk_pokerface',
    name: '天生职场扑克脸',
    icon: '🎭',
    cost: 120,
    description: '无论心里多么想下班，表面永远波澜不惊。',
    effectText: '开局老板怀疑度永久 -10%',
    apply: (state) => {
      state.suspicion = Math.max(0, state.suspicion - 10);
    }
  },
  {
    id: 'perk_radar',
    name: '第六感摸鱼雷达',
    icon: '📡',
    cost: 160,
    description: '对老板的脚步声和高管气场具备超自然感应。',
    effectText: '遭遇突发拦截的概率降低 25%',
    apply: (state) => {
      state.flags.hasRadarPerk = true;
    }
  },
  {
    id: 'perk_deep_pocket',
    name: '四次元公文包',
    icon: '🎒',
    cost: 220,
    description: '包里总能掏出意想不到的摸鱼小物件。',
    effectText: '开局随机额外携带一件高级逃脱道具',
    apply: (state) => {
      state.flags.hasExtraPocketPerk = true;
    }
  },
  {
    id: 'perk_toilet_spa',
    name: '带薪如厕尊享SPA',
    icon: '🚽',
    cost: 280,
    description: '把洗手间马桶坐垫当成马尔代夫沙滩椅的超然境界。',
    effectText: '每次洗手间战术躲避额外恢复 12 点体力',
    apply: (state) => {
      state.flags.hasToiletSpaPerk = true;
    }
  },
  {
    id: 'perk_labor_aura',
    name: '法治神光附体',
    icon: '⚖️',
    cost: 360,
    description: '心中默读法条，眼神浩然正气，令各路牛鬼蛇神胆寒。',
    effectText: '开局直接免费装备《便携版劳动法》，威慑力拉满',
    apply: (state) => {
      state.addItem('labor_law');
    }
  }
];
