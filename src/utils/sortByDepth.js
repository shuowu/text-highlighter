import { parents } from '../dom';

/**
 * Sorts array of DOM elements by its depth in DOM tree.
 * @param {HTMLElement[]} arr - array to sort.
 * @param {boolean} descending - order of sort.
 */
export default function sortByDepth(arr, descending) {
  arr.sort((a, b) => parents(descending ? b : a).length - parents(descending ? a : b).length);
}
