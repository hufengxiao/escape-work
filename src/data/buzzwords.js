/**
 * Workplace Buzzwords & Corporate Jargon Database
 */

export const BUZZWORDS = [
  { id: 'bw_bottom_logic', text: '底层逻辑', weight: 28, category: 'architecture' },
  { id: 'bw_top_design', text: '顶层设计', weight: 30, category: 'strategy' },
  { id: 'bw_granularity', text: '颗粒度', weight: 25, category: 'detail' },
  { id: 'bw_closed_loop', text: '生态闭环', weight: 32, category: 'ecosystem' },
  { id: 'bw_diff_playbook', text: '差异化打法', weight: 26, category: 'strategy' },
  { id: 'bw_empower_lever', text: '赋能抓手', weight: 28, category: 'execution' },
  { id: 'bw_dim_strike', text: '降维打击', weight: 35, category: 'power' },
  { id: 'bw_align_through', text: '对齐拉通', weight: 22, category: 'collaboration' },
  { id: 'bw_mindshare_hit', text: '击穿心智', weight: 30, category: 'marketing' },
  { id: 'bw_moat', text: '核心护城河', weight: 32, category: 'strategy' },
  { id: 'bw_full_link_review', text: '全链路复盘', weight: 24, category: 'review' },
  { id: 'bw_matrix_force', text: '矩阵式发力', weight: 26, category: 'execution' },
  { id: 'bw_methodology', text: '沉淀方法论', weight: 29, category: 'value' },
  { id: 'bw_value_conv', text: '长效价值转化', weight: 25, category: 'value' },
  { id: 'bw_agile_sprint', text: '敏捷迭代', weight: 20, category: 'tech' },
  { id: 'bw_ha_redundancy', text: '高可用冗余', weight: 25, category: 'tech' },
  { id: 'bw_resource_tilt', text: '资源战略倾斜', weight: 27, category: 'power' },
  { id: 'bw_private_break', text: '私域破圈打法', weight: 26, category: 'marketing' }
];

export const BUZZWORD_PROMPTS = [
  {
    bossTitle: 'HR总监刘姐',
    bossAvatar: '👠',
    question: '“小李，你负责的业务板块这个季度有什么核心交付物与心智沉淀？”',
    targetCategory: 'value'
  },
  {
    bossTitle: '大Boss阎总',
    bossAvatar: '👔',
    question: '“汇报一下你下半年的战略抓手，怎么跟集团大盘对齐形成护城河？”',
    targetCategory: 'strategy'
  },
  {
    bossTitle: '需求刺客阿强',
    bossAvatar: '👓',
    question: '“李哥，咱们这套新流程的业务闭环怎么打？能不能今晚先拉通一下？”',
    targetCategory: 'collaboration'
  }
];

/**
 * Calculates buzzword battle score from chosen word IDs
 * @param {string[]} chosenIds
 * @param {string} roleId
 * @returns {number} Score between 0 and 100+
 */
export function calculateBuzzwordScore(chosenIds, roleId = 'backend_dev') {
  if (!chosenIds || chosenIds.length === 0) return 0;

  let totalWeight = 0;
  chosenIds.forEach((id) => {
    const word = BUZZWORDS.find((w) => w.id === id);
    if (word) {
      totalWeight += word.weight;
    }
  });

  // Role synergy bonus
  let multiplier = 1.0;
  if (roleId === 'product_mgr') multiplier = 1.15;
  if (roleId === 'backend_dev') multiplier = 1.05;

  return Math.round(totalWeight * multiplier);
}
