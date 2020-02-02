/**
 * Adds class to element.
 * @param {Node|HTMLElement} [el] - base DOM element to manipulate
 * @param {string} className
 */

export default function (el, className) {
  if (el.classList) {
    el.classList.add(className);
  } else {
    el.className += ` ${className}`;
  }
}
