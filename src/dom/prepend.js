/**
 * Prepends child nodes to base element.
 * @param {Node|HTMLElement} [el] - base DOM element to manipulate
 * @param {Node[]} nodesToPrepend
 */
export default function (el, nodesToPrepend) {
  const nodes = Array.prototype.slice.call(nodesToPrepend);
  let i = nodes.length;

  while (i--) {
    el.insertBefore(nodes[i], el.firstChild);
  }
}
