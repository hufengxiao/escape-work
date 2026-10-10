/**
 * NPC Relationship & Favorability State Machine Manager
 */

import { NPCS } from '../data/npcs.js';
import { ITEMS } from '../data/items.js';

export class NPCManager {
  /**
   * Initialize NPC relations in GameState
   * @param {Object} state
   */
  static initRelations(state) {
    state.npcRelations = {};
    const roleId = state.selectedRoleId;

    Object.values(NPCS).forEach((npc) => {
      let initialFavor = npc.defaultFavorability;

      // Role affinity biases
      if (roleId === 'backend_dev') {
        if (npc.id === 'ah_wei') initialFavor += 15;
        if (npc.id === 'ah_qiang') initialFavor -= 15;
        if (npc.id === 'intern_chen') initialFavor += 10;
      } else if (roleId === 'product_manager' || roleId === 'product_mgr') {
        if (npc.id === 'ah_qiang') initialFavor += 35;
        if (npc.id === 'ah_wei') initialFavor -= 20;
      } else if (roleId === 'ui_designer') {
        if (npc.id === 'admin_team') initialFavor += 20;
        if (npc.id === 'intern_chen') initialFavor += 15;
      } else if (roleId === 'senior_slacker') {
        if (npc.id === 'ah_wei') initialFavor += 25;
        if (npc.id === 'lao_wang') initialFavor += 25;
      } else if (roleId === 'fresh_intern' || roleId === 'intern') {
        if (npc.id === 'lao_wang') initialFavor += 20;
        if (npc.id === 'intern_chen') initialFavor += 35;
      }

      initialFavor = Math.max(-100, Math.min(100, initialFavor));

      state.npcRelations[npc.id] = {
        id: npc.id,
        name: npc.name,
        favorability: initialFavor,
        status: NPCManager.getStatus(initialFavor),
        hasGrantedPerk: initialFavor >= 80,
        giftsGiven: 0
      };
    });
  }

  /**
   * Determine relationship tier status from numeric favorability
   * @param {number} favor
   * @returns {'ally'|'friendly'|'neutral'|'hostile'|'nemesis'}
   */
  static getStatus(favor) {
    if (favor >= 80) return 'ally';
    if (favor >= 30) return 'friendly';
    if (favor >= -20) return 'neutral';
    if (favor >= -60) return 'hostile';
    return 'nemesis';
  }

  /**
   * Adjust favorability of an NPC with boundary checking and perk triggers
   * @param {Object} state
   * @param {string} npcId
   * @param {number} delta
   * @param {string} reason
   * @returns {Object}
   */
  static adjustFavorability(state, npcId, delta, reason = '') {
    if (!state.npcRelations || !state.npcRelations[npcId]) {
      NPCManager.initRelations(state);
    }

    const rel = state.npcRelations[npcId];
    const prevStatus = rel.status;
    const prevFavor = rel.favorability;

    rel.favorability = Math.max(-100, Math.min(100, rel.favorability + delta));
    rel.status = NPCManager.getStatus(rel.favorability);

    const becameAlly = prevFavor < 80 && rel.favorability >= 80;
    const becameNemesis = prevFavor > -50 && rel.favorability <= -50;

    if (becameAlly) {
      rel.hasGrantedPerk = true;
      state.addLog(
        `🤝【盟友达成】你与【${rel.name}】关系升至【坚固盟友】！专属特权已激活！`,
        'achievement'
      );
    } else if (becameNemesis) {
      state.addLog(
        `⚡【关系破裂】你与【${rel.name}】关系降至冰点，触发惩罚机制！`,
        'alert'
      );
    }

    if (reason) {
      const sign = delta >= 0 ? `+${delta}` : `${delta}`;
      const type = delta >= 0 ? 'item' : 'alert';
      state.addLog(`【人脉变动】${rel.name} 好感度 ${sign} (${reason})`, type);
    }

    state.emit('npc:favor_change', { npcId, rel, delta });
    return rel;
  }

  /**
   * Gift an item to an NPC to boost favorability
   * @param {Object} state
   * @param {string} npcId
   * @param {string} itemId
   * @returns {Object}
   */
  static giftItem(state, npcId, itemId) {
    const npc = NPCS[npcId];
    if (!npc) return { success: false, message: '目标同事不存在' };
    if (!state.hasItem(itemId)) return { success: false, message: '背包中没有该物品' };

    const item = ITEMS[itemId];
    const isFavorite = npc.favoriteItems.includes(itemId);
    const delta = isFavorite ? 35 : 15;

    state.removeItem(itemId);
    const rel = NPCManager.adjustFavorability(
      state,
      npcId,
      delta,
      isFavorite ? `赠送了最爱的【${item?.name || itemId}】` : `赠送了【${item?.name || itemId}】`
    );

    rel.giftsGiven = (rel.giftsGiven || 0) + 1;

    let responseMsg = '';
    if (isFavorite) {
      responseMsg = `【投其所好】${npc.name} 喜笑颜开：“李哥太懂我了！这事包在我身上！” 好感度 +${delta}！`;
    } else {
      responseMsg = `${npc.name} 收下了礼物并礼貌致谢：“多谢心意！” 好感度 +${delta}。`;
    }

    return {
      success: true,
      delta,
      isFavorite,
      message: responseMsg
    };
  }

  /**
   * Return full relationship card data
   * @param {Object} state
   * @param {string} npcId
   * @returns {Object}
   */
  static getRelation(state, npcId) {
    if (!state.npcRelations || !state.npcRelations[npcId]) {
      NPCManager.initRelations(state);
    }
    const npcConfig = NPCS[npcId];
    const currentRel = state.npcRelations[npcId];
    return {
      ...npcConfig,
      ...currentRel
    };
  }
}
