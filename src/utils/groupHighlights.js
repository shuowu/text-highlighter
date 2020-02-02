import { TIMESTAMP_ATTR } from '../constants';

/**
 * Groups given highlights by timestamp.
 * @param {Array} highlights
 * @returns {Array} Grouped highlights.
 */
export default function groupHighlights(highlights) {
  const order = [];
  const chunks = {};
  const grouped = [];

  highlights.forEach((hl) => {
    const timestamp = hl.getAttribute(TIMESTAMP_ATTR);

    if (typeof chunks[timestamp] === 'undefined') {
      chunks[timestamp] = [];
      order.push(timestamp);
    }

    chunks[timestamp].push(hl);
  });

  order.forEach((timestamp) => {
    const group = chunks[timestamp];

    grouped.push({
      chunks: group,
      timestamp,
      toString() {
        return group.map((h) => h.textContent).join('');
      },
    });
  });

  return grouped;
}
