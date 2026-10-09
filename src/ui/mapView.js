/**
 * Map View Component: Slay-the-Spire style DAG workplace escape route visualization
 */

import { MapManager } from '../engine/mapManager.js';
import { NODE_TYPES, MAP_LAYERS } from '../data/maps.js';
import { sound } from '../audio/sound.js';

export class MapView {
  /**
   * @param {Object} state - GameState instance
   * @param {Function} onSelectNode - Callback when an available node is clicked
   */
  constructor(state, onSelectNode) {
    this.state = state;
    this.onSelectNode = onSelectNode;
  }

  /**
   * Render HTML string for DAG Map component
   * @returns {string}
   */
  render() {
    const mapGraph = this.state.mapGraph;
    if (!mapGraph || mapGraph.length === 0) {
      return `<div class="map-loading">🗺️ 正在推演逃脱拓扑图...</div>`;
    }

    const currentNodeId = this.state.currentMapNodeId || mapGraph[0][0]?.id;

    return `
      <div class="map-view-container" id="map-view-container">
        <div class="map-header">
          <div class="map-title-row">
            <span class="map-header-icon">🗺️</span>
            <div>
              <h3 class="map-header-title">逃生路线拓扑网络 (DAG)</h3>
              <span class="map-header-sub">规划多段分支线路 · 避开高管视野直达一楼</span>
            </div>
          </div>
          <div class="map-legend">
            <span class="legend-chip">💼 行动</span>
            <span class="legend-chip">📦 物资</span>
            <span class="legend-chip">☕ 补给</span>
            <span class="legend-chip">❓ 奇遇</span>
            <span class="legend-chip">🗝️ 密道</span>
          </div>
        </div>

        <!-- Scrollable Graph Stage -->
        <div class="map-stage-scroll" id="map-stage-scroll">
          <div class="map-dag-grid" id="map-dag-grid">
            ${mapGraph
              .map((layer, depth) => {
                const layerMeta = MAP_LAYERS[depth] || { name: `第 ${depth + 1} 阶段` };
                return `
                  <div class="map-layer-column" data-depth="${depth}">
                    <div class="map-layer-header">
                      <span class="layer-depth-badge">L${depth + 1}</span>
                      <span class="layer-name">${layerMeta.name}</span>
                    </div>
                    <div class="map-layer-nodes">
                      ${layer
                        .map((node) => {
                          const isCurrent = node.id === currentNodeId;
                          const isVisited = node.isVisited && !isCurrent;
                          const isAvailable = node.isAvailable && !isCurrent && !isVisited;
                          const typeMeta = NODE_TYPES[node.type] || NODE_TYPES.action;

                          let statusClass = 'locked';
                          if (isCurrent) statusClass = 'current';
                          else if (isVisited) statusClass = 'visited';
                          else if (isAvailable) statusClass = 'available';

                          return `
                            <div 
                              class="map-node-card ${statusClass} ${node.hasBossThreat ? 'boss-threat' : ''}" 
                              data-node-id="${node.id}"
                              data-available="${isAvailable}"
                              id="map-node-${node.id}"
                              title="${node.title} - ${node.desc}"
                            >
                              <div class="node-icon-box">
                                <span class="node-icon">${node.icon}</span>
                                ${
                                  node.hasBossThreat
                                    ? `<span class="node-threat-badge" title="高管正在巡查相邻区域">⚠️</span>`
                                    : ''
                                }
                              </div>
                              <div class="node-info">
                                <strong class="node-title">${node.title}</strong>
                                <span class="node-type-tag ${typeMeta.badgeClass}">
                                  ${typeMeta.name}
                                </span>
                              </div>
                              ${isCurrent ? `<span class="node-pin-badge">📍 当前</span>` : ''}
                              ${
                                isAvailable
                                  ? `<button class="btn-node-enter" data-enter-id="${node.id}">前往</button>`
                                  : ''
                              }
                            </div>
                          `;
                        })
                        .join('')}
                    </div>
                  </div>
                `;
              })
              .join('')}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Bind event listeners to nodes after insertion into DOM
   * @param {HTMLElement} containerEl
   */
  bindEvents(containerEl) {
    if (!containerEl) return;

    // Node click
    containerEl.querySelectorAll('.map-node-card.available, .btn-node-enter').forEach((el) => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        const nodeId = el.dataset.nodeId || el.dataset.enterId;
        if (nodeId && this.onSelectNode) {
          sound.playClick();
          this.onSelectNode(nodeId);
        }
      });
    });

    // Auto-scroll to current active node column
    const currentCard = containerEl.querySelector('.map-node-card.current');
    if (currentCard) {
      setTimeout(() => {
        currentCard.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }, 50);
    }
  }
}
