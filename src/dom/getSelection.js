import getWindow from './getWindow';

/**
 * Returns selection object of the window of base element.
 * @param {Node|HTMLElement} [el] - base DOM element to manipulate
 * @returns {Selection}
 */
export default function (el) {
  return getWindow(el).getSelection();
}
