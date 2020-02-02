/**
 * Adds class to element.
 * @param {Node|HTMLElement} [el] - base DOM element to manipulate
 * @param {string} className
 */

function addClass (el, className) {
  if (el.classList) {
    el.classList.add(className);
  } else {
    el.className += ` ${className}`;
  }
}

/**
 * Returns true if base element contains given child.
 * @param {Node|HTMLElement} [el] - base DOM element to manipulate
 * @param {Node|HTMLElement} child
 * @returns {boolean}
 */
function contains (el, child) {
  return el !== child && el.contains(child);
}

/**
 * Creates dom element from given html string.
 * @param {string} html
 * @returns {NodeList}
 */
function fromHTML (html) {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.childNodes;
}

/**
 * Returns document of the base element.
 * @param {Node|HTMLElement} [el] - base DOM element to manipulate
 * @returns {HTMLDocument}
 */
function getDocument (el) {
  // if ownerDocument is null then el is the document itself.
  return el.ownerDocument || el;
}

/**
 * Returns window of the base element.
 * @param {Node|HTMLElement} [el] - base DOM element to manipulate
 * @returns {Window}
 */
function getWindow (el) {
  return getDocument(el).defaultView;
}

/**
 * Returns selection object of the window of base element.
 * @param {Node|HTMLElement} [el] - base DOM element to manipulate
 * @returns {Selection}
 */
function getSelection$1 (el) {
  return getWindow(el).getSelection();
}

/**
 * Returns first range of the window of base element.
 * @param {Node|HTMLElement} [el] - base DOM element to manipulate
 * @returns {Range}
 */
function getRange (el) {
  const selection = getSelection$1(el);
  let range;

  if (selection.rangeCount > 0) {
    range = selection.getRangeAt(0);
  }

  return range;
}

/**
 * Inserts base element before refEl.
 * @param {Node|HTMLElement} [el] - base DOM element to manipulate
 * @param {Node} refEl - node before which base element will be inserted
 * @returns {Node} - inserted element
 */
function insertBefore (el, refEl) {
  return refEl.parentNode.insertBefore(el, refEl);
}

const NODE_TYPE = {
  ELEMENT_NODE: 1,
  TEXT_NODE: 3,
};

/**
 * Attribute added by default to every highlight.
 * @type {string}
 */
const DATA_ATTR = 'data-highlighted';

/**
 * Attribute used to group highlight wrappers.
 * @type {string}
 */
const TIMESTAMP_ATTR = 'data-timestamp';


/**
 * Don't highlight content of these tags.
 * @type {string[]}
 */
const IGNORE_TAGS = [
  'SCRIPT', 'STYLE', 'SELECT', 'OPTION', 'BUTTON', 'OBJECT', 'APPLET', 'VIDEO', 'AUDIO', 'CANVAS', 'EMBED',
  'PARAM', 'METER', 'PROGRESS',
];

/**
 * Returns array of base element parents.
 * @param {Node|HTMLElement} [el] - base DOM element to manipulate
 * @returns {HTMLElement[]}
 */
function parents (el) {
  let parent;
  const path = [];

  while (el.parentNode) {
    parent = el.parentNode;
    path.push(parent);
    el = parent;
  }

  return path;
}

/**
 * Removes base element from DOM.
 * @param {Node|HTMLElement} [el] - base DOM element to manipulate
 */
function remove (el) {
  el.parentNode.removeChild(el);
  el = null;
}

/**
 * Removes all ranges of the window of base element.
 * @param {Node|HTMLElement} [el] - base DOM element to manipulate
 */
function removeAllRanges (el) {
  const selection = getSelection(el);
  selection.removeAllRanges();
}

/**
 * Removes class from element.
 * @param {Node|HTMLElement} [el] - base DOM element to manipulate
 * @param {string} className
 */
function removeClass (el, className) {
  if (el.classList) {
    el.classList.remove(className);
  } else {
    el.className = el.className.replace(
      new RegExp(`(^|\\b)${className}(\\b|$)`, 'gi'), ' ',
    );
  }
}

/**
 * Unwraps base element.
 * @param {Node|HTMLElement} [el] - base DOM element to manipulate
 * @returns {Node[]} - child nodes of unwrapped element.
 */
function unwrap (el) {
  const nodes = Array.prototype.slice.call(el.childNodes);
  let wrapper;

  nodes.forEach((node) => {
    wrapper = node.parentNode;
    insertBefore(wrapper, node.parentNode);
    remove(wrapper);
  });

  return nodes;
}

/**
 * Wraps base element in wrapper element.
 * @param {Node|HTMLElement} [el] - base DOM element to manipulate
 * @param {HTMLElement} wrapper
 * @returns {HTMLElement} wrapper element
 */
function wrap (el, wrapper) {
  if (el.parentNode) {
    el.parentNode.insertBefore(wrapper, el);
  }

  wrapper.appendChild(el);
  return wrapper;
}

function bindEvents(el, scope) {
  el.addEventListener('mouseup', scope.highlightHandler.bind(scope));
  el.addEventListener('touchend', scope.highlightHandler.bind(scope));
}

/**
 * Fills undefined values in obj with default properties with the same name from source object.
 * @param {object} obj - target object
 * @param {object} source - source object with default values
 * @returns {object}
 */
function defaults(obj, source) {
  obj = obj || {};

  Object.keys(source).forEach((prop) => {
    obj[prop] = source[prop];
  });

  return obj;
}

/**
 * Sorts array of DOM elements by its depth in DOM tree.
 * @param {HTMLElement[]} arr - array to sort.
 * @param {boolean} descending - order of sort.
 */
function sortByDepth(arr, descending) {
  arr.sort((a, b) => parents(descending ? b : a).length - parents(descending ? a : b).length);
}

/**
 * Groups given highlights by timestamp.
 * @param {Array} highlights
 * @returns {Array} Grouped highlights.
 */
function groupHighlights(highlights) {
  const order = [];
  const chunks = {};
  const grouped = [];

  highlights.forEach((hl) => {
    const timestamp = hl.getAttribute(TIMESTAMP_ATTR);

    if (typeof chunks[timestamp] === 'undefined') {
      chunks[timestamp] = [];
      order.push(timestamp);
    }

    chunks[timestamp].push(hl);
  });

  order.forEach((timestamp) => {
    const group = chunks[timestamp];

    grouped.push({
      chunks: group,
      timestamp,
      toString() {
        return group.map((h) => h.textContent).join('');
      },
    });
  });

  return grouped;
}

const { TEXT_NODE } = NODE_TYPE;

/**
 * Takes range object as parameter and refines it boundaries
 * @param range
 * @returns {object} refined boundaries and initial state of highlighting algorithm.
 */
function refineRangeBoundaries(range) {
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

function unbindEvents(el, scope) {
  el.removeEventListener('mouseup', scope.highlightHandler.bind(scope));
  el.removeEventListener('touchend', scope.highlightHandler.bind(scope));
}

/**
 * Returns array without duplicated values.
 * @param {Array} arr
 * @returns {Array}
 */
function unique(arr) {
  return arr.filter((value, idx, self) => self.indexOf(value) === idx);
}

class TextHighlighter {
  /**
   * Creates wrapper for highlights.
   * TextHighlighter instance calls this method each time
   * it needs to create highlights and pass options retrieved
   * in constructor.
   * @param {object} options - the same object as in TextHighlighter constructor.
   * @returns {HTMLElement}
   * @static
   */
  static createWrapper(options) {
    const span = document.createElement('span');
    span.style.backgroundColor = options.color;
    span.className = options.highlightedClass;
    return span;
  }

  /**
   * Creates TextHighlighter instance and binds to given DOM elements.
   * @param {HTMLElement} element - DOM element to which highlighted will be applied.
   * @param {object} [options] - additional options.
   * @param {string} options.color - highlight color.
   * @param {string} options.highlightedClass - class added to highlight, 'highlighted' by default.
   * @param {string} options.contextClass - class added to element to which highlighter is applied,
   *  'highlighter-context' by default.
   * @param {function} options.onRemoveHighlight - function called before highlight is removed.
   *  Highlight is passed as param. Function should return true if highlight should be removed,
   *  or false - to prevent removal.
   * @param {function} options.onBeforeHighlight - function called before highlight is created.
   *  Range object is passed as param. Function should return true to continue processing,
   *  or false - to prevent highlighting.
   * @param {function} options.onAfterHighlight - function called after highlight is created.
   *  Array of created wrappers is passed as param.
   */
  constructor(element, options) {
    if (!element) {
      throw new Error('Missing anchor element');
    }

    this.el = element;
    this.options = defaults(options, {
      color: '#ffff7b',
      highlightedClass: 'highlighted',
      contextClass: 'highlighter-context',
      onRemoveHighlight() { return true; },
      onBeforeHighlight() { return true; },
      onAfterHighlight() { },
    });

    addClass(this.el, this.options.contextClass);
    bindEvents(this.el, this);
  }

  /**
   * Permanently disables highlighting.
   * Unbinds events and remove context element class.
   */
  destroy() {
    unbindEvents(this.el, this);
    removeClass(this.el, this.options.contextClass);
  }

  highlightHandler() {
    this.doHighlight();
  }

  /**
   * Highlights current range.
   * @param {boolean} keepRange - Don't remove range after highlighting. Default: false.
   */
  doHighlight(keepRange) {
    const range = getRange(this.el);
    let wrapper;
    let createdHighlights;
    let normalizedHighlights;
    let timestamp;

    if (!range || range.collapsed) {
      return;
    }

    if (this.options.onBeforeHighlight(range) === true) {
      timestamp = +new Date();
      wrapper = TextHighlighter.createWrapper(this.options);
      wrapper.setAttribute(TIMESTAMP_ATTR, timestamp);

      createdHighlights = this.highlightRange(range, wrapper);
      normalizedHighlights = this.normalizeHighlights(createdHighlights);

      this.options.onAfterHighlight(range, normalizedHighlights, timestamp);
    }

    if (!keepRange) {
      removeAllRanges(this.el);
    }
  }

  /**
   * Highlights range.
   * Wraps text of given range object in wrapper element.
   * @param {Range} range
   * @param {HTMLElement} wrapper
   * @returns {Array} - array of created highlights.
   */
  highlightRange(range, wrapper) {
    if (!range || range.collapsed) {
      return [];
    }

    const result = refineRangeBoundaries(range);
    const { startContainer } = result;
    const { endContainer } = result;
    let { goDeeper } = result;
    let done = false;
    let node = startContainer;
    const highlights = [];
    let highlight;
    let wrapperClone;
    let nodeParent;

    do {
      if (goDeeper && node.nodeType === NODE_TYPE.TEXT_NODE) {
        if (IGNORE_TAGS.indexOf(node.parentNode.tagName) === -1 && node.nodeValue.trim() !== '') {
          wrapperClone = wrapper.cloneNode(true);
          wrapperClone.setAttribute(DATA_ATTR, true);
          nodeParent = node.parentNode;

          // highlight if a node is inside the el
          if (contains(this.el, nodeParent) || nodeParent === this.el) {
            highlight = wrap(node, wrapperClone);
            highlights.push(highlight);
          }
        }

        goDeeper = false;
      }
      if (node === endContainer && !(endContainer.hasChildNodes() && goDeeper)) {
        done = true;
      }

      if (node.tagName && IGNORE_TAGS.indexOf(node.tagName) > -1) {
        if (endContainer.parentNode === node) {
          done = true;
        }
        goDeeper = false;
      }
      if (goDeeper && node.hasChildNodes()) {
        node = node.firstChild;
      } else if (node.nextSibling) {
        node = node.nextSibling;
        goDeeper = true;
      } else {
        node = node.parentNode;
        goDeeper = false;
      }
    } while (!done);

    return highlights;
  }


  /**
   * Normalizes highlights. Ensures that highlighting is done with use of the smallest
   * possible number of wrapping HTML elements.
   * Flattens highlights structure and merges sibling highlights. Normalizes text nodes
   * within highlights.
   * @param {Array} highlights - highlights to normalize.
   * @returns {Array} - array of normalized highlights.
   *  Order and number of returned highlights may be different than input highlights.
   */
  normalizeHighlights(highlights) {
    let normalizedHighlights;

    this.flattenNestedHighlights(highlights);
    this.mergeSiblingHighlights(highlights);

    // omit removed nodes
    normalizedHighlights = highlights.filter((hl) => (hl.parentElement ? hl : null));

    normalizedHighlights = unique(normalizedHighlights);
    normalizedHighlights.sort((a, b) => a.offsetTop - b.offsetTop || a.offsetLeft - b.offsetLeft);

    return normalizedHighlights;
  }

  /**
   * Sets highlighting color.
   * @param {string} color - valid CSS color.
   */
  setColor(color) {
    this.options.color = color;
  }

  /**
   * Returns highlighting color.
   * @returns {string}
   */
  getColor() {
    return this.options.color;
  }


  /**
   * Removes highlights from element. If element is a highlight itself, it is removed as well.
   * If no element is given, all highlights all removed.
   * @param {HTMLElement} [element] - element to remove highlights from
   */
  removeHighlights(element) {
    const container = element || this.el;
    const highlights = this.getHighlights({ container });
    const self = this;

    function mergeSiblingTextNodes(textNode) {
      const prev = textNode.previousSibling;
      const next = textNode.nextSibling;

      if (prev && prev.nodeType === NODE_TYPE.TEXT_NODE) {
        textNode.nodeValue = prev.nodeValue + textNode.nodeValue;
        remove(prev);
      }
      if (next && next.nodeType === NODE_TYPE.TEXT_NODE) {
        textNode.nodeValue += next.nodeValue;
        remove(next);
      }
    }

    function removeHighlight(highlight) {
      const textNodes = unwrap(highlight);

      textNodes.forEach((node) => {
        mergeSiblingTextNodes(node);
      });
    }

    sortByDepth(highlights, true);

    highlights.forEach((hl) => {
      if (self.options.onRemoveHighlight(hl) === true) {
        removeHighlight(hl);
      }
    });
  }

  /**
   * Returns highlights from given container.
   * @param params
   * @param {HTMLElement} [params.container] - return highlights from this element.
   * Default: the element the highlighter is applied to.
   * @param {boolean} [params.andSelf] - if set to true and container is a highlight itself,
   * add container to returned results. Default: true.
   * @param {boolean} [params.grouped] - if set to true,
   * highlights are grouped in logical groups of highlights added in the same moment.
   * Each group is an object which has got array of highlights, 'toString' method and 'timestamp'
   * property. Default: false.
   * @returns {Array} - array of highlights.
   */
  getHighlights(params) {
    params = defaults(params, {
      container: this.el,
      andSelf: true,
      grouped: false,
    });

    const nodeList = params.container.querySelectorAll(`[${DATA_ATTR}]`);
    let highlights = Array.prototype.slice.call(nodeList);

    if (params.andSelf === true && params.container.hasAttribute(DATA_ATTR)) {
      highlights.push(params.container);
    }

    if (params.grouped) {
      highlights = groupHighlights(highlights);
    }

    return highlights;
  }

  /**
   * Serializes all highlights in the element the highlighter is applied to.
   * @returns {string} - stringified JSON with highlights definition
   */
  serializeHighlights() {
    const highlights = this.getHighlights();
    const refEl = this.el;
    const hlDescriptors = [];

    function getElementPath(el, refElement) {
      const path = [];
      let childNodes;

      do {
        childNodes = Array.prototype.slice.call(el.parentNode.childNodes);
        path.unshift(childNodes.indexOf(el));
        el = el.parentNode;
      } while (el !== refElement || !el);

      return path;
    }

    sortByDepth(highlights, false);

    highlights.forEach((highlight) => {
      let offset = 0; // Hl offset from previous sibling within parent node.
      const { length } = highlight.textContent;
      const hlPath = getElementPath(highlight, refEl);
      let wrapper = highlight.cloneNode(true);

      wrapper.innerHTML = '';
      wrapper = wrapper.outerHTML;

      if (highlight.previousSibling && highlight.previousSibling.nodeType === NODE_TYPE.TEXT_NODE) {
        offset = highlight.previousSibling.length;
      }

      hlDescriptors.push([
        wrapper,
        highlight.textContent,
        hlPath.join(':'),
        offset,
        length,
      ]);
    });

    return JSON.stringify(hlDescriptors);
  }

  /**
   * Deserializes highlights.
   * @throws exception when can't parse JSON or JSON has invalid structure.
   * @param {object} json - JSON object with highlights definition.
   * @returns {Array} - array of deserialized highlights.
   */
  deserializeHighlights(json) {
    let hlDescriptors;
    const highlights = [];
    const self = this;

    if (!json) {
      return highlights;
    }

    try {
      hlDescriptors = JSON.parse(json);
    } catch (e) {
      throw new Error(`Can't parse JSON: ${e}`);
    }

    function deserializationFn(hlDescriptor) {
      const hl = {
        wrapper: hlDescriptor[0],
        text: hlDescriptor[1],
        path: hlDescriptor[2].split(':'),
        offset: hlDescriptor[3],
        length: hlDescriptor[4],
      };
      let elIndex = hl.path.pop();
      let node = self.el;
      let idx;

      // eslint-disable-next-line no-cond-assign
      while (idx = hl.path.shift()) {
        node = node.childNodes[idx];
      }

      if (node.childNodes[elIndex - 1]
          && node.childNodes[elIndex - 1].nodeType === NODE_TYPE.TEXT_NODE) {
        elIndex -= 1;
      }

      node = node.childNodes[elIndex];
      const hlNode = node.splitText(hl.offset);
      hlNode.splitText(hl.length);

      if (hlNode.nextSibling && !hlNode.nextSibling.nodeValue) {
        remove(hlNode.nextSibling);
      }

      if (hlNode.previousSibling && !hlNode.previousSibling.nodeValue) {
        remove(hlNode.previousSibling);
      }

      const highlight = wrap(hlNode, fromHTML(hl.wrapper)[0]);
      highlights.push(highlight);
    }

    hlDescriptors.forEach((hlDescriptor) => {
      try {
        deserializationFn(hlDescriptor);
      } catch (e) {
        if (console && console.warn) {
          console.warn(`Can't deserialize highlight descriptor. Cause: ${e}`);
        }
      }
    });

    return highlights;
  }

  /**
   * Finds and highlights given text.
   * @param {string} text - text to search for
   * @param {boolean} [caseSensitive] - if set to true,
   *  performs case sensitive search (default: true)
   */
  find(text, caseSensitive) {
    const wnd = getWindow(this.el);
    const { scrollX } = wnd;
    const { scrollY } = wnd;
    const caseSens = (typeof caseSensitive === 'undefined' ? true : caseSensitive);

    removeAllRanges(this.el);

    if (wnd.find) {
      while (wnd.find(text, caseSens)) {
        this.doHighlight(true);
      }
    } else if (wnd.document.body.createTextRange) {
      const textRange = wnd.document.body.createTextRange();
      textRange.moveToElementText(this.el);
      while (textRange.findText(text, 1, caseSens ? 4 : 0)) {
        if (!contains(this.el, textRange.parentElement())
            && textRange.parentElement() !== this.el) {
          break;
        }

        textRange.select();
        this.doHighlight(true);
        textRange.collapse(false);
      }
    }

    removeAllRanges(this.el);
    wnd.scrollTo(scrollX, scrollY);
  }
}

export default TextHighlighter;
