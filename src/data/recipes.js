/**
 * Workplace Item Crafting Recipes & Synergy Definitions
 */

export const RECIPES = [
  {
    id: 'recipe_cyber_stimulant',
    resultItemId: 'cyber_stimulant',
    name: '⚡ 赛博兴奋剂',
    ingredients: ['wind_oil', 'warm_coffee'],
    rarity: 'SSR',
    synergyDesc: '立即恢复 40 体力，后续 4 次行动体力消耗为 0，行动不消耗时间！',
    unlockAchievement: 'ach_craft_master'
  },
  {
    id: 'recipe_super_decoy_puppet',
    resultItemId: 'super_decoy_puppet',
    name: '🕴️ 究极替身傀儡',
    ingredients: ['chair_jacket', 'noise_headphones'],
    rarity: 'SR',
    synergyDesc: '留置工位替身。老板巡查怀疑度增加锁定为 0，持续吸引老板注意力。',
    unlockAchievement: 'ach_craft_decoy'
  },
  {
    id: 'recipe_labor_bomb',
    resultItemId: 'labor_bomb',
    name: '💣 职场正道核弹',
    ingredients: ['labor_law', 'resign_draft'],
    rarity: 'SSR',
    synergyDesc: '面对任意高管拦截，降维打击秒杀盘问，怀疑度骤降 50%！',
    unlockAchievement: 'ach_craft_bomb'
  },
  {
    id: 'recipe_delivery_suit_pro',
    resultItemId: 'delivery_suit_pro',
    name: '🛴 顺丰闪送全家桶',
    ingredients: ['yellow_vest', 'bag_snack'],
    rarity: 'SR',
    synergyDesc: '伪装度 100%，大堂安保与前台视你为空气，直通货运快速滑梯。',
    unlockAchievement: 'ach_craft_delivery'
  },
  {
    id: 'recipe_architect_aura',
    resultItemId: 'architect_aura',
    name: '☕ 架构师无敌气场',
    ingredients: ['thick_folder', 'sunglasses'],
    rarity: 'R',
    synergyDesc: '自带架构师从容光环，全区域行走无阻，怀疑度每回合自然衰减 3%。',
    unlockAchievement: 'ach_craft_aura'
  },
  {
    id: 'recipe_privacy_shield',
    resultItemId: 'privacy_shield',
    name: '🛡️ 绝对防窥屏障',
    ingredients: ['fake_bsod', 'cleaner_badge'],
    rarity: 'SR',
    synergyDesc: '电脑与通道全息锁死，任何突袭查岗均无法识破工位状态。',
    unlockAchievement: 'ach_craft_shield'
  },
  {
    id: 'recipe_tactical_smoke',
    resultItemId: 'tactical_smoke',
    name: '💨 战术烟雾对讲机',
    ingredients: ['hua_zi', 'fake_call'],
    rarity: 'SR',
    synergyDesc: '调动保安与高管视线，制造虚假警戒，阻断巡逻路线 3 回合。',
    unlockAchievement: 'ach_craft_smoke'
  },
  {
    id: 'recipe_p0_panic_overload',
    resultItemId: 'p0_panic_overload',
    name: '🚨 P0级核聚变工单',
    ingredients: ['panic_ticket', 'stomach_pill'],
    rarity: 'SSR',
    synergyDesc: '双重不可抗力护体，秒杀任何会议强制拉扯与下班阻拦！',
    unlockAchievement: 'ach_craft_p0'
  }
];
