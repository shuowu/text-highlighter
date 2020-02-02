/**
 * Wraps base element in wrapper element.
 * @param {Node|HTMLElement} [el] - base DOM element to manipulate
 * @param {HTMLElement} wrapper
 * @returns {HTMLElement} wrapper element
 */
export default function (el, wrapper) {
  if (el.parentNode) {
    el.parentNode.insertBefore(wrapper, el);
  }

  wrapper.appendChild(el);
  return wrapper;
}
