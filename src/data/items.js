/**
 * Tactical workplace items & props for escaping
 */

export const ITEMS = {
  chair_jacket: {
    id: 'chair_jacket',
    name: '椅背常驻外套',
    icon: '🧥',
    category: 'decoy',
    description: '挂在工位椅背上的替身外套。即便你人已出逃，老板路过也会以为你只是去了洗手间。',
    effectText: '工位障眼法生效：离席时老板怀疑度增长减缓 50%',
    onUse: (state) => {
      state.flags.hasDecoyJacket = true;
      state.suspicion = Math.max(0, state.suspicion - 15);
      return {
        success: true,
        message: '你把外套整整齐齐地搭在人体工学椅背上，桌上还放了半杯水，完美营造出“我马上就回来”的假象！老板怀疑度 -15%'
      };
    }
  },

  fake_bsod: {
    id: 'fake_bsod',
    name: '系统更新障眼屏',
    icon: '💻',
    category: 'tech',
    description: '全屏循环播放“正在配置 Windows 更新 27% 请勿关闭计算机”。谁来看都在干正事。',
    effectText: '工位电脑安全锁死，消除电脑被查风险',
    onUse: (state) => {
      state.flags.hasFakeScreen = true;
      state.suspicion = Math.max(0, state.suspicion - 10);
      return {
        success: true,
        message: '你把显示器切换到了蓝屏更新界面，拔掉鼠标，淡定起身。谁来了都不敢动你的电脑！老板怀疑度 -10%'
      };
    }
  },

  warm_coffee: {
    id: 'warm_coffee',
    name: '温热马克杯',
    icon: '☕',
    category: 'stealth',
    description: '端在手里的半杯温水或咖啡。走廊上的无敌通行证，自带“我只是出来接水思考架构”的气场。',
    effectText: '走廊与茶水间行动免受盘问 1 次',
    onUse: (state) => {
      state.flags.hasCoffeeShield = true;
      state.suspicion = Math.max(0, state.suspicion - 12);
      return {
        success: true,
        message: '你单手端起冒着热气的马克杯，眼神深邃作思考状。路过的同事和主管纷纷投来“此人必在攻克技术难题”的敬意！老板怀疑度 -12%'
      };
    }
  },

  panic_ticket: {
    id: 'panic_ticket',
    name: '甩锅紧急工单',
    icon: '📄',
    category: 'weapon',
    description: '打印着“P0级线上告警：核心数据库连接超时”的红头故障单，产品经理的天然克星。',
    effectText: '可直接秒杀突发的产品经理拦截事件',
    onUse: (state) => {
      state.flags.hasBugShield = true;
      return {
        success: true,
        message: '你随时准备将红头故障单拍在拦截者脸上：“别拦我，生产环境库要炸了，后端正在排查！”'
      };
    }
  },

  noise_headphones: {
    id: 'noise_headphones',
    name: '降噪大耳机',
    icon: '🎧',
    category: 'defense',
    description: '挂在脖子上或戴在耳朵上的旗舰降噪耳机。对同事八卦与HR情感PUA具备绝对物理免疫。',
    effectText: '精神体力 +15，并免疫 1 次心智骚扰',
    onUse: (state) => {
      state.energy = Math.min(100, state.energy + 15);
      state.flags.hasHeadphoneShield = true;
      return {
        success: true,
        message: '你戴上降噪耳机，世界瞬间清净，精神恢复 +15！任凭耳边同事如何讨论加班八卦，你自岿然不动。'
      };
    }
  },

  hua_zi: {
    id: 'hua_zi',
    name: '一盒软中华',
    icon: '🚬',
    category: 'diplomacy',
    description: '保安亭老王的终极社交货币。在大堂闸机有奇效。',
    effectText: '可直接解锁大堂安保协助通关特权',
    onUse: (state) => {
      state.flags.hasBribedGuard = true;
      return {
        success: true,
        message: '你将这盒香烟揣在最顺手的外套口袋里，保安大爷看到必称一声“好兄弟”！'
      };
    }
  },

  labor_law: {
    id: 'labor_law',
    name: '便携版《劳动法》',
    icon: '⚖️',
    category: 'holy',
    description: '红色封皮的袖珍小册子，散发着正义而肃穆的金色微光。能令各路牛鬼蛇神瞬间噤声。',
    effectText: '终极对峙时大幅降低老板气焰，解锁特殊裁决结局',
    onUse: (state) => {
      state.flags.hasLaborLawArmed = true;
      state.suspicion = Math.max(0, state.suspicion - 20);
      return {
        success: true,
        message: '你心中默背第四十一条：“国家实行劳动者每日工作时间不超过八小时的工作制度……” 眼神顿时坚定无比！'
      };
    }
  },

  stomach_pill: {
    id: 'stomach_pill',
    name: '应急肠胃药盒',
    icon: '💊',
    category: 'escape',
    description: '印着大字“急性肠胃宁”的药盒。职场不可抗力最高借口：“领导，我得赶紧去医院挂急诊！”',
    effectText: '紧急关头脱离战斗，强制脱身',
    onUse: (state) => {
      state.flags.hasMedicalExcuse = true;
      return {
        success: true,
        message: '你把药盒捏在手心，随时可以配合虚弱发白的脸色发动“身体抱恙，必须就医”免罪金牌！'
      };
    }
  },

  thick_folder: {
    id: 'thick_folder',
    name: '厚重的项目策划书',
    icon: '📁',
    category: 'stealth',
    description: '足足两百页的废弃打印纸装订本。双手紧抱在胸前，步履匆匆，全公司都会以为你去赶重要会谈。',
    effectText: '移动速度加成，全区域盘问概率降低 30%',
    onUse: (state) => {
      state.flags.hasFolderCover = true;
      state.suspicion = Math.max(0, state.suspicion - 8);
      return {
        success: true,
        message: '你把厚重的文件夹紧紧抱在胸前，眉头紧锁，眼神目视前方。路过的任何人都绝不敢多嘴问你一句！'
      };
    }
  },

  bag_snack: {
    id: 'bag_snack',
    name: '卫龙大面筋',
    icon: '🌶️',
    category: 'food',
    description: '香气扑鼻的职场顶级硬通货。可用于收买盟友阿伟或关键同事。',
    effectText: '体力 +10，或换取盟友关键情报',
    onUse: (state) => {
      state.energy = Math.min(100, state.energy + 10);
      return {
        success: true,
        message: '你偷偷嚼了一口辣条，甜辣浓郁，干瘪的灵魂得到了升华！体力 +10'
      };
    }
  },

  fake_call: {
    id: 'fake_call',
    name: '模拟大客户来电',
    icon: '📱',
    category: 'stealth',
    description: '手机定时播放高保真商务对话：“喂？张总您好！下轮十亿战略框架协议我们已经拟定……”',
    effectText: '老板怀疑度 -20%，可用于遭遇战强行打断领导盘问',
    onUse: (state) => {
      state.flags.hasFakeCall = true;
      state.suspicion = Math.max(0, state.suspicion - 20);
      return {
        success: true,
        message: '你将手机贴在耳边，高声说出百亿投融资黑话，周围领导纷纷驻足侧目不敢打扰！老板怀疑度 -20%'
      };
    }
  },

  sunglasses: {
    id: 'sunglasses',
    name: '防蓝光深色墨镜',
    icon: '🕶️',
    category: 'stealth',
    description: '工位极客装备，戴上后眼神深邃莫测，谁也看不出你到底在看代码还是在看打卡机。',
    effectText: '老板怀疑度 -15%，走廊行动更安全',
    onUse: (state) => {
      state.flags.hasSunglasses = true;
      state.suspicion = Math.max(0, state.suspicion - 15);
      return {
        success: true,
        message: '你推了推墨镜，自带特工风范，任何人的审视目光都被镜面无情反弹！老板怀疑度 -15%'
      };
    }
  },

  wind_oil: {
    id: 'wind_oil',
    name: '提神风油精',
    icon: '🧴',
    category: 'recovery',
    description: '绿色小玻璃瓶，抹在太阳穴如醍醐灌顶，双眼瞬间清亮如铜铃。',
    effectText: '精神体力瞬间恢复 +25！',
    onUse: (state) => {
      state.energy = Math.min(100, state.energy + 25);
      return {
        success: true,
        message: '清凉刺激的气味直冲天灵盖！脑子瞬间无比清醒，精神体力 +25！'
      };
    }
  },

  cleaner_badge: {
    id: 'cleaner_badge',
    name: '保洁主管工卡',
    icon: '🪪',
    category: 'escape',
    description: '拾到的全楼保洁主管通行挂牌，可自由刷开消防侧门与员工货梯。',
    effectText: '避开主要安检口，解锁隐秘撤退通道',
    onUse: (state) => {
      state.flags.hasCleanerBadge = true;
      state.suspicion = Math.max(0, state.suspicion - 10);
      return {
        success: true,
        message: '你把工卡揣进内衬兜里，整栋大厦的暗门和货梯向你敞开！老板怀疑度 -10%'
      };
    }
  },

  resign_draft: {
    id: 'resign_draft',
    name: '离职交接清单草稿',
    icon: '📋',
    category: 'holy',
    description: '打印着“个人发展原因辞去职务及交接明细”的清单。打工人至高威慑级核武器。',
    effectText: '老板怀疑度骤降 30%，终极对峙时让领导当场慌神挽留',
    onUse: (state) => {
      state.flags.hasResignDraft = true;
      state.suspicion = Math.max(0, state.suspicion - 30);
      return {
        success: true,
        message: '你把盖着草稿章的离职交接单若隐若现露出一角，主管路过看见浑身一颤，连大气都不敢喘！老板怀疑度 -30%'
      };
    }
  },

  yellow_vest: {
    id: 'yellow_vest',
    name: '黄色反光马甲',
    icon: '🦺',
    category: 'stealth',
    description: '顺丰同城专送荧光马甲。穿上它你就是园区里速度最快的送货神仙。',
    effectText: '大堂与安检区域伪装度大幅提升，怀疑度 -15%',
    onUse: (state) => {
      state.flags.hasDeliveryDisguise = true;
      state.suspicion = Math.max(0, state.suspicion - 15);
      return {
        success: true,
        message: '你套上黄色反光马甲，步伐坚定迅捷，所有安保人员都以为你是加急闪送小哥！怀疑度 -15%'
      };
    }
  },

  cyber_stimulant: {
    id: 'cyber_stimulant',
    name: '⚡ 赛博兴奋剂',
    icon: '⚡',
    category: 'synergy',
    rarity: 'SSR',
    description: '【神装】风油精与高浓咖啡因分子核聚变产物，打工人的终极体能超频药剂。',
    effectText: '体力立即 +40，后续 4 次行动体力消耗为 0 且不计耗时！',
    onUse: (state) => {
      state.energy = Math.min(100, state.energy + 40);
      state.flags.cyberStimulantActive = (state.flags.cyberStimulantActive || 0) + 4;
      return {
        success: true,
        message: '【神装激活】你一饮而尽！狂暴的神经脉冲贯穿全身，体力 +40，进入超频神速状态（后4次行动0体能0耗时）！'
      };
    }
  },

  super_decoy_puppet: {
    id: 'super_decoy_puppet',
    name: '🕴️ 究极替身傀儡',
    icon: '🕴️',
    category: 'synergy',
    rarity: 'SR',
    description: '【神装】融合外套与耳机的以假乱真工位分身，散发着沉浸式赶工的专注气场。',
    effectText: '工位查岗怀疑度增幅彻底锁定为 0，每回合转移巡查视线',
    onUse: (state) => {
      state.flags.hasSuperDecoy = true;
      state.flags.hasDecoyJacket = true;
      state.flags.hasHeadphoneShield = true;
      state.suspicion = Math.max(0, state.suspicion - 25);
      return {
        success: true,
        message: '【神装激活】你在工位组装完毕究极替身！从远处看宛如一位正在通宵重构底层架构的首席科学家！怀疑度 -25%'
      };
    }
  },

  labor_bomb: {
    id: 'labor_bomb',
    name: '💣 职场正道核弹',
    icon: '💣',
    category: 'synergy',
    rarity: 'SSR',
    description: '【神装】红色劳动法典包裹着离职清单引信，任何管理层目光触及皆魂飞魄散。',
    effectText: '怀疑度暴降 50%，面对高管拦截强制绝对胜利降维打击！',
    onUse: (state) => {
      state.flags.hasLaborBomb = true;
      state.flags.hasLaborLawArmed = true;
      state.suspicion = Math.max(0, state.suspicion - 50);
      return {
        success: true,
        message: '【神装激活】你将正道核弹端在胸前，散发金色法理光环！老板与HR刘姐见状无不退避三舍！怀疑度 -50%'
      };
    }
  },

  delivery_suit_pro: {
    id: 'delivery_suit_pro',
    name: '🛴 顺丰闪送全家桶',
    icon: '🛴',
    category: 'synergy',
    rarity: 'SR',
    description: '【神装】专业反光外袍配辣条补给包，园区安检与闸机完全无视。',
    effectText: '大堂保安视线完全隐形，免检直接通关',
    onUse: (state) => {
      state.flags.hasDeliverySuitPro = true;
      state.flags.hasBribedGuard = true;
      state.suspicion = Math.max(0, state.suspicion - 20);
      return {
        success: true,
        message: '【神装激活】你已伪装为特快骑手，大堂所有安保与前台向你致意让路，畅通无阻！'
      };
    }
  },

  architect_aura: {
    id: 'architect_aura',
    name: '☕ 架构师无敌气场',
    icon: '🕶️',
    category: 'synergy',
    rarity: 'R',
    description: '【神装】两百页技术白皮书与深邃墨镜，散发令所有同行与领导肃然起敬的气息。',
    effectText: '全场景盘问免疫，怀疑度每回合自然衰减 3%',
    onUse: (state) => {
      state.flags.hasArchitectAura = true;
      state.suspicion = Math.max(0, state.suspicion - 15);
      return {
        success: true,
        message: '【神装激活】你步履从容，目光高远。路过总监纷纷驻足点头：“架构师辛苦了！” 怀疑度持续自然消退！'
      };
    }
  },

  privacy_shield: {
    id: 'privacy_shield',
    name: '🛡️ 绝对防窥屏障',
    icon: '🛡️',
    category: 'synergy',
    rarity: 'SR',
    description: '【神装】蓝屏系统与保洁工卡合体，物理与系统双重封印工位。',
    effectText: '工位查岗绝对免疫，探索行动体力消耗 -20%',
    onUse: (state) => {
      state.flags.hasPrivacyShield = true;
      state.flags.hasFakeScreen = true;
      state.flags.hasCleanerBadge = true;
      return {
        success: true,
        message: '【神装激活】工位进入绝对量子防窥态，没人能查探你留下的任何痕迹！'
      };
    }
  },

  tactical_smoke: {
    id: 'tactical_smoke',
    name: '💨 战术烟雾对讲机',
    icon: '💨',
    category: 'synergy',
    rarity: 'SR',
    description: '【神装】香烟与对讲机伪造声东击西信号，调虎离山引开老板视线。',
    effectText: '立刻转移高管动向，锁定安全期 3 回合',
    onUse: (state) => {
      state.flags.hasTacticalSmoke = true;
      if (state.patrolState) {
        state.patrolState.distractedTurns = 3;
        state.patrolState.behaviorState = 'distracted';
      }
      state.suspicion = Math.max(0, state.suspicion - 20);
      return {
        success: true,
        message: '【神装激活】你制造了一起虚假的走廊异响与通话引流，高管巡视路线瞬间被诱导远离！'
      };
    }
  },

  p0_panic_overload: {
    id: 'p0_panic_overload',
    name: '🚨 P0级核聚变工单',
    icon: '🚨',
    category: 'synergy',
    rarity: 'SSR',
    description: '【神装】红头生产故障单与肠胃就医证明双核驱动，职场至高绝对豁免权。',
    effectText: '解除任何困局与遭遇战，秒杀高管拦截',
    onUse: (state) => {
      state.flags.hasP0Overload = true;
      state.flags.hasBugShield = true;
      state.flags.hasMedicalExcuse = true;
      state.suspicion = Math.max(0, state.suspicion - 35);
      return {
        success: true,
        message: '【神装激活】“线上机房与本人身体同时发生特大紧急情况！” 领导双手合十恭送你离开！'
      };
    }
  },

  intern_guide: {
    id: 'intern_guide',
    name: '00后职场整顿指南',
    icon: '📘',
    category: 'diplomacy',
    description: '写满反PUA语录与劳动法精髓的袖珍手册。赠予清澈实习生小陈可大幅增加好感度。',
    effectText: '提升反PUA抗性，面对盘问怀疑度增长减半',
    onUse: (state) => {
      state.flags.hasInternGuide = true;
      state.suspicion = Math.max(0, state.suspicion - 12);
      return {
        success: true,
        message: '你快速翻阅手册中的金句：“上班是为了赚钱，不是为了当孙子！” 内心瞬间充满正气，怀疑度 -12%'
      };
    }
  },

  energy_potion: {
    id: 'energy_potion',
    name: '魔爪超能电解质水',
    icon: '🥤',
    category: 'recovery',
    description: '茶水间冰箱冷藏的超能电解质功能水。一口下肚，浑身细胞瞬间被唤醒。',
    effectText: '立即恢复 25 点体力，消除疲劳状态',
    onUse: (state) => {
      state.energy = Math.min(100, state.energy + 25);
      return {
        success: true,
        message: '你大口灌下冰爽的电解质水，强效提神物质注入血液，体力 +25！'
      };
    }
  },

  master_keycard: {
    id: 'master_keycard',
    name: '万能后勤特权卡',
    icon: '💳',
    category: 'stealth',
    description: '物业与后勤部门通用的最高权限金卡，能刷开大厦所有防火常闭门与后勤升降机。',
    effectText: '全通道通行无阻，楼梯与货梯体力消耗降为 0',
    onUse: (state) => {
      state.flags.hasMasterKey = true;
      state.suspicion = Math.max(0, state.suspicion - 15);
      return {
        success: true,
        message: '你将万能特权卡贴在大门感应区，提示音清脆响起：“特权验证通过，请通行！” 怀疑度 -15%'
      };
    }
  },

  ghost_keyboard: {
    id: 'ghost_keyboard',
    name: '自动幽灵机械键盘',
    icon: '⌨️',
    category: 'decoy',
    description: '内置高频宏脚本的定制键盘，放在桌上可全自动敲击出黑客代码，伪装度拉满。',
    effectText: '工位离席后自动敲代码，每回合自然衰减 5% 怀疑度',
    onUse: (state) => {
      state.flags.hasGhostKeyboard = true;
      state.suspicion = Math.max(0, state.suspicion - 15);
      return {
        success: true,
        message: '你开启键盘的幽灵模式，按键开始噼里啪啦自动飞速跳动，任谁看都在疯狂抢修！怀疑度 -15%'
      };
    }
  },

  ghost_matrix: {
    id: 'ghost_matrix',
    name: '👻 幽灵工位自动化矩阵',
    icon: '👻',
    category: 'synergy',
    rarity: 'SSR',
    description: '【神装】幽灵机械键盘与替身外套共鸣打造的终极伪装。工位形成绝对自动化抢修力场。',
    effectText: '工位绝对神隐：老板巡查怀疑度锁定为 0，且每回合怀疑度 -8%',
    onUse: (state) => {
      state.flags.hasDecoyJacket = true;
      state.flags.hasGhostKeyboard = true;
      state.flags.hasGhostMatrix = true;
      state.suspicion = Math.max(0, state.suspicion - 30);
      return {
        success: true,
        message: '【神装激活】外套在椅背，键盘在狂敲，杯子冒热气！整个工位宛如有一位隐形架构师在玩命通宵，怀疑度 -30%！'
      };
    }
  },

  intern_alliance: {
    id: 'intern_alliance',
    name: '✊ 00后整顿职场终极阵线',
    icon: '✊',
    category: 'synergy',
    rarity: 'SSR',
    description: '【神装】整顿指南与劳动法典共鸣的至尊神器。实习生小陈誓死保送，管理层退避三舍。',
    effectText: '面对任何管理层盘问，直接触发整顿神仙降维暴击，怀疑度骤降 40%',
    onUse: (state) => {
      state.flags.hasInternAlliance = true;
      state.suspicion = Math.max(0, state.suspicion - 40);
      return {
        success: true,
        message: '【神装激活】“根据劳动法与八小时工作制，下班时间到了！” 浩然正气化作冲击波席卷整个大开间，怀疑度 -40%！'
      };
    }
  },

  hyper_stamina_brew: {
    id: 'hyper_stamina_brew',
    name: '🧪 终极超频续命魔水',
    icon: '🧪',
    category: 'synergy',
    rarity: 'SR',
    description: '【神装】电解质魔爪与温热咖啡完美交融的提神灵药。体力直接拉满，移动神速。',
    effectText: '立即恢复 35 点体力，且后续 3 次行动免除体力消耗',
    onUse: (state) => {
      state.energy = Math.min(100, state.energy + 35);
      state.flags.cyberStimulantActive = (state.flags.cyberStimulantActive || 0) + 3;
      return {
        success: true,
        message: '【神装激活】超频能量流过全身经脉！体力 +35，接下来 3 次穿行行动耗能降为 0！'
      };
    }
  }
};
