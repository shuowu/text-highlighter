var TextHighlighter = (function () {
  'use strict';

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  /**
   * Adds class to element.
   * @param {Node|HTMLElement} [el] - base DOM element to manipulate
   * @param {string} className
   */
  function addClass (el, className) {
    if (el.classList) {
      el.classList.add(className);
    } else {
      el.className += " ".concat(className);
    }
  }

  /**
   * Appends child nodes to base element.
   * @param {Node|HTMLElement} [el] - base DOM element to manipulate
   * @param {Node[]} nodesToAppend
   */
  function append (el, nodesToAppend) {
    var nodes = Array.prototype.slice.call(nodesToAppend);

    for (var i = 0, len = nodes.length; i < len; ++i) {
      el.appendChild(nodes[i]);
    }
  }

  /**
   * Returns element background color.
   * @param {Node|HTMLElement} [el] - base DOM element to manipulate
   * @returns {CSSStyleDeclaration.backgroundColor}
   */
  function color (el) {
    return el.style.backgroundColor;
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
    var div = document.createElement('div');
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
    var selection = getSelection$1(el);
    var range;

    if (selection.rangeCount > 0) {
      range = selection.getRangeAt(0);
    }

    return range;
  }

  /**
   * Inserts base element after refEl.
   * @param {Node|HTMLElement} [el] - base DOM element to manipulate
   * @param {Node} refEl - node after which base element will be inserted
   * @returns {Node} - inserted element
   */
  function insertAfter (el, refEl) {
    return refEl.parentNode.insertBefore(el, refEl.nextSibling);
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

  var NODE_TYPE = {
    ELEMENT_NODE: 1,
    TEXT_NODE: 3
  };
  /**
   * Attribute added by default to every highlight.
   * @type {string}
   */

  var DATA_ATTR = 'data-highlighted';
  /**
   * Attribute used to group highlight wrappers.
   * @type {string}
   */

  var TIMESTAMP_ATTR = 'data-timestamp';
  /**
   * Don't highlight content of these tags.
   * @type {string[]}
   */

  var IGNORE_TAGS = ['SCRIPT', 'STYLE', 'SELECT', 'OPTION', 'BUTTON', 'OBJECT', 'APPLET', 'VIDEO', 'AUDIO', 'CANVAS', 'EMBED', 'PARAM', 'METER', 'PROGRESS'];

  var TEXT_NODE = NODE_TYPE.TEXT_NODE;
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

  /**
   * Returns array of base element parents.
   * @param {Node|HTMLElement} [el] - base DOM element to manipulate
   * @returns {HTMLElement[]}
   */
  function parents (el) {
    var parent;
    var path = [];

    while (el.parentNode) {
      parent = el.parentNode;
      path.push(parent);
      el = parent;
    }

    return path;
  }

  /**
   * Prepends child nodes to base element.
   * @param {Node|HTMLElement} [el] - base DOM element to manipulate
   * @param {Node[]} nodesToPrepend
   */
  function prepend (el, nodesToPrepend) {
    var nodes = Array.prototype.slice.call(nodesToPrepend);
    var i = nodes.length;

    while (i--) {
      el.insertBefore(nodes[i], el.firstChild);
    }
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
    var selection = getSelection(el);
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
      el.className = el.className.replace(new RegExp("(^|\\b)".concat(className, "(\\b|$)"), 'gi'), ' ');
    }
  }

  /**
   * Unwraps base element.
   * @param {Node|HTMLElement} [el] - base DOM element to manipulate
   * @returns {Node[]} - child nodes of unwrapped element.
   */

  function unwrap (el) {
    var nodes = Array.prototype.slice.call(el.childNodes);
    var wrapper;
    nodes.forEach(function (node) {
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
    Object.keys(source).forEach(function (prop) {
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
    arr.sort(function (a, b) {
      return parents(descending ? b : a).length - parents(descending ? a : b).length;
    });
  }

  /**
   * Returns true if element is a highlight.
   * All highlights have 'data-highlighted' attribute.
   * @param el - element to check.
   * @returns {boolean}
   */

  function isHighlight(el) {
    return el && el.nodeType === NODE_TYPE.ELEMENT_NODE && el.hasAttribute(DATA_ATTR);
  }

  /**
   * Returns true if elements a i b have the same color.
   * @param {Node} a
   * @param {Node} b
   * @returns {boolean}
   */

  function haveSameColor(a, b) {
    return color(a) === color(b);
  }

  /**
   * Flattens highlights structure.
   * Note: this method changes input highlights -
   * their order and number after calling this method may change.
   * @param {Array} highlights - highlights to flatten.
   */

  function flattenNestedHighlights (highlights) {
    var again;
    sortByDepth(highlights, true);

    function flattenOnce() {
      var shouldAgain = false;
      highlights.forEach(function (hl, i) {
        var parent = hl.parentElement;
        var parentPrev = parent.previousSibling;
        var parentNext = parent.nextSibling;

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

  /**
   * Groups given highlights by timestamp.
   * @param {Array} highlights
   * @returns {Array} Grouped highlights.
   */

  function groupHighlights(highlights) {
    var order = [];
    var chunks = {};
    var grouped = [];
    highlights.forEach(function (hl) {
      var timestamp = hl.getAttribute(TIMESTAMP_ATTR);

      if (typeof chunks[timestamp] === 'undefined') {
        chunks[timestamp] = [];
        order.push(timestamp);
      }

      chunks[timestamp].push(hl);
    });
    order.forEach(function (timestamp) {
      var group = chunks[timestamp];
      grouped.push({
        chunks: group,
        timestamp: timestamp,
        toString: function toString() {
          return group.map(function (h) {
            return h.textContent;
          }).join('');
        }
      });
    });
    return grouped;
  }

  /**
   * Merges sibling highlights and normalizes descendant text nodes.
   * Note: this method changes input highlights -
   * their order and number after calling this method may change.
   * @param highlights
   */

  function mergeSiblingHighlights (highlights) {
    function shouldMerge(current, node) {
      return node && node.nodeType === NODE_TYPE.ELEMENT_NODE && haveSameColor(current, node) && isHighlight(node);
    }

    highlights.forEach(function (highlight) {
      var prev = highlight.previousSibling;
      var next = highlight.nextSibling;

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

  /**
   * Returns array without duplicated values.
   * @param {Array} arr
   * @returns {Array}
   */
  function unique(arr) {
    return arr.filter(function (value, idx, self) {
      return self.indexOf(value) === idx;
    });
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

  function normalizeHighlights (highlights) {
    var normalizedHighlights;
    flattenNestedHighlights(highlights);
    mergeSiblingHighlights(highlights); // omit removed nodes

    normalizedHighlights = highlights.filter(function (hl) {
      return hl.parentElement ? hl : null;
    });
    normalizedHighlights = unique(normalizedHighlights);
    normalizedHighlights.sort(function (a, b) {
      return a.offsetTop - b.offsetTop || a.offsetLeft - b.offsetLeft;
    });
    return normalizedHighlights;
  }

  var TEXT_NODE$1 = NODE_TYPE.TEXT_NODE;
  /**
   * Takes range object as parameter and refines it boundaries
   * @param range
   * @returns {object} refined boundaries and initial state of highlighting algorithm.
   */

  function refineRangeBoundaries(range) {
    var startContainer = range.startContainer;
    var endContainer = range.endContainer;
    var ancestor = range.commonAncestorContainer;
    var goDeeper = true;

    if (range.endOffset === 0) {
      while (!endContainer.previousSibling && endContainer.parentNode !== ancestor) {
        endContainer = endContainer.parentNode;
      }

      endContainer = endContainer.previousSibling;
    } else if (endContainer.nodeType === TEXT_NODE$1) {
      if (range.endOffset < endContainer.nodeValue.length) {
        endContainer.splitText(range.endOffset);
      }
    } else if (range.endOffset > 0) {
      endContainer = endContainer.childNodes.item(range.endOffset - 1);
    }

    if (startContainer.nodeType === TEXT_NODE$1) {
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
      startContainer: startContainer,
      endContainer: endContainer,
      goDeeper: goDeeper
    };
  }

  function unbindEvents(el, scope) {
    el.removeEventListener('mouseup', scope.highlightHandler.bind(scope));
    el.removeEventListener('touchend', scope.highlightHandler.bind(scope));
  }

  var TextHighlighter =
  /*#__PURE__*/
  function () {
    _createClass(TextHighlighter, null, [{
      key: "createWrapper",

      /**
       * Creates wrapper for highlights.
       * TextHighlighter instance calls this method each time
       * it needs to create highlights and pass options retrieved
       * in constructor.
       * @param {object} options - the same object as in TextHighlighter constructor.
       * @returns {HTMLElement}
       * @static
       */
      value: function createWrapper(options) {
        var span = document.createElement('span');
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

    }]);

    function TextHighlighter(element, options) {
      _classCallCheck(this, TextHighlighter);

      if (!element) {
        throw new Error('Missing anchor element');
      }

      this.el = element;
      this.options = defaults(options, {
        color: '#ffff7b',
        highlightedClass: 'highlighted',
        contextClass: 'highlighter-context',
        onRemoveHighlight: function onRemoveHighlight() {
          return true;
        },
        onBeforeHighlight: function onBeforeHighlight() {
          return true;
        },
        onAfterHighlight: function onAfterHighlight() {}
      });
      addClass(this.el, this.options.contextClass);
      bindEvents(this.el, this);
    }
    /**
     * Permanently disables highlighting.
     * Unbinds events and remove context element class.
     */


    _createClass(TextHighlighter, [{
      key: "destroy",
      value: function destroy() {
        unbindEvents(this.el, this);
        removeClass(this.el, this.options.contextClass);
      }
    }, {
      key: "highlightHandler",
      value: function highlightHandler() {
        this.doHighlight();
      }
      /**
       * Highlights current range.
       * @param {boolean} keepRange - Don't remove range after highlighting. Default: false.
       */

    }, {
      key: "doHighlight",
      value: function doHighlight(keepRange) {
        var range = getRange(this.el);
        var wrapper;
        var createdHighlights;
        var normalizedHighlights;
        var timestamp;

        if (!range || range.collapsed) {
          return;
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
      }
      /**
       * Highlights range.
       * Wraps text of given range object in wrapper element.
       * @param {Range} range
       * @param {HTMLElement} wrapper
       * @returns {Array} - array of created highlights.
       */

    }, {
      key: "highlightRange",
      value: function highlightRange(range, wrapper) {
        if (!range || range.collapsed) {
          return [];
        }

        var result = refineRangeBoundaries(range);
        var startContainer = result.startContainer;
        var endContainer = result.endContainer;
        var goDeeper = result.goDeeper;
        var done = false;
        var node = startContainer;
        var highlights = [];
        var highlight;
        var wrapperClone;
        var nodeParent;

        do {
          if (goDeeper && node.nodeType === NODE_TYPE.TEXT_NODE) {
            if (IGNORE_TAGS.indexOf(node.parentNode.tagName) === -1 && node.nodeValue.trim() !== '') {
              wrapperClone = wrapper.cloneNode(true);
              wrapperClone.setAttribute(DATA_ATTR, true);
              nodeParent = node.parentNode; // highlight if a node is inside the el

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

    }, {
      key: "setColor",
      value: function setColor(color) {
        this.options.color = color;
      }
      /**
       * Returns highlighting color.
       * @returns {string}
       */

    }, {
      key: "getColor",
      value: function getColor() {
        return this.options.color;
      }
      /**
       * Removes highlights from element. If element is a highlight itself, it is removed as well.
       * If no element is given, all highlights all removed.
       * @param {HTMLElement} [element] - element to remove highlights from
       */

    }, {
      key: "removeHighlights",
      value: function removeHighlights(element) {
        var container = element || this.el;
        var highlights = this.getHighlights({
          container: container
        });
        var self = this;

        function mergeSiblingTextNodes(textNode) {
          var prev = textNode.previousSibling;
          var next = textNode.nextSibling;

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
          var textNodes = unwrap(highlight);
          textNodes.forEach(function (node) {
            mergeSiblingTextNodes(node);
          });
        }

        sortByDepth(highlights, true);
        highlights.forEach(function (hl) {
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

    }, {
      key: "getHighlights",
      value: function getHighlights(params) {
        params = defaults(params, {
          container: this.el,
          andSelf: true,
          grouped: false
        });
        var nodeList = params.container.querySelectorAll("[".concat(DATA_ATTR, "]"));
        var highlights = Array.prototype.slice.call(nodeList);

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

    }, {
      key: "serializeHighlights",
      value: function serializeHighlights() {
        var highlights = this.getHighlights();
        var refEl = this.el;
        var hlDescriptors = [];

        function getElementPath(el, refElement) {
          var path = [];
          var childNodes;

          do {
            childNodes = Array.prototype.slice.call(el.parentNode.childNodes);
            path.unshift(childNodes.indexOf(el));
            el = el.parentNode;
          } while (el !== refElement || !el);

          return path;
        }

        sortByDepth(highlights, false);
        highlights.forEach(function (highlight) {
          var offset = 0; // Hl offset from previous sibling within parent node.

          var length = highlight.textContent.length;
          var hlPath = getElementPath(highlight, refEl);
          var wrapper = highlight.cloneNode(true);
          wrapper.innerHTML = '';
          wrapper = wrapper.outerHTML;

          if (highlight.previousSibling && highlight.previousSibling.nodeType === NODE_TYPE.TEXT_NODE) {
            offset = highlight.previousSibling.length;
          }

          hlDescriptors.push([wrapper, highlight.textContent, hlPath.join(':'), offset, length]);
        });
        return JSON.stringify(hlDescriptors);
      }
      /**
       * Deserializes highlights.
       * @throws exception when can't parse JSON or JSON has invalid structure.
       * @param {object} json - JSON object with highlights definition.
       * @returns {Array} - array of deserialized highlights.
       */

    }, {
      key: "deserializeHighlights",
      value: function deserializeHighlights(json) {
        var hlDescriptors;
        var highlights = [];
        var self = this;

        if (!json) {
          return highlights;
        }

        try {
          hlDescriptors = JSON.parse(json);
        } catch (e) {
          throw new Error("Can't parse JSON: ".concat(e));
        }

        function deserializationFn(hlDescriptor) {
          var hl = {
            wrapper: hlDescriptor[0],
            text: hlDescriptor[1],
            path: hlDescriptor[2].split(':'),
            offset: hlDescriptor[3],
            length: hlDescriptor[4]
          };
          var elIndex = hl.path.pop();
          var node = self.el;
          var idx; // eslint-disable-next-line no-cond-assign

          while (idx = hl.path.shift()) {
            node = node.childNodes[idx];
          }

          if (node.childNodes[elIndex - 1] && node.childNodes[elIndex - 1].nodeType === NODE_TYPE.TEXT_NODE) {
            elIndex -= 1;
          }

          node = node.childNodes[elIndex];
          var hlNode = node.splitText(hl.offset);
          hlNode.splitText(hl.length);

          if (hlNode.nextSibling && !hlNode.nextSibling.nodeValue) {
            remove(hlNode.nextSibling);
          }

          if (hlNode.previousSibling && !hlNode.previousSibling.nodeValue) {
            remove(hlNode.previousSibling);
          }

          var highlight = wrap(hlNode, fromHTML(hl.wrapper)[0]);
          highlights.push(highlight);
        }

        hlDescriptors.forEach(function (hlDescriptor) {
          try {
            deserializationFn(hlDescriptor);
          } catch (e) {
            if (console && console.warn) {
              console.warn("Can't deserialize highlight descriptor. Cause: ".concat(e));
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

    }, {
      key: "find",
      value: function find(text, caseSensitive) {
        var wnd = getWindow(this.el);
        var scrollX = wnd.scrollX;
        var scrollY = wnd.scrollY;
        var caseSens = typeof caseSensitive === 'undefined' ? true : caseSensitive;
        removeAllRanges(this.el);

        if (wnd.find) {
          while (wnd.find(text, caseSens)) {
            this.doHighlight(true);
          }
        } else if (wnd.document.body.createTextRange) {
          var textRange = wnd.document.body.createTextRange();
          textRange.moveToElementText(this.el);

          while (textRange.findText(text, 1, caseSens ? 4 : 0)) {
            if (!contains(this.el, textRange.parentElement()) && textRange.parentElement() !== this.el) {
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
    }]);

    return TextHighlighter;
  }();

  return TextHighlighter;

}());
//# sourceMappingURL=bundle.js.map
