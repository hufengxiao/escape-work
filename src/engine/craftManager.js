/**
 * Workplace Item Crafting Engine & Synergy Matcher
 */

import { RECIPES } from '../data/recipes.js';
import { ITEMS } from '../data/items.js';

export class CraftManager {
  /**
   * Matches selected items against recipes regardless of selection order
   * @param {string[]} selectedItemIds
   * @returns {Object|null} Matching recipe or null
   */
  static matchRecipe(selectedItemIds) {
    if (!selectedItemIds || selectedItemIds.length < 2) return null;

    const sortedInputKey = [...selectedItemIds].sort().join('|');

    return (
      RECIPES.find((recipe) => {
        const sortedRecipeKey = [...recipe.ingredients].sort().join('|');
        return sortedInputKey === sortedRecipeKey;
      }) || null
    );
  }

  /**
   * Performs the crafting action on game state
   * @param {Object} state - GameState instance
   * @param {string[]} selectedItemIds
   * @returns {Object} Craft result
   */
  static craft(state, selectedItemIds) {
    if (!selectedItemIds || selectedItemIds.length < 2) {
      return { success: false, message: '请至少放入两件合成材料！' };
    }

    // Verify player actually has all ingredients
    const inventoryCopy = [...state.inventory];
    for (const itemId of selectedItemIds) {
      const idx = inventoryCopy.indexOf(itemId);
      if (idx === -1) {
        return { success: false, message: `背包中缺少原料【${ITEMS[itemId]?.name || itemId}】！` };
      }
      inventoryCopy.splice(idx, 1);
    }

    const recipe = CraftManager.matchRecipe(selectedItemIds);
    if (!recipe) {
      return {
        success: false,
        message: '这两件物品无法产生职场化学反应，未能合成新道具（材料已安全留在背包）。'
      };
    }

    // Consume ingredients
    selectedItemIds.forEach((itemId) => {
      state.removeItem(itemId);
    });

    // Add crafted result item
    state.addItem(recipe.resultItemId);

    // Track unlocked recipe in history
    if (!state.history.unlockedRecipes) {
      state.history.unlockedRecipes = [];
    }
    const isNewRecipe = !state.history.unlockedRecipes.includes(recipe.id);
    if (isNewRecipe) {
      state.history.unlockedRecipes.push(recipe.id);
      // Give slacker exp bonus for new discovery
      state.history.slackerExp = (state.history.slackerExp || 0) + 30;
    }
    state.savePersistentData();

    const resultItem = ITEMS[recipe.resultItemId];

    state.addLog(
      `✨【职场化学反应】你成功合成了【${recipe.rarity} ${recipe.name}】！${recipe.synergyDesc}`,
      'item'
    );

    return {
      success: true,
      recipe,
      resultItem,
      isNewRecipe,
      message: `恭喜！成功合成神装【${recipe.name}】！`
    };
  }

  /**
   * Returns list of all recipes with unlock status for the player
   * @param {Object} state
   * @returns {Array<Object>}
   */
  static getRecipeBook(state) {
    const unlocked = state.history?.unlockedRecipes || [];
    return RECIPES.map((r) => ({
      ...r,
      isUnlocked: unlocked.includes(r.id),
      resultItem: ITEMS[r.resultItemId]
    }));
  }
}
