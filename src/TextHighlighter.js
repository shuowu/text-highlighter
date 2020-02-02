import {
  addClass,
  removeClass,
  getRange,
  removeAllRanges,
  contains,
  wrap,
  unwrap,
  remove,
  fromHTML,
  getWindow,
} from './dom';
import {
  defaults,
  refineRangeBoundaries,
  sortByDepth,
  groupHighlights,
  normalizeHighlights,
} from './utils';
import {
  TIMESTAMP_ATTR,
  NODE_TYPE,
  IGNORE_TAGS,
  DATA_ATTR,
  DEFAULT_HIGHLIGHT_COLOR,
  DEFAULT_HIGHLIGHT_CLASS,
  DEFAULT_HIGHLIGHT_CONTEXT_CLASS,
} from './constants';

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
   * @params {function} options.highlightHandler - function called when selection happen in
   *  defined DOM element
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
      bindEvents: true,
      color: DEFAULT_HIGHLIGHT_COLOR,
      highlightedClass: DEFAULT_HIGHLIGHT_CLASS,
      contextClass: DEFAULT_HIGHLIGHT_CONTEXT_CLASS,
      onRemoveHighlight() { return true; },
      onBeforeHighlight() { return true; },
      onAfterHighlight() { },
    });

    this.highlightHandler = this.options.highlightHandler || this.doHighlight.bind(this);

    addClass(this.el, this.options.contextClass);

    if (this.options.bindEvents) {
      this.bindEvents();
    }
  }

  bindEvents() {
    this.el.addEventListener('mouseup', this.highlightHandler);
    this.el.addEventListener('touchend', this.highlightHandler);
  }

  unbindEvents() {
    this.el.removeEventListener('mouseup', this.highlightHandler);
    this.el.removeEventListener('touchend', this.highlightHandler);
  }

  /**
   * Permanently disables highlighting.
   * Unbinds events and remove context element class.
   */
  destroy() {
    if (this.options.bindEvents) {
      this.unbindEvents();
    }
    removeClass(this.el, this.options.contextClass);
  }

  /**
   * Highlights current range.
   * @param {boolean} keepRange - Don't remove range after highlighting. Default: false.
   * @param {Range} range
   * @returns {number} - Hightlights' timestamp
   */
  doHighlight(range, keepRange) {
    range = range || getRange(this.el);
    let wrapper;
    let createdHighlights;
    let normalizedHighlights;
    let timestamp;

    if (!range || range.collapsed) {
      return 0;
    }

    if (this.options.onBeforeHighlight(range) === true) {
      timestamp = +new Date();
      wrapper = TextHighlighter.createWrapper(this.options);
      wrapper.setAttribute(TIMESTAMP_ATTR, timestamp);

      createdHighlights = this.highlightRange(range, wrapper);
      normalizedHighlights = normalizeHighlights(createdHighlights);

      this.options.onAfterHighlight(range, normalizedHighlights, timestamp);
    }

    if (!keepRange) {
      removeAllRanges(this.el);
    }

    return timestamp;
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
   * Update color of existing highlights.
   * @param {string} color - valid CSS color.
   * @param {string|number} timestamp - timestamp of existing highlights.
   */
  updateHighlightsColor(color, timestamp) {
    return this.getHighlightsByTimestamp(timestamp).map((node) => {
      node.style.backgroundColor = color;
      return node;
    });
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
   * Removes highlights by highlighted timestamp.
   * @param {string|number} [timestamp] - timestamp of highlights to be removed
   */
  removeHighlightsByTimestamp(
    timestamp,
    params,
  ) {
    return this.getHighlightsByTimestamp(timestamp, params)
      .map((node) => this.removeHighlights(node));
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
   * Return highlights by timestamps
   * @param {string|number} timestamp
   * @param {object} params - same as params in getHighlights
   * @returns {Array} - array of highlights.
   */
  getHighlightsByTimestamp(timestamp, params) {
    return this.getHighlights(params).filter((node) => +node.dataset.timestamp === +timestamp);
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
      while ((idx = hl.path.shift())) {
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
        this.doHighlight(undefined, true);
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
        this.doHighlight(undefined, true);
        textRange.collapse(false);
      }
    }

    removeAllRanges(this.el);
    wnd.scrollTo(scrollX, scrollY);
  }
}

export default TextHighlighter;
