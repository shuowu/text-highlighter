import { NODE_TYPE } from '../constants';

const { TEXT_NODE } = NODE_TYPE;

/**
 * Takes range object as parameter and refines it boundaries
 * @param range
 * @returns {object} refined boundaries and initial state of highlighting algorithm.
 */
export default function refineRangeBoundaries(range) {
  let { startContainer } = range;
  let { endContainer } = range;
  const ancestor = range.commonAncestorContainer;
  let goDeeper = true;

  if (range.endOffset === 0) {
    while (!endContainer.previousSibling && endContainer.parentNode !== ancestor) {
      endContainer = endContainer.parentNode;
    }
    endContainer = endContainer.previousSibling;
  } else if (endContainer.nodeType === TEXT_NODE) {
    if (range.endOffset < endContainer.nodeValue.length) {
      endContainer.splitText(range.endOffset);
    }
  } else if (range.endOffset > 0) {
    endContainer = endContainer.childNodes.item(range.endOffset - 1);
  }

  if (startContainer.nodeType === TEXT_NODE) {
    if (range.startOffset === startContainer.nodeValue.length) {
      goDeeper = false;
    } else if (range.startOffset > 0) {
      startContainer = startContainer.splitText(range.startOffset);
      if (endContainer === startContainer.previousSibling) {
        endContainer = startContainer;
      }
    }
  } else if (range.startOffset < startContainer.childNodes.length) {
    startContainer = startContainer.childNodes.item(range.startOffset);
  } else {
    startContainer = startContainer.nextSibling;
  }

  return {
    startContainer,
    endContainer,
    goDeeper,
  };
}
