import sortByDepth from './sortByDepth';
import isHighlight from './isHighlight';
import haveSameColor from './haveSameColor';
import { remove, insertAfter, insertBefore } from '../dom';

/**
 * Flattens highlights structure.
 * Note: this method changes input highlights -
 * their order and number after calling this method may change.
 * @param {Array} highlights - highlights to flatten.
 */
export default function (highlights) {
  let again;

  sortByDepth(highlights, true);

  function flattenOnce() {
    let shouldAgain = false;

    highlights.forEach((hl, i) => {
      const parent = hl.parentElement;
      const parentPrev = parent.previousSibling;
      const parentNext = parent.nextSibling;

      if (isHighlight(parent)) {
        if (!haveSameColor(parent, hl)) {
          if (!hl.nextSibling) {
            insertBefore(hl, parentNext || parent);
            shouldAgain = true;
          }

          if (!hl.previousSibling) {
            insertAfter(hl, parentPrev || parent);
            shouldAgain = true;
          }

          if (!parent.hasChildNodes()) {
            remove(parent);
          }
        } else {
          parent.replaceChild(hl.firstChild, hl);
          highlights[i] = parent;
          shouldAgain = true;
        }
      }
    });

    return shouldAgain;
  }

  do {
    again = flattenOnce();
  } while (again);
}
