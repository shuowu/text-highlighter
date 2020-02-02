/**
 * Returns array of base element parents.
 * @param {Node|HTMLElement} [el] - base DOM element to manipulate
 * @returns {HTMLElement[]}
 */
export default function (el) {
  let parent;
  const path = [];

  while (el.parentNode) {
    parent = el.parentNode;
    path.push(parent);
    el = parent;
  }

  return path;
}
