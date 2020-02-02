/**
 * Removes class from element.
 * @param {Node|HTMLElement} [el] - base DOM element to manipulate
 * @param {string} className
 */
export default function (el, className) {
  if (el.classList) {
    el.classList.remove(className);
  } else {
    el.className = el.className.replace(
      new RegExp(`(^|\\b)${className}(\\b|$)`, 'gi'), ' ',
    );
  }
}
