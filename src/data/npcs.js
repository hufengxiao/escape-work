/**
 * Workplace NPC Database & Relationship Configuration
 */

export const NPCS = {
  ah_wei: {
    id: 'ah_wei',
    name: '摸鱼盟友阿伟',
    avatar: '🥔',
    title: '资深带薪摸鱼专家 · 同组工友',
    defaultFavorability: 40,
    faction: 'ally',
    description: '同组生死之交，精通工位闭眼休眠术。只要一包辣条就能在群里替你打掩护。',
    favoriteItems: ['bag_snack', 'warm_coffee'],
    perkTitle: '工友挡刀',
    perkDesc: '好感度≥80：在关键盘问中主动在群里发声拉仇恨，替你抵挡 1 次高管盘问！',
    breakPenalty: '好感度<-50：心灰意冷，拒绝分享情报，甚至被动走漏你离席的风声。'
  },

  lao_wang: {
    id: 'lao_wang',
    name: '保安老王',
    avatar: '👮‍♂️',
    title: '园区安保总队长 · 闸机守门人',
    defaultFavorability: 0,
    faction: 'neutral',
    description: '在园区干了八年的退伍老兵，眼神犀利。最喜饭后一支烟，赛过活神仙。',
    favoriteItems: ['hua_zi', 'wind_oil'],
    perkTitle: '侧门密道',
    perkDesc: '好感度≥80：开启一楼安保专属无感通道，赠送对讲机直接放行出楼！',
    breakPenalty: '好感度<-50：启动闸机人脸识别严查模式，怀疑度判定门槛降低 20%。'
  },

  admin_team: {
    id: 'admin_team',
    name: '行政阿花 & 财务小敏',
    avatar: '👭',
    title: '行政大管家 · 零食情报中枢',
    defaultFavorability: 10,
    faction: 'friendly',
    description: '掌握全公司八卦与高管动态的行政姐妹花，抽屉里永远有最新鲜的点心。',
    favoriteItems: ['warm_coffee', 'stomach_pill'],
    perkTitle: '高管动向通报',
    perkDesc: '好感度≥80：实时通报全司高管巡场动向表，偶遇高管风险大幅降低！',
    breakPenalty: '好感度<-50：前台大声打招呼“小李怎么走这么早呀”，瞬间引来全场瞩目。'
  },

  ah_qiang: {
    id: 'ah_qiang',
    name: '需求刺客阿强',
    avatar: '👓',
    title: '高级产品经理 · 周五下班发版狂魔',
    defaultFavorability: -20,
    faction: 'hostile',
    description: '“李哥，这个需求逻辑很简单，下班前帮我改一版上线呗？” 职场打工人的天然梦魇。',
    favoriteItems: ['panic_ticket', 'fake_call'],
    perkTitle: '神级崇拜',
    perkDesc: '好感度≥80：陷入对李哥技术的无限崇拜，本局再也不追击你加需求！',
    breakPenalty: '好感度<-50：化身走廊怨灵，强制拦截并触发高难度排期对线事件。'
  },

  liu_jie: {
    id: 'liu_jie',
    name: 'HR总监刘姐',
    avatar: '👠',
    title: '组织文化与政委总监 · 绩效裁决者',
    defaultFavorability: -30,
    faction: 'nemesis',
    description: '眼神温和但笑里藏刀：“小李啊，最近对团队企业文化建设有什么深入思考？”',
    favoriteItems: ['labor_law', 'resign_draft'],
    perkTitle: '文化觉悟背书',
    perkDesc: '好感度≥80：高度认可你的价值观，在阎总面前力荐并亲自开门放行！',
    breakPenalty: '好感度<-50：强制拉入会议室谈心拷问，怀疑度飙升且无法轻易撤退。'
  },

  intern_chen: {
    id: 'intern_chen',
    name: '清澈大学生小陈',
    avatar: '🐣',
    title: '00后整顿职场先锋 · 清澈实习生',
    defaultFavorability: 25,
    faction: 'friendly',
    description: '刚入职两周的应届实习生，眼里闪烁着清澈的愚蠢与对劳动法的无限敬畏。上班不内耗，下班准点走，大不了回去继承家产。',
    favoriteItems: ['bag_snack', 'labor_law', 'intern_guide'],
    perkTitle: '整顿职场神仙助攻',
    perkDesc: '好感度≥80：在关键拦截中，小陈直接当面掏出劳动法理直气壮发言，为你吸引100%全场火力！',
    breakPenalty: '好感度<-50：小陈在全员群艾特“前辈好像包都收拾好了”，引发管理层大搜查。'
  }
};

