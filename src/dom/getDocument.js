/**
 * Returns document of the base element.
 * @param {Node|HTMLElement} [el] - base DOM element to manipulate
 * @returns {HTMLDocument}
 */
export default function (el) {
  // if ownerDocument is null then el is the document itself.
  return el.ownerDocument || el;
}
