/**
 * Overtime Nightmare Events & Narrative Encounters
 * Survival mode from Friday 20:00 to Saturday 06:00
 */

export const OVERTIME_EVENTS = [
  {
    id: 'ot_big_pie',
    minHour: 20,
    title: '阎总的宏大愿景',
    text: '阎总猛拍讲台：“同志们！我们是兄弟！明年公司去纳斯达克敲钟，在座的每个人都有期权！”',
    effect: { sanity: -15, presenceMod: 5 },
    narrative: '听到“兄弟”两个字，你的眼皮又沉重了三分。'
  },
  {
    id: 'ot_granularity',
    minHour: 22,
    title: '颗粒度再对齐一遍',
    text: '运营总监突然举手：“阎总，我认为第4部分的业务颗粒度还需要再拉通对齐一次，确保闭环。”',
    effect: { sanity: -10, energy: -10 },
    narrative: '会场内此起彼伏的哈欠声被总监无情掐灭。'
  },
  {
    id: 'ot_cold_air',
    minHour: 23,
    title: '会议室冷气刺骨',
    text: '中央空调突然自动切到节能急冻模式，强劲的冷风直接从天花板灌入你的衣领！',
    effect: { sanity: 15, energy: -15 },
    narrative: '刺骨的寒气让你浑身一激灵，但体温在迅速流失。'
  },
  {
    id: 'ot_snack_arrived',
    minHour: 1,
    title: '阿伟叫的麻辣小龙虾外卖',
    text: '外卖小哥机智地将夜宵从小门送达会议室后排，满屋瞬间弥漫起十三香小龙虾的诱人香气！',
    effect: { energy: 25, sanity: 10, presenceMod: 10 },
    narrative: '剥着滚烫的小龙虾，整间会议室的疲惫暂时得到了缓解。'
  },
  {
    id: 'ot_roll_call',
    minHour: 2,
    title: '大Boss突击点名提问',
    text: '阎总目光突然如探照灯般扫向后排：“小李！你刚才对这一段的底层逻辑有什么补充？”',
    effect: { sanity: -15, presenceMod: 20 },
    narrative: '你神经瞬间紧绷，结结巴巴抛出三个黑话词汇，勉强搪塞过去！'
  },
  {
    id: 'ot_colleague_flee',
    minHour: 3,
    title: '摸鱼盟友阿伟提前溜走',
    text: '阿伟假装出去接客户电话，把包藏在外套里，悄无声息地溜向了货梯，桌上留下一罐未开封的红牛。',
    effect: { energy: 15, sanity: 5 },
    narrative: '你默默捡起阿伟遗留下的红牛灌了一大口，心中既羡慕又敬佩。'
  },
  {
    id: 'ot_dawn_light',
    minHour: 5,
    title: '百叶窗外的鱼肚白',
    text: '窗外高架桥上的路灯陆续熄灭，天边泛起了微弱的青白色。阎总的声音已经逐渐沙哑变弱。',
    effect: { sanity: 20, energy: -10 },
    narrative: '黎明前的至暗时刻即将过去！胜利的曙光就在前方！'
  }
];

export const OVERTIME_ACTIONS = [
  {
    id: 'act_nod_listen',
    name: '专注点头假听',
    desc: '假装眼神充满崇拜与沉思',
    sanity: -12,
    energy: -5,
    presence: 15,
    log: '你双手托腮、频频点头，阎总看到你求知若渴的眼神十分欣慰。（存在感 +15，清醒 -12）'
  },
  {
    id: 'act_drink_coffee',
    name: '偷喝冰美式咖啡',
    desc: '从保温杯里大口吸入冷萃',
    sanity: 20,
    energy: 15,
    presence: 5,
    log: '高浓度咖啡因注入心肌！神经系统重新兴奋，心跳飙到 120！（清醒 +20，体能 +15）'
  },
  {
    id: 'act_wash_face',
    name: '借口洗手间洗把脸',
    desc: '去水龙头前猛浇凉水并透气',
    sanity: 15,
    energy: 5,
    presence: -15,
    log: '冰凉的水流洗刷了沉重的困意，你顺便在窗边呼吸了三分钟夜风。（存在感 -15，清醒 +15）'
  },
  {
    id: 'act_order_takeout',
    name: '发起深夜外卖拼单',
    desc: '群里悄悄摇人凑满减',
    sanity: 10,
    energy: 25,
    presence: 12,
    log: '热气腾腾的生煎包与奶茶送达！大家边嚼边听，士气大振！（体能 +25，清醒 +10，存在感 +12）'
  },
  {
    id: 'act_hide_backrow',
    name: '缩在后排静默放空',
    desc: '借着绿植阴影开启元神出窍',
    sanity: 5,
    energy: 10,
    presence: -18,
    log: '你把身子缩在发财树的阴影下，大脑处于低功耗待机状态。（存在感 -18，体能 +10）'
  }
];
