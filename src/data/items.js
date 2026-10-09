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
  }
};
