const { sanitizeRegex, toProjectionField, defaults } = require('../consts');
module.exports = { getQueries };

/**
 * Parses `req.query` fields for videos endpoint.
 *
 * @param   {Object}  req.query     - The client's query
 *
 * @typedef {Object}  Parsed-queries
 *
 * @returns {object}  'query'       - The field to search
 * @returns {object}  'projection'  - The fields to show
 * @returns {number}  'limit'       - Amount of videos to return (Max 100)
 */
function getQueries({ status = '', title = '', fields = '', limit = 50, group = '' }) {
  const project = fields.toLowerCase().split(',').filter(validFields);

  return {
    'query': {
      'group': group || /.*/,
      'status': status || { $exists: 1 },
      'title': sanitizeRegex(title),
    },
    'projection': project.length
      ? Object.assign({}, ...project.map(toProjectionField))
      : defaults.video.hiddenFields,
    'limit': Math.min(+limit, 100)
  };
}

function validFields(field) {
  return defaults.video.projectFields.includes(field);
}
