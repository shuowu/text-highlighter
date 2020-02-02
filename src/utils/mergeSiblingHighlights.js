import haveSameColor from './haveSameColor';
import isHighlight from './isHighlight';
import {
  prepend, append, remove, normalizeTextNodes,
} from '../dom';
import { NODE_TYPE } from '../constants';

function shouldMerge(current, node) {
  return node && node.nodeType === NODE_TYPE.ELEMENT_NODE
        && haveSameColor(current, node)
        && isHighlight(node);
}


/**
 * Merges sibling highlights and normalizes descendant text nodes.
 * Note: this method changes input highlights -
 * their order and number after calling this method may change.
 * @param highlights
 */
export default function (highlights) {
  highlights.forEach((highlight) => {
    const prev = highlight.previousSibling;
    const next = highlight.nextSibling;

    if (shouldMerge(highlight, prev)) {
      prepend(highlight, prev.childNodes);
      remove(prev);
    }
    if (shouldMerge(highlight, next)) {
      append(highlight, next.childNodes);
      remove(next);
    }

    normalizeTextNodes(highlight);
  });
}
