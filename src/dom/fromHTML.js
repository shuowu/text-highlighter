/**
 * Creates dom element from given html string.
 * @param {string} html
 * @returns {NodeList}
 */
export default function (html) {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.childNodes;
}
