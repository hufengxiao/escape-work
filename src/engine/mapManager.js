/**
 * DAG (Directed Acyclic Graph) Workplace Dungeon Map Generator & Manager
 */

import { PRNG } from '../utils/prng.js';
import { LAYER_NODE_TEMPLATES, MAP_LAYERS, NODE_TYPES } from '../data/maps.js';

export class MapManager {
  /**
   * Generates a 5-layer DAG map guaranteed to be connected with no orphan nodes
   * @param {string|number} seed
   * @returns {Array<Array<Object>>} 2D array of layers and nodes
   */
  static generateDungeonMap(seed = Date.now()) {
    const prng = new PRNG(seed);
    const layerCounts = [1, 3, 3, 2, 1]; // Depth 0 to 4
    const mapGraph = [];

    // 1. Generate nodes for each layer
    layerCounts.forEach((count, depth) => {
      const layerNodes = [];
      const templates = LAYER_NODE_TEMPLATES[depth] || [];

      for (let i = 0; i < count; i++) {
        let nodeData;
        if (depth === 0) {
          nodeData = { ...templates[0] };
        } else if (depth === 4) {
          nodeData = { ...templates[0] };
        } else {
          // Pick template or fallback
          const tmpl = templates[i % templates.length];
          const type = MapManager.pickNodeType(depth, prng);
          nodeData = {
            title: tmpl?.title || `战术探索点 ${depth}-${i + 1}`,
            icon: tmpl?.icon || NODE_TYPES[type]?.icon || '💼',
            desc: tmpl?.desc || NODE_TYPES[type]?.desc || '谨慎行动，留心周遭视线。',
            type
          };
        }

        layerNodes.push({
          id: `node_${depth}_${i}`,
          depth,
          index: i,
          zone: MAP_LAYERS[depth].zone,
          zoneName: MAP_LAYERS[depth].name,
          title: nodeData.title,
          icon: nodeData.icon,
          desc: nodeData.desc,
          type: nodeData.type,
          nextNodeIds: [],
          prevNodeIds: [],
          isVisited: depth === 0,
          isAvailable: depth === 0,
          hasBossThreat: false
        });
      }
      mapGraph.push(layerNodes);
    });

    // 2. Establish forward edges between adjacent layers
    for (let d = 0; d < layerCounts.length - 1; d++) {
      const currentLayer = mapGraph[d];
      const nextLayer = mapGraph[d + 1];

      currentLayer.forEach((node, i) => {
        // Guarantee at least 1 edge to matching or closest index
        const primaryTargetIndex = Math.min(i, nextLayer.length - 1);
        const primaryTarget = nextLayer[primaryTargetIndex];
        if (!node.nextNodeIds.includes(primaryTarget.id)) {
          node.nextNodeIds.push(primaryTarget.id);
          primaryTarget.prevNodeIds.push(node.id);
        }

        // 45% chance to branch out to an adjacent sibling in next layer
        if (prng.random() < 0.45 && primaryTargetIndex + 1 < nextLayer.length) {
          const secondaryTarget = nextLayer[primaryTargetIndex + 1];
          if (!node.nextNodeIds.includes(secondaryTarget.id)) {
            node.nextNodeIds.push(secondaryTarget.id);
            secondaryTarget.prevNodeIds.push(node.id);
          }
        }

        // Also if current layer has fewer nodes than next layer, ensure span
        if (i > 0 && primaryTargetIndex - 1 >= 0 && prng.random() < 0.3) {
          const alternateTarget = nextLayer[primaryTargetIndex - 1];
          if (!node.nextNodeIds.includes(alternateTarget.id)) {
            node.nextNodeIds.push(alternateTarget.id);
            alternateTarget.prevNodeIds.push(node.id);
          }
        }
      });

      // 3. Reverse pass: eliminate orphan nodes in nextLayer
      nextLayer.forEach((nextNode, nextIdx) => {
        if (nextNode.prevNodeIds.length === 0) {
          // Choose nearest parent in currentLayer
          const parentIdx = Math.min(nextIdx, currentLayer.length - 1);
          const parentNode = currentLayer[parentIdx];
          parentNode.nextNodeIds.push(nextNode.id);
          nextNode.prevNodeIds.push(parentNode.id);
        }
      });
    }

    // Set initial available nodes for layer 1 based on layer 0 choices
    const startNode = mapGraph[0][0];
    startNode.nextNodeIds.forEach((nextId) => {
      const n = MapManager.findNode(mapGraph, nextId);
      if (n) n.isAvailable = true;
    });

    return mapGraph;
  }

  static pickNodeType(depth, prng) {
    if (depth === 0) return 'action';
    if (depth === 4) return 'boss';
    const roll = prng.random();
    if (roll < 0.35) return 'action';
    if (roll < 0.60) return 'loot';
    if (roll < 0.80) return 'rest';
    if (roll < 0.95) return 'event';
    return 'secret';
  }

  /**
   * Find a node by ID in the 2D layered map
   * @param {Array<Array<Object>>} mapGraph
   * @param {string} nodeId
   * @returns {Object|null}
   */
  static findNode(mapGraph, nodeId) {
    if (!mapGraph) return null;
    for (const layer of mapGraph) {
      for (const node of layer) {
        if (node.id === nodeId) return node;
      }
    }
    return null;
  }

  /**
   * Returns all available next nodes for the current node
   * @param {Array<Array<Object>>} mapGraph
   * @param {string} currentNodeId
   * @returns {Array<Object>}
   */
  static getAvailableNextNodes(mapGraph, currentNodeId) {
    const currentNode = MapManager.findNode(mapGraph, currentNodeId);
    if (!currentNode) return [];
    return currentNode.nextNodeIds
      .map((id) => MapManager.findNode(mapGraph, id))
      .filter(Boolean);
  }

  /**
   * Check if targetId is reachable from startId (BFS graph search)
   * @param {Array<Array<Object>>} mapGraph
   * @param {string} startId
   * @param {string} targetId
   * @returns {boolean}
   */
  static isReachable(mapGraph, startId, targetId) {
    if (startId === targetId) return true;
    const visited = new Set();
    const queue = [startId];

    while (queue.length > 0) {
      const currId = queue.shift();
      if (currId === targetId) return true;
      if (visited.has(currId)) continue;
      visited.add(currId);

      const node = MapManager.findNode(mapGraph, currId);
      if (node && node.nextNodeIds) {
        for (const nextId of node.nextNodeIds) {
          if (!visited.has(nextId)) {
            queue.push(nextId);
          }
        }
      }
    }
    return false;
  }

  /**
   * Validates that all start nodes can reach all exit nodes
   * and there are 0 dead ends
   * @param {Array<Array<Object>>} mapGraph
   * @returns {boolean}
   */
  static validateMapConnectivity(mapGraph) {
    if (!mapGraph || mapGraph.length < 2) return false;
    const startNode = mapGraph[0][0];
    const endLayer = mapGraph[mapGraph.length - 1];
    const endNode = endLayer[0];

    // Every node in layer 0..depth-2 must have at least 1 next node
    for (let d = 0; d < mapGraph.length - 1; d++) {
      for (const node of mapGraph[d]) {
        if (!node.nextNodeIds || node.nextNodeIds.length === 0) {
          return false;
        }
      }
    }

    // Every node in layer 1..depth-1 must have at least 1 prev node
    for (let d = 1; d < mapGraph.length; d++) {
      for (const node of mapGraph[d]) {
        if (!node.prevNodeIds || node.prevNodeIds.length === 0) {
          return false;
        }
      }
    }

    // Must reach final exit
    return MapManager.isReachable(mapGraph, startNode.id, endNode.id);
  }
}
