import { NODE_TYPE, DATA_ATTR } from '../constants';

/**
 * Returns true if element is a highlight.
 * All highlights have 'data-highlighted' attribute.
 * @param el - element to check.
 * @returns {boolean}
 */
export default function isHighlight(el) {
  return el && el.nodeType === NODE_TYPE.ELEMENT_NODE && el.hasAttribute(DATA_ATTR);
}
