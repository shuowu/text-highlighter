import { color } from '../dom';

/**
 * Returns true if elements a i b have the same color.
 * @param {Node} a
 * @param {Node} b
 * @returns {boolean}
 */
export default function haveSameColor(a, b) {
  return color(a) === color(b);
}
