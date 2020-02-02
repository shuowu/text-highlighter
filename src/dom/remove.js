/**
 * Removes base element from DOM.
 * @param {Node|HTMLElement} [el] - base DOM element to manipulate
 */
export default function (el) {
  el.parentNode.removeChild(el);
  el = null;
}
