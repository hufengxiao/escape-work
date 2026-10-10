/**
 * Workplace DAG Map Configuration & Node Pool
 */

export const MAP_LAYERS = [
  { depth: 0, zone: 1, name: '工位核心区', subtitle: '收拾家当，锁定退路' },
  { depth: 1, zone: 2, name: '楼层走廊与补给', subtitle: '各方耳目潜伏，谨慎探路' },
  { depth: 2, zone: 3, name: '纵向交通枢纽', subtitle: '垂直电梯与安全楼梯的博弈' },
  { depth: 3, zone: 4, name: '一楼大堂过渡', subtitle: '安保与前台视线交汇之地' },
  { depth: 4, zone: 4, name: '逃生最终关口', subtitle: '打卡闸机与通向自由之门' }
];

export const NODE_TYPES = {
  action: {
    type: 'action',
    name: '常规行动点',
    icon: '💼',
    desc: '提供常规摸鱼排查与离席行动，消耗体力与时间。',
    badgeClass: 'badge-action'
  },
  loot: {
    type: 'loot',
    name: '物资搜寻点',
    icon: '📦',
    desc: '可搜刮到强力逃跑道具或合成原材料，附带低概率警报。',
    badgeClass: 'badge-loot'
  },
  rest: {
    type: 'rest',
    name: '茶水补给点',
    icon: '☕',
    desc: '接水、小憩或补充零食，恢复 15~30 点体力与降低怀疑度。',
    badgeClass: 'badge-rest'
  },
  event: {
    type: 'event',
    name: '神秘事件点',
    icon: '❓',
    desc: '随机遭遇突发职场奇遇、高管巡查或同事八卦。',
    badgeClass: 'badge-event'
  },
  secret: {
    type: 'secret',
    name: '隐藏特权房',
    icon: '🗝️',
    desc: '高风险高收益路线，可避开大量巡逻视线。',
    badgeClass: 'badge-secret'
  },
  boss: {
    type: 'boss',
    name: '终极关卡',
    icon: '🚪',
    desc: '一楼大堂人脸识别闸机，逃脱大厦的最终防线。',
    badgeClass: 'badge-boss'
  }
};

export const LAYER_NODE_TEMPLATES = {
  0: [
    { title: '工位核心区', icon: '💻', desc: '你的专属作战工位，摆满替身外套与咖啡杯。', type: 'action' }
  ],
  1: [
    { title: '茶水间·咖啡角', icon: '☕', desc: '空气中弥漫着深度烘焙香气，适宜回血与打探八卦。', type: 'rest' },
    { title: '中央打印机区', icon: '🖨️', desc: '废纸篓堆积如山，常能搜刮出绝密交接单或红头故障。', type: 'loot' },
    { title: '吸烟区露台', icon: '🚬', desc: '老员工吞云吐雾的庇护所，避开大部分管理层视线。', type: 'secret' },
    { title: '主走廊巡检区', icon: '🏃', desc: '贯穿大办公区的主干道，视野开阔但也易引人注目。', type: 'action' },
    { title: '茶水储物间', icon: '📦', desc: '保洁阿姨存放手套与备用品的隐秘小隔间。', type: 'loot' }
  ],
  2: [
    { title: '1号高客专梯', icon: '🛗', desc: '下行速度最快的高危捷径，常有总监级领导同乘。', type: 'event' },
    { title: '消防应急爬梯', icon: '🪜', desc: '阴暗无监控的安全通道，体力消耗极大但怀疑度安全。', type: 'action' },
    { title: '弱电井布线道', icon: '⚡', desc: '工程师专属隐匿路线，直通机房强电夹层。', type: 'secret' },
    { title: '后勤员工货梯', icon: '🚪', desc: '装载快递与保洁布草的慢速升降机，需避开后勤主管。', type: 'loot' },
    { title: '行政小会议室', icon: '☕', desc: '空置的玻璃会议室，窗帘低垂，可以短暂停留喘息。', type: 'rest' }
  ],
  3: [
    { title: '行政前台阴影', icon: '🪑', desc: '距离前台接待仅有一道绿植屏风，小心被熟人认出。', type: 'action' },
    { title: '展厅立柱盲区', icon: '🏛️', desc: '公司发展史大型展示厅，高大柱体完美遮蔽视线。', type: 'event' },
    { title: '快递收发驿站', icon: '📦', desc: '堆满各路包裹的物流中转站，伪装穿梭的绝佳掩护。', type: 'loot' },
    { title: '员工更衣休息区', icon: '🛋️', desc: '沙发与更衣柜林立，补给零食饮料极度充裕。', type: 'rest' }
  ],
  4: [
    { title: '一楼大堂闸机', icon: '🚪', desc: '红外线人脸闸机正闪烁绿光，18:00 准点掐秒打卡脱险！', type: 'boss' }
  ]
};
