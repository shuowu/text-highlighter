
/**
 * Fills undefined values in obj with default properties with the same name from source object.
 * @param {object} obj - target object
 * @param {object} source - source object with default values
 * @returns {object}
 */
export default function (obj, source) {
  obj = obj || {};

  // eslint-disable-next-line no-restricted-syntax
  for (const prop in source) {
    // eslint-disable-next-line no-prototype-builtins
    if (source.hasOwnProperty(prop) && obj[prop] === undefined) {
      obj[prop] = source[prop];
    }
  }

  return obj;
}
