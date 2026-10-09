/**
 * Workplace Archetypes & Character Roles
 * Each role features unique base stats, passive traits, and starting equipment
 */

export const CHARACTERS = {
  backend_dev: {
    id: 'backend_dev',
    name: '后端攻城狮',
    title: '架构与删库大师',
    avatar: '👨‍💻',
    color: '#38bdf8',
    description: '深谙各种底层协议与技术黑话，桌上永远堆着代码告警工单。',
    passiveTitle: '【代码壁垒】',
    passiveDesc: '技术类障眼法与工单效果提升 50%；面对产品经理改需求时拥有专属反杀手段。',
    baseEnergy: 85,
    baseSuspicion: 10,
    startingItems: ['fake_bsod', 'panic_ticket'],
    applyBonus: (state) => {
      // Custom flags or traits
      state.flags.isDev = true;
    }
  },

  ui_designer: {
    id: 'ui_designer',
    name: '交互UI设计',
    title: '像素眼与五彩斑斓的黑',
    avatar: '🎨',
    color: '#ec4899',
    description: '长期遭受“Logo放大一点”折磨，对办公室视线和走位有着天生的艺术直觉。',
    passiveTitle: '【视觉迷彩】',
    passiveDesc: '在工位与走廊行动时怀疑度增长减免 25%；善于发现场景中被遗漏的神器。',
    baseEnergy: 90,
    baseSuspicion: 12,
    startingItems: ['thick_folder', 'noise_headphones'],
    applyBonus: (state) => {
      state.flags.isDesigner = true;
    }
  },

  product_manager: {
    id: 'product_manager',
    name: '觉醒产品人',
    title: '敏捷排期推诿大师',
    avatar: '💼',
    color: '#f59e0b',
    description: '曾经的卷王，如今幡然醒悟。精通职场黑话与心理战，擅长反向画大饼。',
    passiveTitle: '【反客为主】',
    passiveDesc: '反向忽悠老板与HR时成功率 100%；能言善辩，高管更难看穿你的意图。',
    baseEnergy: 95,
    baseSuspicion: 18,
    startingItems: ['warm_coffee', 'fake_call'],
    applyBonus: (state) => {
      state.flags.isPM = true;
    }
  },

  senior_slacker: {
    id: 'senior_slacker',
    name: '佛系老油条',
    title: '带薪如厕一代宗师',
    avatar: '🍵',
    color: '#10b981',
    description: '司龄八年的神仙老员工，早已看透大厂浮云。只要我不主动，谁也找不着我。',
    passiveTitle: '【如厕成圣】',
    passiveDesc: '洗手间战术躲避不耗体力反而恢复精力；替身外套降怀疑度效果提升至 70%。',
    baseEnergy: 80,
    baseSuspicion: 5,
    startingItems: ['chair_jacket', 'hua_zi'],
    applyBonus: (state) => {
      state.flags.isSlacker = true;
    }
  },

  fresh_intern: {
    id: 'fresh_intern',
    name: '清澈实习生',
    title: '因为不懂所以不慌',
    avatar: '🎒',
    color: '#a855f7',
    description: '刚入职三周，眼里闪烁着清澈的愚蠢。老板怀疑谁也不会轻易怀疑一个懵懂实习生。',
    passiveTitle: '【初生牛犊】',
    passiveDesc: '体力上限与初始体力高达 115 点；走消防通道下楼狂奔体力消耗大幅降低。',
    baseEnergy: 115,
    baseSuspicion: 5,
    startingItems: ['bag_snack', 'wind_oil'],
    applyBonus: (state) => {
      state.flags.isIntern = true;
    }
  }
};
