/**
 * Returns element background color.
 * @param {Node|HTMLElement} [el] - base DOM element to manipulate
 * @returns {CSSStyleDeclaration.backgroundColor}
 */
export default function (el) {
  return el.style.backgroundColor;
}
