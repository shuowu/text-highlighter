/**
 * Inserts base element after refEl.
 * @param {Node|HTMLElement} [el] - base DOM element to manipulate
 * @param {Node} refEl - node after which base element will be inserted
 * @returns {Node} - inserted element
 */
export default function (el, refEl) {
  return refEl.parentNode.insertBefore(el, refEl.nextSibling);
}
