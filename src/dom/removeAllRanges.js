/**
 * Removes all ranges of the window of base element.
 * @param {Node|HTMLElement} [el] - base DOM element to manipulate
 */
export default function (el) {
  const selection = getSelection(el);
  selection.removeAllRanges();
}
