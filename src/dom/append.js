/**
 * Appends child nodes to base element.
 * @param {Node|HTMLElement} [el] - base DOM element to manipulate
 * @param {Node[]} nodesToAppend
 */
export default function (el, nodesToAppend) {
  const nodes = Array.prototype.slice.call(nodesToAppend);

  for (let i = 0, len = nodes.length; i < len; ++i) {
    el.appendChild(nodes[i]);
  }
}
