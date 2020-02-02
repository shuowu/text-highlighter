/**
 * Returns true if base element contains given child.
 * @param {Node|HTMLElement} [el] - base DOM element to manipulate
 * @param {Node|HTMLElement} child
 * @returns {boolean}
 */
export default function (el, child) {
  return el !== child && el.contains(child);
}
