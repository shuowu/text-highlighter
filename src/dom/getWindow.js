import getDocument from './getDocument';

/**
 * Returns window of the base element.
 * @param {Node|HTMLElement} [el] - base DOM element to manipulate
 * @returns {Window}
 */
export default function (el) {
  return getDocument(el).defaultView;
}
