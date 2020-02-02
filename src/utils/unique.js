/**
 * Returns array without duplicated values.
 * @param {Array} arr
 * @returns {Array}
 */
export default function unique(arr) {
  return arr.filter((value, idx, self) => self.indexOf(value) === idx);
}
