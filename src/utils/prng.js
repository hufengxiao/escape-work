/**
 * PRNG (Pseudo-Random Number Generator)
 * Mulberry32 implementation with string-seeded 32-bit FNV-1a hash
 * Provides 100% reproducible deterministic randomness for daily runs and map generation.
 */

export class PRNG {
  /**
   * @param {string|number} seed
   */
  constructor(seed = Date.now()) {
    if (typeof seed === 'string') {
      this.seed = this.hashString(seed);
    } else {
      this.seed = (Number(seed) >>> 0) || 123456789;
    }
  }

  /**
   * FNV-1a 32-bit string hashing
   * @param {string} str
   * @returns {number}
   */
  hashString(str) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < str.length; i++) {
      h = Math.imul(h ^ str.charCodeAt(i), 16777619);
    }
    return h >>> 0;
  }

  /**
   * Returns a deterministic float in [0, 1)
   * @returns {number}
   */
  random() {
    let t = (this.seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Returns a deterministic integer in [min, max] inclusive
   * @param {number} min
   * @param {number} max
   * @returns {number}
   */
  randInt(min, max) {
    if (min >= max) return min;
    return Math.floor(this.random() * (max - min + 1)) + min;
  }

  /**
   * Pick a random element from an array
   * @template T
   * @param {T[]} array
   * @returns {T}
   */
  choice(array) {
    if (!array || array.length === 0) return null;
    return array[this.randInt(0, array.length - 1)];
  }
}
