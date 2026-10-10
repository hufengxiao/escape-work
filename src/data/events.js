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
        const reduce = state.flags.isDev ? 12 : 8;
        state.suspicion = Math.max(0, state.suspicion - reduce);
        return {
          msg: `你把半截铅笔扔在记事本上，把显示器亮度调到最亮，桌上倒扣一本技术书。老板怀疑度 -${reduce}%`,
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
      id: 'search_drawer',
      name: '翻查工位深层暗格',
      icon: '🗄️',
      costTime: 1,
      costEnergy: 2,
      desc: '翻找抽屉深处遗留的摸鱼宝藏与应急物资。',
      handler: (state) => {
        if (!state.hasItem('wind_oil')) {
          state.addItem('wind_oil');
          return {
            msg: '在抽屉角落摸出了一瓶【提神风油精】！涂在太阳穴有奇效。',
            type: 'item'
          };
        } else if (!state.hasItem('sunglasses')) {
          state.addItem('sunglasses');
          return {
            msg: '找到了同事送的【防蓝光深色墨镜】！戴上后眼神莫测。',
            type: 'item'
          };
        } else {
          state.energy = Math.min(100, state.energy + 8);
          return {
            msg: '翻出两颗薄荷润喉糖吃了下去，精神微微振奋，体力 +8！',
            type: 'success'
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
      id: 'keyboard_frenzy_pretend',
      name: '狂暴假装敲代码',
      icon: '⌨️',
      costTime: 1,
      costEnergy: 3,
      desc: '双手在键盘上疯狂飞舞敲击，假装正在抢修生产P0核心故障！（进入手速敲击 Mini-Game）',
      handler: (state) => {
        if (typeof window !== 'undefined' && window.__GAME__?.ui) {
          setTimeout(() => {
            import('../ui/miniGames.js').then(({ MiniGameUI }) => {
              MiniGameUI.showKeyboardFrenzy(state, window.__GAME__.engine);
            });
          }, 50);
          return { msg: '你深吸一口气，双手如闪电般搭在机械键盘上！', type: 'info' };
        }
        state.suspicion = Math.max(0, state.suspicion - 15);
        state.energy = Math.min(100, state.energy + 5);
        return { msg: '噼里啪啦的狂暴敲击声震慑了全场，老板路过以为你在抢修核心集群，怀疑度 -15%！', type: 'success' };
      }
    },
    {
      id: 'cable_tray_search',
      name: '勘测工位走线槽',
      icon: '🔌',
      costTime: 1,
      costEnergy: 2,
      desc: '弯腰假装插电源线，翻找工位走线槽下的暗藏物资。',
      handler: (state) => {
        if (!state.hasItem('ghost_keyboard')) {
          state.addItem('ghost_keyboard');
          return {
            msg: '在走线槽里发现了一把老员工遗留的【自动幽灵机械键盘】！已收入背包。',
            type: 'item'
          };
        } else if (!state.hasItem('intern_guide')) {
          state.addItem('intern_guide');
          return {
            msg: '翻出了一本实习生小陈落下的【00后职场整顿指南】！已收入背包。',
            type: 'item'
          };
        } else {
          state.energy = Math.min(100, state.energy + 10);
          return {
            msg: '你在走线槽角落摸到了一罐未开封的红牛，一饮而尽，体力 +10！',
            type: 'success'
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
      desc: '离开工位区，并同步推进逃脱路线至走廊分支！',
      handler: (state) => {
        let suspJump = 10;
        if (state.flags.hasDecoyJacket) suspJump -= 8;
        if (state.flags.hasCoffeeShield) suspJump -= 5;
        if (state.flags.isDesigner) suspJump -= 3;
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

        // Slacker or perk bonus
        if (state.flags.isSlacker || state.flags.hasToiletSpaPerk) {
          state.energy = Math.min(100, state.energy + 12);
        }

        if (state.toiletTurns >= 3) {
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
        } else if (!state.hasItem('resign_draft')) {
          state.addItem('resign_draft');
          return {
            msg: '你在碎纸机旁捡到了前人遗留的【离职交接清单草稿】！上面还赫然盖着红章！',
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
      id: 'visit_tea_table',
      name: '打卡茶水间点心台',
      icon: '🍰',
      costTime: 1,
      costEnergy: -12,
      desc: '补充能量，顺带偷听行政和运营部门的风吹草动。',
      handler: (state) => {
        const bonus = state.flags.modFridayTea ? 18 : 12;
        state.energy = Math.min(100, state.energy + bonus);
        state.suspicion = Math.max(0, state.suspicion - 4);
        return {
          msg: `你顺走了一块提拉米苏和一罐无糖红茶，能量瞬间恢复 +${bonus}！`,
          type: 'success'
        };
      }
    },
    {
      id: 'pantry_secret_raid',
      name: '突袭茶水间冷柜',
      icon: '🥤',
      costTime: 1,
      costEnergy: 2,
      desc: '打开茶水间双开门大冰箱深处，搜寻高能物资。',
      handler: (state) => {
        if (!state.hasItem('energy_potion')) {
          state.addItem('energy_potion');
          return {
            msg: '在冷柜顶层翻出了一瓶冰镇的【魔爪超能电解质水】！已收入背包。',
            type: 'item'
          };
        } else {
          state.energy = Math.min(100, state.energy + 15);
          return {
            msg: '你顺走了一盒行政刚切好的哈密瓜，大快朵颐，体力 +15！',
            type: 'success'
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
      desc: '抓住无人注视的空档切入玻璃门，并同步推进逃脱路线至垂直交通枢纽！',
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
        if (state.hasItem('cleaner_badge') || state.flags.hasCleanerBadge) {
          return {
            triggerEnding: 'ending_cleaner_disciple',
            msg: '你刷亮保洁主管工卡，保洁阿姨热情相迎，直接送你走专用后勤通道！'
          };
        }
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
        state.suspicion = 0;
        const actualCost = state.flags.isIntern ? 12 : 25;
        state.energy = Math.max(0, state.energy - actualCost);
        if (state.energy >= 30) {
          return {
            triggerEnding: 'ending_stair_sprinter',
            msg: `你撞开常闭防火门狂奔下楼！18、15、9、1！从容推开一楼消防侧门直接冲出大厦，逃出生天！`
          };
        } else {
          state.zone = 4;
          return {
            msg: `你撞开常闭防火门狂奔下楼！两腿发软直打颤，跌跌撞撞推开一楼侧门挪进大堂！(消耗${actualCost}体力，怀疑度归零！)`,
            type: 'warning'
          };
        }
      }
    },
    {
      id: 'crawl_ventilation',
      name: '潜行设备层排风道',
      icon: '🔦',
      costTime: 2,
      costEnergy: 18,
      desc: '从3楼设备层检修口潜入，直达B2地库排风井。',
      handler: (state) => {
        if (state.energy >= 18) {
          return {
            triggerEnding: 'ending_vent_crawl',
            msg: '你灵活如灵猫，顺着排风管道一路滑降至地库，神不知鬼不觉逃出生天！'
          };
        } else {
          state.suspicion += 15;
          return {
            msg: '管道口太窄加上体力不支，你卡在百叶窗前，赶紧狼狈退了出来！(怀疑度 +15%)',
            type: 'warning'
          };
        }
      }
    },
    {
      id: 'rest_at_vending',
      name: '自动贩卖机前喘口气',
      icon: '🥤',
      costTime: 1,
      costEnergy: -15,
      desc: '在角落贩卖机投币买一罐冰阔落，回口气。',
      handler: (state) => {
        state.energy = Math.min(100, state.energy + 15);
        return {
          msg: '冰镇汽水咕噜下肚，清凉直冲天灵盖！精神体力 +15！',
          type: 'success'
        };
      }
    },
    {
      id: 'fire_hydrant_stash',
      name: '搜查消火栓暗格',
      icon: '🧯',
      costTime: 1,
      costEnergy: 3,
      desc: '检查红色消火栓箱背后的隐秘空间。',
      handler: (state) => {
        if (!state.hasItem('master_keycard')) {
          state.addItem('master_keycard');
          return {
            msg: '在消火栓水带后摸到了一张保洁阿姨藏在此处的【万能后勤特权卡】！直通所有通道！',
            type: 'item'
          };
        } else {
          state.suspicion = Math.max(0, state.suspicion - 10);
          return {
            msg: '消火栓内视野隐蔽，你在此躲避片刻，高管巡查脚步声渐渐远去。怀疑度 -10%',
            type: 'success'
          };
        }
      }
    }
  ],

  4: [
    {
      id: 'clockout_qte_punch',
      name: '⏱️ 闸机毫秒压线打卡 (QTE)',
      icon: '⏱️',
      costTime: 1,
      costEnergy: 2,
      desc: '精准停表压线打卡！分秒不差挑战神仙准点判定！',
      handler: (state) => {
        if (state.currentHour < 18) {
          state.suspicion += 20;
          return {
            msg: `尚未到 18:00！闸机播报早退警告！当前时间 ${state.getTimeString()}，请先掐表熬到 18:00！(怀疑度 +20%)`,
            type: 'warning'
          };
        }
        if (typeof window !== 'undefined' && window.__GAME__?.ui) {
          setTimeout(() => {
            import('../ui/miniGames.js').then(({ MiniGameUI }) => {
              MiniGameUI.showClockOutQTE(state, window.__GAME__.engine, (qteResult) => {
                if (qteResult.grade === 'PERFECT') {
                  window.__GAME__.engine.triggerEnding('ending_god_slacker');
                } else if (qteResult.grade === 'LATE') {
                  window.__GAME__.engine.triggerEnding('ending_normal_escape');
                }
              });
            });
          }, 50);
          return {
            msg: '你走近蓝光闸机，准备在时钟划过 18:00:00 的瞬间精准掐表打卡！',
            type: 'info'
          };
        }
        return {
          triggerEnding: 'ending_perfect_clockout',
          msg: '闸机发出清脆的“滴——打卡成功！”'
        };
      }
    },
    {
      id: 'face_recognition',
      name: '人脸识别闸机打卡',
      icon: '📸',
      costTime: 1,
      costEnergy: 4,
      desc: '走到发着蓝光的面部识别闸机前刷脸。注意看当前时间！',
      handler: (state) => {
        if (state.currentHour < 18) {
          state.suspicion += 25;
          return {
            msg: `闸机红灯急促闪烁：“警告！当前时间 ${state.getTimeString()} 未到18:00，属于早退打卡行为，已抄送考勤主管！”你赶紧退后两步！(怀疑度 +25%)`,
            type: 'warning'
          };
        } else {
          // Special cyber borg check
          if (state.flags.hasCoffeeShield && state.energy >= 70 && state.hasItem('wind_oil')) {
            return {
              triggerEnding: 'ending_cyber_borg',
              msg: '双重提神神光附体，你化身没有感情的准点机械姬光速刷脸飞出大门！'
            };
          }
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
      id: 'present_resignation',
      name: '霸气亮出离职清单',
      icon: '📋',
      costTime: 1,
      costEnergy: 2,
      desc: '拿出已签字的离职交接清单，终极掀桌威慑！',
      handler: (state) => {
        if (state.hasItem('resign_draft') || state.flags.hasResignDraft) {
          return {
            triggerEnding: 'ending_resign_shock',
            msg: '离职清单一出，领导吓得面如土色当场加薪求你放过！'
          };
        } else {
          return {
            msg: '你两手空空，没有离职草稿在手，不敢贸然掀桌。',
            type: 'info'
          };
        }
      }
    },
    {
      id: 'disguise_delivery',
      name: '套上外卖马甲闪现出门',
      icon: '🛵',
      costTime: 1,
      costEnergy: 4,
      desc: '化身骑手小哥，利用大件货运通道直通户外。',
      handler: (state) => {
        if (state.flags.hasDeliveryDisguise) {
          return {
            triggerEnding: 'ending_delivery_disguise',
            msg: '你提着奶茶袋大步流星跨出旋转门，深藏功与名！'
          };
        } else {
          return {
            msg: '你身上没有外卖装备，大摇大摆走货运通道会被老王盘问。',
            type: 'warning'
          };
        }
      }
    },
    {
      id: 'wait_clockout',
      name: '闸机旁掐表读秒',
      icon: '⏱️',
      costTime: 1,
      costEnergy: 2,
      desc: '双手插兜假装低头看手机，眼睛余光死死盯住秒针，等待 18:00 整的到来！',
      handler: (state) => {
        if (state.currentHour >= 18) {
          return {
            msg: `时钟已敲响 ${state.getTimeString()}！下班倒计时已归零！立刻上前刷脸，正是神仙下班最佳时刻！`,
            type: 'success'
          };
        } else {
          return {
            msg: `当前时间 ${state.getTimeString()}……你强装镇定低头刷手机，心跳扑通直跳：“还差最后几分钟，稳住别慌！”`,
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
        }
        if (state.currentHour < 18) {
          state.suspicion += 25;
          return {
            msg: `未到 18:00 强冲大件通道！保安老王一把拉住你：“小伙子！现在才 ${state.getTimeString()}，没到下班点冲啥呢？全大堂都看着呢！”(怀疑度 +25%)`,
            type: 'warning'
          };
        }
        return {
          triggerEnding: 'ending_perfect_clockout',
          msg: '身手敏捷！时针恰好划过 18:00，你宛如一道黑色闪电在闸机闭合前0.1秒滑步冲出大堂！'
        };
      }
    }
  ]
};

export const RANDOM_ENCOUNTERS = [
  {
    id: 'encounter_buzzword_battle',
    zones: [1, 2, 3],
    title: '📢 高管突击：黑话矩阵灵魂拷问！',
    character: 'HR总监刘姐 / 业务VP',
    avatar: '👠',
    description: '高管迎面走来，眼神锐利：“小李，下半年你所负责板块的顶层设计和长效抓手是什么？给我拉通一下。”',
    choices: [
      {
        text: '🗣️ 现场黑话对线（限时 6 秒词牌组装 Mini-Game）',
        outcome: (state) => {
          if (typeof window !== 'undefined' && window.__GAME__?.ui) {
            setTimeout(() => {
              import('../ui/miniGames.js').then(({ MiniGameUI }) => {
                MiniGameUI.showBuzzwordBattle(state, window.__GAME__.engine);
              });
            }, 50);
            return { msg: '你深吸一口气，脑中疯狂检索高阶黑话词库！', type: 'info' };
          }
          state.suspicion = Math.max(0, state.suspicion - 10);
          return { msg: '你用一套顶层设计黑话组合拳直接震慑了高管！怀疑度 -10%', type: 'success' };
        }
      },
      {
        text: '🤫 低头附和假装沉思（怀疑度 +12%）',
        outcome: (state) => {
          state.suspicion += 12;
          return { msg: '你支支吾吾连连点头，高管皱了皱眉头，眼神里满是怀疑。(怀疑度 +12%)', type: 'warning' };
        }
      }
    ]
  },
  {
    id: 'encounter_redpacket_mine',
    zones: [1, 2],
    title: '🧧 全员大群突发：季度冲刺攻坚红包！',
    character: '大Boss阎总',
    avatar: '👔',
    description: '手机一阵急促震动！阎总在近千人的全员大群里连发三个拼手气红包，并附带语音：“今晚冲刺！红包抢得快的来我办公室对一下排期！”',
    choices: [
      {
        text: '🧧 抢红包排雷（进入微信排雷 Mini-Game）',
        outcome: (state) => {
          if (typeof window !== 'undefined' && window.__GAME__?.ui) {
            setTimeout(() => {
              import('../ui/miniGames.js').then(({ MiniGameUI }) => {
                MiniGameUI.showRedPacketModal(state, window.__GAME__.engine);
              });
            }, 50);
            return { msg: '你迅速点开微信大群红包界面！', type: 'info' };
          }
          return { msg: '你掐表领到了 2.5 元零钱，没引起任何注意。', type: 'info' };
        }
      },
      {
        text: '📴 假装开启免打扰闭关写代码',
        outcome: (state) => {
          state.suspicion = Math.max(0, state.suspicion - 5);
          return { msg: '你面无表情关掉手机屏幕，专注于显示器。安全隐蔽！', type: 'info' };
        }
      }
    ]
  },
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
        text: '【技术黑客威慑】搬出架构黑话：“这改动影响分布式一致性，必须提全员架构评审！”',
        outcome: (state) => {
          if (state.flags.isDev) {
            state.suspicion = Math.max(0, state.suspicion - 10);
            return {
              msg: '后端专属压制！你信手拈来一串底层高并发协议名词，阿强听得大脑宕机连连道歉跑开！',
              type: 'success'
            };
          }
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
        outcome: () => {
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
        outcome: () => {
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
        text: '【反向画饼】“刘姐，我正在思考如何将企业价值观深度融入敏捷交付闭环！”',
        outcome: (state) => {
          if (state.flags.isPM) {
            state.suspicion = Math.max(0, state.suspicion - 20);
            return {
              msg: '产品经理专属口才！你一顿敏捷生态闭环黑话直接把刘姐听懵了，当场在笔记本上记笔记！',
              type: 'success'
            };
          }
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
        outcome: () => {
          return {
            msg: '刘姐眼睛一亮：“是吗？我这就去关怀阿伟！”阿伟，好兄弟对不住了！',
            type: 'warning'
          };
        }
      }
    ]
  },

  {
    id: 'encounter_pantry_gossip',
    zones: [2],
    title: '🗣️ 茶水间八卦密谈组局',
    character: '财务小敏 & 行政阿花',
    avatar: '🧋',
    description: '两位行政核心成员正一边手冲咖啡一边咬耳朵：“听说阎总刚在7楼巡场发飙，现在正准备坐专梯上楼，今晚谁在工位谁倒霉……”',
    choices: [
      {
        text: '【凑近搭话】“真的吗？太吓人了，大家辛苦啦！”顺手拿块蛋糕',
        outcome: (state) => {
          state.suspicion = Math.max(0, state.suspicion - 10);
          state.energy = Math.min(100, state.energy + 10);
          return {
            msg: '妹子们热情地分给你一块芝士蛋糕，并提醒你快从侧门避开阎总！老板怀疑度 -10%，体力 +10！',
            type: 'success'
          };
        }
      },
      {
        text: '【精准情报】迅速锁定老板行踪，规划反向逃脱路线',
        outcome: (state) => {
          state.suspicion = Math.max(0, state.suspicion - 15);
          return {
            msg: '得知阎总动向，你精准避开了高危区域，从容前行！老板怀疑度 -15%',
            type: 'info'
          };
        }
      },
      {
        text: '非礼勿听，快步从背后静悄悄滑走',
        outcome: () => {
          return {
            msg: '你脚步轻盈如风，毫不起眼地绕过了茶水间视线。',
            type: 'info'
          };
        }
      }
    ]
  },

  {
    id: 'encounter_printer_jam',
    zones: [1, 2],
    title: '📄 激光打印机喷涌大卡纸！',
    character: '暴走的复合式打印机',
    avatar: '🖨️',
    description: '走廊打印机忽然发出一阵拖拉机般的轰鸣，红灯疯闪，几十张空白与草稿纸漫天喷射，引来走廊同事惊呼！',
    choices: [
      {
        text: '【趁乱搜寻】假装帮忙捡纸，顺手牵走地上的【离职交接清单草稿】！',
        outcome: (state) => {
          state.addItem('resign_draft');
          return {
            msg: '你在满地乱纸中捡到了核武器级别的【离职交接清单草稿】！已收入背包。',
            type: 'item'
          };
        }
      },
      {
        text: '【浑水摸鱼】借着满天飞舞的纸张掩护快步前插',
        outcome: (state) => {
          state.suspicion = Math.max(0, state.suspicion - 10);
          return {
            msg: '全场视线都被卡纸吸引，你从容穿过走廊，老板怀疑度 -10%',
            type: 'success'
          };
        }
      },
      {
        text: '【技术硬核修理】一脚踢中主板电源复位孔',
        outcome: (state) => {
          state.energy -= 4;
          return {
            msg: '打印机瞬间安静下来，周围同事投来敬仰目光，你深藏功与名迅速离开。',
            type: 'info'
          };
        }
      }
    ]
  },

  {
    id: 'encounter_delivery_guy',
    zones: [2, 3],
    title: '🛵 迷路的外卖闪送小哥',
    character: '外卖小哥小张',
    avatar: '🛵',
    description: '一位穿着黄马甲的小哥提着保温袋满头大汗：“哥！阎总订的特急生椰拿铁，302会议室到底在哪啊？马上要超时了！”',
    choices: [
      {
        text: '【绝妙伪装】热情指路，顺便借用小哥备用的【黄色反光马甲】！',
        outcome: (state) => {
          state.flags.hasDeliveryDisguise = true;
          return {
            msg: '小哥千恩万谢：“哥，我车筐里多一件旧背心送你了，谢谢指路！”解锁【外卖骑手伪装】！',
            type: 'item'
          };
        }
      },
      {
        text: '【半路截胡】“阎总让我来接应这杯超大冰美式！”大口吨吨吨',
        outcome: (state) => {
          state.energy = Math.min(100, state.energy + 25);
          return {
            msg: '浓缩冰美式直冲大脑，整个人直接进入亢奋模式！体力 +25！',
            type: 'success'
          };
        }
      },
      {
        text: '指向走廊最深处的反方向：“在那边！”转身溜走',
        outcome: () => {
          return {
            msg: '小哥朝反方向跑去，顺带吸引了走廊保安的目光。',
            type: 'info'
          };
        }
      }
    ]
  },

  {
    id: 'encounter_mock_interview',
    zones: [1, 2],
    title: '📋 突遭抓壮丁当面试官！',
    character: 'HR专员小周',
    avatar: '📑',
    description: '小周拿着简历小跑过来拉住你：“小李！应聘高级架构师的候选人在小会议室等了半小时了，主面老王临时拉肚子，您帮我顶上聊十分钟呗！”',
    choices: [
      {
        text: '出示【模拟大客户来电】：“喂？张总您到楼下了吗？我马上下来接您！”',
        requireItem: 'fake_call',
        outcome: (state) => {
          state.removeItem('fake_call');
          return {
            msg: '小周听到百亿大客户的声音连连道歉：“对不起对不起李哥，您快去！”迅速放你离开。',
            type: 'success'
          };
        }
      },
      {
        text: '【实习生萌新光环】“周姐，其实我也是刚来的实习生，我不会面呀……”',
        outcome: (state) => {
          if (state.flags.isIntern) {
            return {
              msg: '小周看了一眼你清澈的眼神，恍然大悟：“哎呀抓错人了！”一溜烟找别人去了。',
              type: 'success'
            };
          }
          state.suspicion += 8;
          return {
            msg: '小周白了你一眼：“李哥你别装嫩了！”，但还是被你推脱掉了。(怀疑度 +8%)',
            type: 'warning'
          };
        }
      },
      {
        text: '【三问速通法】“你对高可用分布式架构怎么看？回去等二面通知吧！”',
        outcome: (state) => {
          state.energy -= 8;
          return {
            msg: '三分钟速通面试！候选人被你的高深莫测折服，小周赞不绝口，你借机顺步撤离。',
            type: 'info'
          };
        }
      }
    ]
  },

  {
    id: 'encounter_security_camera',
    zones: [2, 3],
    title: '📹 360度高清天眼转头！',
    character: '走廊智能安防摄像头',
    avatar: '👁️',
    description: '天花板上倒挂的黑色球形探头突然发出“滋滋”声响，红外光点猛地转向了你的背包与背影！',
    choices: [
      {
        text: '戴上【防蓝光深色墨镜】若无其事大步走过',
        requireItem: 'sunglasses',
        outcome: () => {
          return {
            msg: '墨镜反射出自信冷酷的光芒，天眼AI人脸比对系统直接报错放弃！无懈可击！',
            type: 'success'
          };
        }
      },
      {
        text: '怀抱【厚重的项目策划书】昂首挺胸目视前方',
        requireItem: 'thick_folder',
        outcome: (state) => {
          state.suspicion = Math.max(0, state.suspicion - 8);
          return {
            msg: '策划书挡住大半个身子，监控室老王只当你是赶去开会的奋斗之星！怀疑度 -8%',
            type: 'success'
          };
        }
      },
      {
        text: '假装低头系鞋带滑入柱子阴影死角',
        outcome: (state) => {
          state.energy -= 4;
          return {
            msg: '你灵活闪进消防栓死角，探头缓缓移开。好险！消耗 4 体力。',
            type: 'info'
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
          // If PM or has fake_call, can trigger SSS+ true partner ending!
          if (state.flags.isPM || state.hasItem('fake_call')) {
            return {
              triggerEnding: 'ending_true_partner',
              msg: '红杉合伙人正好在楼下！你顺势成了阎总的大股东！'
            };
          }
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
        outcome: () => {
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
        outcome: () => {
          return {
            triggerEnding: 'ending_labor_law',
            msg: '浩然正气横扫大堂！'
          };
        }
      },
      {
        text: '【终极掀桌】甩出【离职交接清单草稿】：“阎总，我自愿辞职！”',
        requireItem: 'resign_draft',
        outcome: () => {
          return {
            triggerEnding: 'ending_resign_shock',
            msg: '阎总当场面色惨白，求你留步并当场加薪20%！'
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
          if (state.energy < 15) {
            return {
              triggerEnding: 'ending_embarrassing_drop',
              msg: '你腿软摔在老王脚下，当场社死……'
            };
          }
          if (state.currentHour < 18) {
            state.suspicion += 30;
            return {
              msg: `旋转门感应红灯急促鸣响：“当前未到 18:00 下班时间，非通行时段！”你差点撞在玻璃门上，身旁老王急忙将你拉住，身后传来阎总的厉声大喝！(怀疑度 +30%)`,
              type: 'warning'
            };
          }
          return {
            triggerEnding: 'ending_perfect_clockout',
            msg: '时针已过 18:00！你在全大堂诧异的目光中化作狂风压哨冲出大门！'
          };
        }
      }
    ]
  },

  {
    id: 'encounter_taichi_clash',
    zones: [1, 2, 3],
    title: '🤺 跨部门飞锅：P0级紧急需求空降拦截！',
    character: '产品总监 / 运维VP',
    avatar: '🤺',
    description: '对方捧着发烫的电脑神色慌张地将你堵在拐角：“线上突发紧急阻断，下班前务必帮忙合入主干排查！”',
    choices: [
      {
        text: '☯️ 施展职场太极·推诿对决（限时 8 秒对策 Mini-Game）',
        outcome: (state) => {
          if (typeof window !== 'undefined' && window.__GAME__?.ui) {
            setTimeout(() => {
              import('../ui/miniGames.js').then(({ MiniGameUI }) => {
                MiniGameUI.showTaiChiBattle(state, window.__GAME__.engine);
              });
            }, 50);
            return { msg: '你运起丹田之气，准备施展四两拨千斤的太极绝技！', type: 'info' };
          }
          state.suspicion = Math.max(0, state.suspicion - 15);
          return { msg: '你一套合规太极把锅甩给了架构组，成功脱身！', type: 'success' };
        }
      },
      {
        text: '🛡️ 亮出【甩锅紧急工单】：“我已经给运维专家组拉通单子了，别急！”',
        requireItem: 'panic_ticket',
        outcome: (state) => {
          state.suspicion = Math.max(0, state.suspicion - 10);
          return { msg: '你把红头工单拍在对方眼前，对方无言以对，赶紧跑回工位自查去了！', type: 'success' };
        }
      },
      {
        text: '🏃 假装赶去核心机房查看冷水机，低头快步溜走',
        outcome: (state) => {
          state.suspicion += 8;
          state.energy = Math.max(0, state.energy - 6);
          return { msg: '你步伐飞快擦肩而过，对方愣在原地，但你耗费了部分体力。(怀疑度 +8%, 体力 -6)', type: 'warning' };
        }
      }
    ]
  },

  {
    id: 'encounter_elevator_overload',
    zones: [3],
    title: '🛗 17:58 电梯超载危机：生死对视！',
    character: '满员电梯的12名同事',
    avatar: '🛗',
    description: '你刚踏进电梯，蜂鸣器瞬间刺耳尖叫“滴——滴——超载！请最后一位乘客退出！”。所有人的目光齐刷刷刺向你。',
    choices: [
      {
        text: '🎒 闪电将背包扔出电梯，身体紧贴轿厢内壁（体重减轻，刚好不超载！）',
        outcome: (state) => {
          state.suspicion = Math.max(0, state.suspicion - 10);
          state.energy = Math.min(100, state.energy + 5);
          return { msg: '超载蜂鸣器奇迹般停了！电梯门稳稳合上直奔一楼！(怀疑度 -10%)', type: 'success' };
        }
      },
      {
        text: '👓 指向门外：“阿强，阎总刚才在走廊喊你改Bug！”（忽悠阿强退出）',
        outcome: (state) => {
          state.suspicion = Math.max(0, state.suspicion - 5);
          return { msg: '阿强吓得魂飞魄散连滚带爬冲出电梯，门迅速合上下行！', type: 'success' };
        }
      },
      {
        text: '🏃 潇洒后撤：“各位先走，我走消防安全梯锻炼身体！”（切入安全通道）',
        outcome: (state) => {
          state.energy = Math.max(0, state.energy - 8);
          return { msg: '你从容退步推开防火门，直接化身楼梯特工狂奔下楼！(体力 -8)', type: 'info' };
        }
      }
    ]
  },

  {
    id: 'encounter_intern_rescue',
    zones: [1, 2],
    title: '🐣 00后实习生整顿职场：求救与支援！',
    character: '清澈实习生小陈 vs HR总监刘姐',
    avatar: '🐣',
    description: '刘姐正拿着绩效面谈表拦住小陈：“小陈，今晚跟师兄们一起留下来把下周的方案打磨好，年轻人要多奉献。” 小陈眼神倔强，悄悄朝你投来求助目光！',
    choices: [
      {
        text: '📘 递上《00后职场整顿指南》：“小陈，按第二章第四节给领导拉通！”',
        requireItem: 'intern_guide',
        outcome: (state) => {
          state.suspicion = Math.max(0, state.suspicion - 15);
          if (state.npcRelations?.intern_chen) {
            import('../engine/npcManager.js').then(({ NPCManager }) => {
              NPCManager.adjustFavorability(state, 'intern_chen', 35, '支援整顿职场');
            });
          }
          return { msg: '小陈心领神会，朗声背诵反PUA金句！刘姐瞠目结舌落荒而逃！小陈好感度飙升！', type: 'success' };
        }
      },
      {
        text: '⚖️ 挺身而出引用劳动法第四十一条帮小陈解围！',
        requireItem: 'labor_law',
        outcome: (state) => {
          state.suspicion = Math.max(0, state.suspicion - 20);
          return { msg: '浩然正气降维打击！刘姐尴尬地合上面谈本，小陈两眼放光对你佩服得五体投地！', type: 'success' };
        }
      },
      {
        text: '🍿 悄悄递给小陈一包大面筋，示意他找借口去洗手间溜走',
        outcome: (state) => {
          state.suspicion = Math.max(0, state.suspicion - 5);
          return { msg: '小陈借口肚子疼捂着肚子飞奔洗手间，刘姐无奈叹气离去。', type: 'info' };
        }
      }
    ]
  },

  {
    id: 'encounter_cloud_crash',
    zones: [1, 2],
    title: '🌩️ 突发全网宕机雪崩：核心集群告警！',
    character: '运维大群全员报警',
    avatar: '🌩️',
    description: '手机与工位电脑同时响起刺耳的钉钉警报音：“[P0警报] 核心数据库连接池暴涨至99.8%！” 阎总在千人大群里连续连麦语音：“所有人不准走！立刻连线排查！”',
    choices: [
      {
        text: '⌨️ 现场狂暴装忙敲键盘（进入手速敲击 Mini-Game，假装正在编写救援补丁！）',
        outcome: (state) => {
          if (typeof window !== 'undefined' && window.__GAME__?.ui) {
            setTimeout(() => {
              import('../ui/miniGames.js').then(({ MiniGameUI }) => {
                MiniGameUI.showKeyboardFrenzy(state, window.__GAME__.engine);
              });
            }, 50);
            return { msg: '你坐定工位，手指在键盘上划出残影！', type: 'info' };
          }
          state.suspicion = Math.max(0, state.suspicion - 20);
          return { msg: '你噼里啪啦狂敲代码，老板以为你已在紧急发布热修复，感动得不行！', type: 'success' };
        }
      },
      {
        text: '📴 火速拔掉网线切换移动热点：“网络中断，我立刻到一楼车里连移动网络排查！”',
        outcome: (state) => {
          state.suspicion = Math.max(0, state.suspicion - 10);
          return { msg: '借口去车里连网络，名正言顺冲向一楼大堂！', type: 'success' };
        }
      },
      {
        text: '🚨 亮出【P0级核聚变工单】：“架构组已全面接管，其余人员撤离现场！”',
        requireItem: 'p0_panic_overload',
        outcome: (state) => {
          state.suspicion = Math.max(0, state.suspicion - 30);
          return { msg: '【神装爆发】顶格安全响应启动，全员紧急疏散，你大摇大摆走向闸机！', type: 'success' };
        }
      }
    ]
  },

  {
    id: 'encounter_airdrop_leak',
    zones: [2, 3],
    title: '📡 隔空投送：匿名摸鱼小分队的绝密情报！',
    character: '神秘匿名AirDrop',
    avatar: '📡',
    description: 'iPhone 屏幕突然弹窗：“‘摸鱼不灭者’请求通过隔空投送发送一张照片”。点击预览，赫然是一张阎总刚踏入18楼高管专梯的监控偷拍照！附言：“老板下楼查岗了，走西区货梯！”',
    choices: [
      {
        text: '📲 信任情报：果断转向西区后勤货梯避开正梯！',
        outcome: (state) => {
          state.suspicion = Math.max(0, state.suspicion - 12);
          return { msg: '情报完全属实！你刚拐入货梯，身后正梯大门正好打开，阎总怒气冲冲走出！', type: 'success' };
        }
      },
      {
        text: '🕵️ 保持警惕：反手给阿伟发微信核实真实动向',
        outcome: (state) => {
          state.suspicion = Math.max(0, state.suspicion - 5);
          return { msg: '阿伟秒回：“是真的！我在货梯口给你掩护，快来！” 安全感爆棚！', type: 'info' };
        }
      },
      {
        text: '💨 趁老板还在专梯内，加速疾走穿越走廊！',
        outcome: (state) => {
          state.energy = Math.max(0, state.energy - 10);
          state.suspicion = Math.max(0, state.suspicion - 8);
          return { msg: '争分夺秒！你狂奔抢在电梯开门前穿过了走廊！(体力 -10, 怀疑度 -8%)', type: 'info' };
        }
      }
    ]
  },

  {
    id: 'encounter_cleaning_auntie',
    zones: [2, 3],
    title: '🧹 扫地僧指引：保洁张阿姨的暗道密报！',
    character: '保洁张阿姨',
    avatar: '🧹',
    description: '张阿姨推着满满当当的布草清洁车从防火门拐出，一把拉住你的衣袖低声道：“小伙子，走廊东边刘姐正带着人查工位呢，阿姨看你天天有礼貌，布草间后面有一道直通负一楼车库的滑道，快走！”',
    choices: [
      {
        text: '🚪 听从阿姨指引，钻入布草间直降通道！',
        outcome: (state) => {
          state.zone = 4;
          state.suspicion = Math.max(0, state.suspicion - 20);
          return { msg: '从布草间滑梯顺畅溜到底层，瞬间避开了所有楼层眼线，直达一楼！', type: 'success' };
        }
      },
      {
        text: '🎁 赠送阿姨一包零食点心致谢，获取阿姨的备用万能工卡！',
        requireItem: 'bag_snack',
        outcome: (state) => {
          state.addItem('cleaner_badge');
          state.suspicion = Math.max(0, state.suspicion - 10);
          return { msg: '阿姨笑逐颜开，悄悄塞给你一张【保洁万能工卡】：“下楼刷这个，哪个门都能开！”', type: 'item' };
        }
      },
      {
        text: '🚶 婉拒好意，继续观察走廊正道动向',
        outcome: (state) => {
          state.suspicion = Math.max(0, state.suspicion - 5);
          return { msg: '你谢过阿姨，贴着走廊墙角潜行前进。', type: 'info' };
        }
      }
    ]
  },

  {
    id: 'encounter_meeting_hostage',
    zones: [2],
    title: '🚪 走廊横祸：惨遭一把拽进神仙打架会议室！',
    character: '红着眼睛的业务甲乙双方',
    avatar: '🚪',
    description: '路过‘格陵兰岛’会议室门口时，房门猛地被推开，运营总监一把拽住你的胳膊：“小李来得正好！你来给评评理，这个需求延期到底算谁的责任？！” 屋内十几个双眼睛通红注视着你！',
    choices: [
      {
        text: '☯️ 开启职场太极推诿，四两拨千斤（触发太极 Mini-Game）！',
        outcome: (state) => {
          if (typeof window !== 'undefined' && window.__GAME__?.ui) {
            setTimeout(() => {
              import('../ui/miniGames.js').then(({ MiniGameUI }) => {
                MiniGameUI.showTaiChiBattle(state, window.__GAME__.engine);
              });
            }, 50);
            return { msg: '你神情肃穆，双手微抬准备开讲方法论！', type: 'info' };
          }
          state.suspicion = Math.max(0, state.suspicion - 12);
          return { msg: '你一套颗粒度与解耦理论把全屋人说得连连点头，趁乱溜出房门！', type: 'success' };
        }
      },
      {
        text: '📱 假装手机震动高举耳边：“喂？阎总！对对，我现在就送合同到您办公室！”',
        outcome: (state) => {
          state.suspicion = Math.max(0, state.suspicion - 10);
          return { msg: '一听“阎总”两个字，总监立马松手：“快去快去别耽误事！” 你闪电脱身！', type: 'success' };
        }
      },
      {
        text: '☕ 举起温热马克杯：“各位领导先喝口水消消气，我马上泡壶好茶”，闪身溜之大吉！',
        outcome: (state) => {
          state.suspicion = Math.max(0, state.suspicion - 8);
          return { msg: '你从容退步顺手带上会议室大门，屋里重新响起了激烈的争吵声。好险！', type: 'info' };
        }
      }
    ]
  },

  {
    id: 'encounter_express_locker_boss',
    zones: [3, 4],
    title: '📦 丰巢智能柜前偶遇阎总偷偷取生发水！',
    character: '略显尴尬的大Boss阎总',
    avatar: '📦',
    description: '你在地下通道拐角的丰巢快递柜前输入取件码，身旁的柜门“啪”地弹开。阎总正好戴着墨镜站在旁边，手中正拿着一盒写着“强根健发防脱生发液（尊享装）”的快递！两人四目相对，空气瞬间凝固！',
    choices: [
      {
        text: '🤝 假装视而不见，淡定取件并主动夸赞：“阎总，您今天的发量真精神，完全看不出熬夜！”',
        outcome: (state) => {
          state.suspicion = Math.max(0, state.suspicion - 25);
          state.energy = Math.min(100, state.energy + 10);
          return { msg: '阎总心花怒放，迅速把快递塞进口袋，亲切拍肩：“小李有眼光！下周提拔名单有你！”(怀疑度 -25%)', type: 'success' };
        }
      },
      {
        text: '🕶️ 摘下自己的防蓝光墨镜：“阎总好巧！我也经常在这里取技术图书！”',
        requireItem: 'sunglasses',
        outcome: (state) => {
          state.suspicion = Math.max(0, state.suspicion - 20);
          return { msg: '两人相视一笑，心照不宣。阎总甚至主动替你刷开了一楼侧门！', type: 'success' };
        }
      },
      {
        text: '🤐 一言不发默默递上一盒薄荷糖，两人达成中年男人的职场默契！',
        outcome: (state) => {
          state.suspicion = Math.max(0, state.suspicion - 15);
          return { msg: '阎总接过薄荷糖嚼了一颗，长叹一口气：“都不容易啊，快回去陪家里人吧。”', type: 'info' };
        }
      }
    ]
  }
];

