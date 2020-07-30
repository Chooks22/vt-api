const { defaults, toProjectionField, sanitizeRegex: re } = require('../consts');
module.exports = { getQueries };

/**
 * Parses `req.query` fields for channels endpoint.
 *
 * @param   {Object}  req.query     - The client's query
 *
 * @typedef {Object}  Parsed-queries
 *
 * @returns {object}  'query'       - The field to search
 * @returns {object}  'projection'  - The fields to show
 * @returns {number}  'limit'       - Amount of channels to return (Max 150)
 */
function getQueries({ id, youtube, name, channel, fields = '', limit = 25, group = '' }) {
  const fieldsArray = fields.toLowerCase().split(/,(?<!\(.*)|,(?!.*\))/g);

  const nested = fieldsArray.filter(findNested);
  const normalFields = fieldsArray.filter(field => !nested.includes(field));
  const nestedFields = nested.map(processNested).flat();

  const project = [...normalFields, ...nestedFields].filter(validFields);

  /* eslint-disable indent,no-multi-spaces */
  const search =
    !isNaN(id) ? { 'id': +id } :
    youtube    ? { youtube }   :
    name       ? { $or: [{ 'name_jp': re(name) }, { 'name_en': re(name) }] } :
    channel    ? { 'channel': re(channel) }
               : { }           ;
  /* eslint-enable indent,no-multi-spaces */

  return {
    'query': { 'from': group || /.*/, ...search },
    'projection': project.length
      ? Object.assign({ '_id': 0 }, ...project.map(toProjectionField))
      : defaults.channel.hiddenFields,
    'limit': Math.min(+limit, 150)
  };
}

function validFields(field) {
  return defaults.channel.projectFields.includes(field);
}

function findNested(field) {
  return /\(.*\)/.test(field);
}

function processNested(field) {
  const nested = `${field.match(/(?<=\().*(?=\))/g)}`.split(',');
  const [root] = field.match(/.*(?=\()/g);

  return nested.map(item => `${root}.${item}`);
}
