import { NODE_TYPE } from '../constants';

const { TEXT_NODE } = NODE_TYPE;

/**
 * Normalizes text nodes within base element, ie. merges sibling text nodes and assures that every
 * element node has only one text node.
 * It should does the same as standard element.normalize, but IE implements it incorrectly.
 * @param {Node|HTMLElement} [el] - base DOM element to manipulate
 */
function normalizeTextNodes(el) {
  if (!el) {
    return;
  }

  if (el.nodeType === TEXT_NODE) {
    while (el.nextSibling && el.nextSibling.nodeType === TEXT_NODE) {
      el.nodeValue += el.nextSibling.nodeValue;
      el.parentNode.removeChild(el.nextSibling);
    }
  } else {
    normalizeTextNodes(el.firstChild);
  }
  normalizeTextNodes(el.nextSibling);
}

export default normalizeTextNodes;
