/**
 * All Workplace Zones, Encounters, Dialogues, and Interactive Choices
 */

export const ZONES = [
  {
    id: 1,
    name: '工位核心区',
    title: '我的工位 (17:45 - 17:50)',
    icon: '💻',
    bgClass: 'zone-desk',
    description: '你的工位位于大开间中部。周围敲击键盘的噼啪声此起彼伏，表面看似平静，实则暗流涌动。距离18:00下班还有最后15分钟。'
  },
  {
    id: 2,
    name: '走廊与茶水间',
    title: '走廊与茶水间 (17:50 - 17:55)',
    icon: '☕',
    bgClass: 'zone-corridor',
    description: '长长的办公区走廊，头顶是冷白的LED灯管。茶水间冒着热气，HR刘姐和产品经理阿强经常在此神出鬼没。'
  },
  {
    id: 3,
    name: '电梯厅与安全通道',
    title: '电梯厅与消防道 (17:55 - 17:59)',
    icon: '🛗',
    bgClass: 'zone-elevator',
    description: '18楼的电梯大理石厅，指示灯忽闪忽灭。旁边是绿底荧光的“安全通道”常闭防火门。阎总随时可能乘专梯上楼。'
  },
  {
    id: 4,
    name: '一楼大堂与闸机',
    title: '一楼大堂打卡闸机 (18:00+)',
    icon: '🚪',
    bgClass: 'zone-lobby',
    description: '通往外部自由世界的最后一关！冷气森森的人脸识别闸机、旋转玻璃大门，以及保安老王的防爆值班台。'
  }
];

export const ZONE_ACTIONS = {
  1: [
    {
      id: 'pack_bag',
      name: '收拾背包',
      icon: '🎒',
      costTime: 1,
      costEnergy: 3,
      desc: '把钥匙、充电宝和私人物品悄悄装进书包。',
      handler: (state) => {
        state.flags.bagPacked = (state.flags.bagPacked || 0) + 1;
        if (state.flags.bagPacked === 1) {
          state.suspicion += 5;
          return {
            msg: '你小心翼翼地把雨伞和耳机塞进包里，拉链拉到一半。准备度提高！(老板怀疑度 +5%)',
            type: 'info'
          };
        } else if (state.flags.bagPacked === 2) {
          state.suspicion += 10;
          return {
            msg: '你把背包拉链彻底拉严，放在脚边随时可背。动作有点显眼！(老板怀疑度 +10%)',
            type: 'warning'
          };
        } else {
          return {
            msg: '包已经收拾得利索无比了，再整就要把桌子拆了！',
            type: 'info'
          };
        }
      }
    },
    {
      id: 'setup_decoy',
      name: '布置障眼法',
      icon: '🧥',
      costTime: 1,
      costEnergy: 2,
      desc: '利用工位现有物品伪造“我还在加班”的假象。',
      handler: (state) => {
        if (!state.flags.hasDecoyJacket && state.hasItem('chair_jacket')) {
          return state.useItem('chair_jacket');
        }
        if (!state.flags.hasFakeScreen && state.hasItem('fake_bsod')) {
          return state.useItem('fake_bsod');
        }
        // Fallback default decoy
        state.suspicion = Math.max(0, state.suspicion - 8);
        return {
          msg: '你把半截铅笔扔在记事本上，把显示器亮度调到最亮，桌上倒扣一本技术书。老板怀疑度 -8%',
          type: 'success'
        };
      }
    },
    {
      id: 'scout_boss',
      name: '侦察老板动向',
      icon: '👀',
      costTime: 1,
      costEnergy: 4,
      desc: '假装站起来倒水，扫视阎总的玻璃办公室。',
      handler: (state) => {
        const rand = Math.random();
        if (rand < 0.35) {
          return {
            msg: '情报：阎总正站在办公室落地窗前打电话，眉头紧锁，神情严肃，似乎没注意到工位区！',
            type: 'info'
          };
        } else if (rand < 0.7) {
          state.suspicion += 8;
          return {
            msg: '危险！阎总刚合上笔记本电脑，眼神正往你这个方向扫过来！你赶紧把头缩了回去。(怀疑度 +8%)',
            type: 'warning'
          };
        } else {
          // Found item
          if (!state.hasItem('panic_ticket')) {
            state.addItem('panic_ticket');
            return {
              msg: '你在打印机废纸筐里发现了一张别人落下的【甩锅紧急工单】！已收入背包。',
              type: 'item'
            };
          }
          return {
            msg: '隔壁阿强正抓耳挠腮改代码，暂时没人注意到你。',
            type: 'info'
          };
        }
      }
    },
    {
      id: 'talk_ahwei',
      name: '联系摸鱼盟友阿伟',
      icon: '🤝',
      costTime: 1,
      costEnergy: 2,
      desc: '向隔壁老油条阿伟打听风向或交换物资。',
      handler: (state) => {
        if (!state.flags.talkedAhwei) {
          state.flags.talkedAhwei = true;
          state.addItem('hua_zi');
          state.addItem('warm_coffee');
          return {
            msg: '阿伟压低声音：“兄弟，今晚阎总要抽查6点后考勤！拿好这个【温热马克杯】，另外这盒【一盒软中华】你带上，到了一楼给保安老王有奇效！”',
            type: 'item'
          };
        } else {
          return {
            msg: '阿伟冲你眨眨眼：“稳住别慌，待会儿我帮你吸引老刘的注意，你先走！”',
            type: 'info'
          };
        }
      }
    },
    {
      id: 'leave_desk_zone',
      name: '迈出工位，前往走廊',
      icon: '🚶',
      costTime: 2,
      costEnergy: 5,
      desc: '离开工位区，正式进入走廊与茶水间！',
      handler: (state) => {
        let suspJump = 10;
        if (state.flags.hasDecoyJacket) suspJump -= 8;
        if (state.flags.hasCoffeeShield) suspJump -= 5;
        state.suspicion += Math.max(0, suspJump);
        state.zone = 2;
        return {
          msg: `你从容站起身，离开工位迈入走廊！${suspJump > 5 ? '（你的离座引起了部分视线，怀疑度 +' + suspJump + '%）' : '（障眼法生效，几乎无人察觉你离席！）'}`,
          type: 'success'
        };
      }
    }
  ],

  2: [
    {
      id: 'hold_coffee_walk',
      name: '端着咖啡从容巡弋',
      icon: '☕',
      costTime: 1,
      costEnergy: 3,
      desc: '双手捧着杯子，步伐从容，营造“我只是在思考系统重构”的高深氛围。',
      handler: (state) => {
        state.suspicion = Math.max(0, state.suspicion - 12);
        return {
          msg: '你眼神高深莫测地看着天花板，路过的行政妹妹还向你微笑致意。老板怀疑度 -12%',
          type: 'success'
        };
      }
    },
    {
      id: 'hide_toilet',
      name: '闪入洗手间战术躲避',
      icon: '🚽',
      costTime: 2,
      costEnergy: 4,
      desc: '躲进单间反锁，避开走廊上巡查的高管。',
      handler: (state) => {
        state.toiletTurns = (state.toiletTurns || 0) + 1;
        state.suspicion = Math.max(0, state.suspicion - 15);

        if (state.toiletTurns >= 3) {
          // Can lead to toilet philosopher ending
          state.flags.toiletMaster = true;
          return {
            msg: '你在马桶上坐得双腿发麻……隔壁单间传来了短视频的欢快笑声，看来摸鱼的不止你一个！',
            type: 'info'
          };
        }

        return {
          msg: '洗手间单间门一关，隔绝了办公室的纷扰。你在里面刷了两分钟手机，老板怀疑度 -15%！',
          type: 'info'
        };
      }
    },
    {
      id: 'search_printer',
      name: '在打印机旁搜寻道具',
      icon: '🖨️',
      costTime: 1,
      costEnergy: 3,
      desc: '假装在装订废纸，实则寻找有用的职场掩护物资。',
      handler: (state) => {
        if (!state.hasItem('thick_folder')) {
          state.addItem('thick_folder');
          return {
            msg: '你在废弃装订台上捡到了【厚重的项目策划书】！抱在胸前气场瞬间拉满。',
            type: 'item'
          };
        } else if (!state.hasItem('labor_law')) {
          state.addItem('labor_law');
          return {
            msg: '天哪！你在资料架缝隙里发现了一本落灰的【便携版《劳动法》】！这可是终极神器！',
            type: 'item'
          };
        } else {
          return {
            msg: '打印机滋滋作响吐着废纸，没什么新鲜东西了。',
            type: 'info'
          };
        }
      }
    },
    {
      id: 'dash_to_elevator_lobby',
      name: '快步切入电梯厅',
      icon: '🏃',
      costTime: 2,
      costEnergy: 6,
      desc: '抓住无人注视的空档，迅速穿过玻璃门进入电梯厅！',
      handler: (state) => {
        state.zone = 3;
        return {
          msg: '你穿过感应玻璃门，成功抵达18楼电梯厅！离逃出大楼又近了一大步！',
          type: 'success'
        };
      }
    }
  ],

  3: [
    {
      id: 'wait_elevator_main',
      name: '按1号快速客梯',
      icon: '🛗',
      costTime: 2,
      costEnergy: 4,
      desc: '高档客梯速度飞快，但老板和各部门高管最喜欢坐这趟。',
      handler: (state) => {
        state.flags.elevatorTarget = 'main';
        const rand = Math.random();
        if (rand < 0.45 && !state.flags.hasEncounteredBossInElevator) {
          // Trigger special encounter: Boss inside elevator!
          return {
            triggerEncounter: 'encounter_boss_in_elevator',
            msg: '叮的一声！电梯门开了，里面竟然站着……！'
          };
        } else {
          state.zone = 4;
          return {
            msg: '电梯里空无一人！轿厢平稳降落，18楼直落1楼大堂！',
            type: 'success'
          };
        }
      }
    },
    {
      id: 'wait_elevator_cargo',
      name: '按2号慢速货梯',
      icon: '📦',
      costTime: 3,
      costEnergy: 5,
      desc: '通常堆满废纸箱和保洁推车，虽然速度慢，但极其安全。',
      handler: (state) => {
        state.zone = 4;
        state.suspicion = Math.max(0, state.suspicion - 10);
        return {
          msg: '货梯缓缓打开，保洁阿姨冲你慈祥一笑：“小伙子下班挺早啊！”货梯平稳把你送达一楼大堂！',
          type: 'success'
        };
      }
    },
    {
      id: 'take_fire_stairs',
      name: '冲入消防安全通道',
      icon: '🧗',
      costTime: 2,
      costEnergy: 25,
      desc: '走安全楼梯纯肉身狂奔18层！极度消耗体力，但彻底免疫老板偶遇！',
      handler: (state) => {
        state.flags.tookStairs = true;
        state.zone = 4;
        state.suspicion = 0; // 0% boss alert in stairs
        return {
          msg: '你撞开常闭防火门，两步并作一步狂奔下楼！18、16、10、3、1！大汗淋漓推开一楼侧门，直达大堂！(消耗25体力，老板怀疑度归零！)',
          type: 'warning'
        };
      }
    },
    {
      id: 'rest_at_vending',
      name: '自动贩卖机前喘口气',
      icon: '🥤',
      costTime: 1,
      costEnergy: -15, // restores energy
      desc: '在角落贩卖机投币买一罐冰阔落，回口气。',
      handler: (state) => {
        state.energy = Math.min(100, state.energy + 15);
        return {
          msg: '冰镇汽水咕噜下肚，清凉直冲天灵盖！精神体力 +15！',
          type: 'success'
        };
      }
    }
  ],

  4: [
    {
      id: 'face_recognition',
      name: '人脸识别闸机打卡',
      icon: '📸',
      costTime: 1,
      costEnergy: 4,
      desc: '走到发着蓝光的面部识别闸机前刷脸。注意看当前时间！',
      handler: (state) => {
        // Evaluate time!
        if (state.currentHour < 18) {
          state.suspicion += 25;
          return {
            msg: '闸机红灯急促闪烁：“警告！当前时间未到18:00，属于早退打卡行为，已抄送考勤主管！”你赶紧退后两步！(怀疑度 +25%)',
            type: 'warning'
          };
        } else {
          // Win condition!
          return {
            triggerEnding: 'ending_perfect_clockout',
            msg: '闸机发出清脆的“滴——打卡成功！”'
          };
        }
      }
    },
    {
      id: 'security_talk',
      name: '找保安老王暗度陈仓',
      icon: '👮',
      costTime: 1,
      costEnergy: 3,
      desc: '走向保安亭，寻找不通过主闸机的逃生路线。',
      handler: (state) => {
        if (state.hasItem('hua_zi') || state.flags.hasBribedGuard) {
          state.removeItem('hua_zi');
          return {
            triggerEnding: 'ending_guard_brother',
            msg: '老王接过华子，会心一笑，直接为你推开了侧面的VIP绿色通道大门！'
          };
        } else {
          state.suspicion = Math.max(0, state.suspicion - 5);
          return {
            msg: '老王打量了你一眼：“小伙子，没到下班点在门口晃悠啥呢？”你尴尬地陪笑两声，假装看天花板。',
            type: 'info'
          };
        }
      }
    },
    {
      id: 'burst_sprint',
      name: '紧随外卖骑手强冲闸门',
      icon: '⚡',
      costTime: 1,
      costEnergy: 12,
      desc: '趁外卖骑手刷开大件通道的瞬间，一个箭步侧身滑行而出！',
      handler: (state) => {
        if (state.energy < 20) {
          return {
            triggerEnding: 'ending_embarrassing_drop',
            msg: '你体力不支脚底打滑，背包拉链当场崩开！'
          };
        } else {
          return {
            triggerEnding: 'ending_perfect_clockout',
            msg: '身手敏捷！宛如一道黑色闪电，在闸机闭合前0.1秒滑步冲出大堂！'
          };
        }
      }
    }
  ]
};

export const RANDOM_ENCOUNTERS = [
  {
    id: 'encounter_pm_intercept',
    zones: [1, 2],
    title: '⚠️ 需求刺客突然袭击！',
    character: '产品经理阿强',
    avatar: '👓',
    description: '阿强满头大汗抱着轻薄本从拐角冲过来：“李哥李哥！等等！就改一个小按钮的字，两分钟绝对搞定，客户催疯了！”',
    choices: [
      {
        text: '出示【甩锅紧急工单】：“核心库报警了，快去找运维！”',
        requireItem: 'panic_ticket',
        outcome: (state) => {
          state.removeItem('panic_ticket');
          return {
            msg: '阿强看到红头告警单吓得脸色惨白：“什么？！我马上去找运维！”转身一溜烟跑了。化险为夷！',
            type: 'success'
          };
        }
      },
      {
        text: '搬出技术架构黑话：“这改动影响高并发分库分表一致性，必须提全员架构评审！”',
        outcome: (state) => {
          state.suspicion += 5;
          state.energy -= 8;
          return {
            msg: '阿强被你一串高大上的专业术语唬得一愣一愣的，呆在原地抓耳挠腮不敢作声。你趁机溜之大吉！',
            type: 'success'
          };
        }
      },
      {
        text: '捂住腹部痛苦呻吟：“我……我急性阑尾炎发作，得去急诊！”',
        outcome: (state) => {
          state.energy -= 5;
          return {
            msg: '阿强吓了一跳：“李哥你脸色真差，快快快先去医院！”你成功蒙混过关。',
            type: 'info'
          };
        }
      },
      {
        text: '妥协：“行吧，我看看是哪两个字……”',
        outcome: (state) => {
          return {
            triggerEnding: 'ending_pm_sacrifice',
            msg: '你跟着阿强回了工位，一改改出了毁灭级的大事故……'
          };
        }
      }
    ]
  },

  {
    id: 'encounter_group_red_packet',
    zones: [1],
    title: '🧧 微信大群老板突袭红包！',
    character: '公司200人大群',
    avatar: '📱',
    description: '手机屏幕突然亮起！阎总在全员大群发了一个红包，附言：“今晚攻坚冲刺，大家辛苦了，抢到的今晚加把劲！”',
    choices: [
      {
        text: '【手速惊人】抢他丫的！不抢白不抢！',
        outcome: (state) => {
          return {
            triggerEnding: 'ending_red_packet_trap',
            msg: '你抢了0.28元，成了群里第一个领包的幸运儿……'
          };
        }
      },
      {
        text: '【忍住诱惑】长按静音，假装手机在充电没看见。',
        outcome: (state) => {
          state.energy -= 4;
          return {
            msg: '你把手机屏幕扣在桌上，深吸一口气。群里抢红包的倒霉蛋们迅速被阎总一一指名留堂……你暗自庆幸！',
            type: 'success'
          };
        }
      },
      {
        text: '【盟友掩护】让阿伟在群里替你发一句表情包转移视线。',
        outcome: (state) => {
          state.suspicion = Math.max(0, state.suspicion - 5);
          return {
            msg: '阿伟在群里连发五个“老板大气威武”，群消息瞬间被刷屏掩盖，没人注意到你！',
            type: 'info'
          };
        }
      }
    ]
  },

  {
    id: 'encounter_hr_patrol',
    zones: [2],
    title: '☕ HR刘姐的灵魂拷问',
    character: 'HR总监刘姐',
    avatar: '🍵',
    description: '刘姐端着养生壶微笑着从茶水间走出来，目光如炬打量着你：“小李，今天走得挺匆忙呀，是对最近团队的凝聚力有什么想法吗？”',
    choices: [
      {
        text: '拿出【便携版《劳动法》】对视微笑',
        requireItem: 'labor_law',
        outcome: (state) => {
          state.suspicion = Math.max(0, state.suspicion - 25);
          return {
            msg: '刘姐眼神瞥见那本闪着金光的《劳动法》，笑容瞬间凝固在脸上，干咳两声：“啊……劳动者权益也是公司文化的重要一环，小李觉悟真高！”快步离开了。',
            type: 'success'
          };
        }
      },
      {
        text: '反向画饼：“刘姐，我正在思考如何将咱们企业价值观深度融入敏捷交付闭环！”',
        outcome: (state) => {
          state.energy -= 6;
          state.suspicion = Math.max(0, state.suspicion - 10);
          return {
            msg: '刘姐听得连连点头：“好想法！周一记得交一份汇报给我！”你连忙答应并顺步飘走。',
            type: 'info'
          };
        }
      },
      {
        text: '甩锅阿伟：“刘姐，刚才阿伟在工位说有关于年假的严肃政策想向您请教！”',
        outcome: (state) => {
          return {
            msg: '刘姐眼睛一亮：“是吗？我这就去关怀阿伟！”阿伟，好兄弟对不住了！',
            type: 'warning'
          };
        }
      }
    ]
  },

  {
    id: 'encounter_boss_in_elevator',
    zones: [3],
    title: '😱 致命邂逅！电梯门里的阎总！',
    character: '大Boss阎总',
    avatar: '👔',
    description: '电梯门滑开的一瞬间，阎总正背着双手站在电梯正中央，金丝眼镜后面闪烁着探究的光芒：“小李？你拿着包，这是……？”',
    choices: [
      {
        text: '【反向画饼】“阎总！红杉投资人约我今晚密谈下轮融资架构，我正赶去赴约！”',
        outcome: (state) => {
          return {
            triggerEnding: 'ending_reverse_pie',
            msg: '阎总整个人震住了，拉住你的手热泪盈眶！'
          };
        }
      },
      {
        text: '【假装走错】“哎呀！我以为是上行去25楼机房送服务器钥匙，按错了！”迅速退步',
        outcome: (state) => {
          state.suspicion += 15;
          state.energy -= 10;
          return {
            msg: '你演技爆棚连退三步，电梯门缓缓关上。好险！差一点就被拉进去促膝长谈！(怀疑度 +15%)',
            type: 'warning'
          };
        }
      },
      {
        text: '【硬着头皮走进去】“阎总好，正好跟您汇报下今天的工作……”',
        outcome: (state) => {
          return {
            triggerEnding: 'ending_caught_meeting',
            msg: '阎总高兴坏了，直接把你拉进小会议室秉烛夜谈……'
          };
        }
      }
    ]
  },

  {
    id: 'encounter_boss_lobby_chase',
    zones: [4],
    title: '🚨 终极拦截！大堂回荡的呼喊！',
    character: '阎总的夺命追魂声',
    avatar: '📢',
    description: '距离大堂出口只剩最后十米，身后突然传来急促的皮鞋脚步声：“小李！给我站住！我有份加急合同要你确认！”',
    choices: [
      {
        text: '【亮出底牌】转身从容举起《劳动法》！',
        requireItem: 'labor_law',
        outcome: (state) => {
          return {
            triggerEnding: 'ending_labor_law',
            msg: '浩然正气横扫大堂！'
          };
        }
      },
      {
        text: '【金蝉脱壳】指向工位方向：“阎总，我把修改版打印好留在工位桌上了，您快去看！”',
        outcome: (state) => {
          if (state.flags.hasDecoyJacket && state.flags.hasFakeScreen) {
            return {
              triggerEnding: 'ending_decoy_master',
              msg: '阎总真的转身回楼上工位找你的“替身”去了！'
            };
          } else {
            state.suspicion += 30;
            return {
              msg: '阎总狐疑地看着你，没那么容易被骗，但还是犹豫了三秒钟！赶紧冲向闸机！',
              type: 'warning'
            };
          }
        }
      },
      {
        text: '【百米冲刺】装作没听见，低头咬牙向旋转门全力飞扑！',
        outcome: (state) => {
          if (state.energy >= 15) {
            return {
              triggerEnding: 'ending_perfect_clockout',
              msg: '你在全大堂诧异的目光中化作狂风卷出大门！'
            };
          } else {
            return {
              triggerEnding: 'ending_embarrassing_drop',
              msg: '你腿软摔在老王脚下，当场社死……'
            };
          }
        }
      }
    ]
  }
];
