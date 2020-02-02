
/**
 * Fills undefined values in obj with default properties with the same name from source object.
 * @param {object} obj - target object
 * @param {object} source - source object with default values
 * @returns {object}
 */
export default function defaults(obj, source) {
  obj = obj || {};

  Object.keys(source).forEach((prop) => {
    obj[prop] = source[prop];
  });

  return obj;
}
