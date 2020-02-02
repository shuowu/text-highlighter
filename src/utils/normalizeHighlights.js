import flattenNestedHighlights from './flattenNestedHighlights';
import mergeSiblingHighlights from './mergeSiblingHighlights';
import unique from './unique';

/**
 * Normalizes highlights. Ensures that highlighting is done with use of the smallest
 * possible number of wrapping HTML elements.
 * Flattens highlights structure and merges sibling highlights. Normalizes text nodes
 * within highlights.
 * @param {Array} highlights - highlights to normalize.
 * @returns {Array} - array of normalized highlights.
 *  Order and number of returned highlights may be different than input highlights.
 */
export default function (highlights) {
  let normalizedHighlights;

  flattenNestedHighlights(highlights);
  mergeSiblingHighlights(highlights);

  // omit removed nodes
  normalizedHighlights = highlights.filter((hl) => (hl.parentElement ? hl : null));

  normalizedHighlights = unique(normalizedHighlights);
  normalizedHighlights.sort((a, b) => a.offsetTop - b.offsetTop || a.offsetLeft - b.offsetLeft);

  return normalizedHighlights;
}
