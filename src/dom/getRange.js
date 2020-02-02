import getSelection from './getSelection';

/**
 * Returns first range of the window of base element.
 * @param {Node|HTMLElement} [el] - base DOM element to manipulate
 * @returns {Range}
 */
export default function (el) {
  const selection = getSelection(el);
  let range;

  if (selection.rangeCount > 0) {
    range = selection.getRangeAt(0);
  }

  return range;
}
