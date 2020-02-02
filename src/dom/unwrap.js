import insertBefore from './insertBefore';
import remove from './remove';

/**
 * Unwraps base element.
 * @param {Node|HTMLElement} [el] - base DOM element to manipulate
 * @returns {Node[]} - child nodes of unwrapped element.
 */
export default function (el) {
  const nodes = Array.prototype.slice.call(el.childNodes);
  let wrapper;

  nodes.forEach((node) => {
    wrapper = node.parentNode;
    insertBefore(node, node.parentNode);
    remove(wrapper);
  });

  return nodes;
}
