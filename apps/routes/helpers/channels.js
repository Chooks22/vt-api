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
function getQueries({ id = '', youtube, name, channel, fields = '', limit = 25, group = '' }) {
  const fieldsArray = fields.toLowerCase().split(/,(?<!\(.*)|,(?!.*\))/g);

  const nested = fieldsArray.filter(findNested);
  const normalFields = fieldsArray.filter(field => !nested.includes(field));
  const nestedFields = nested.map(processNested).flat();

  const project = [...normalFields, ...nestedFields].filter(validFields);

  /* eslint-disable indent,no-multi-spaces */
  const ids = parseIds(id.split(','));
  const search =
    ids.length  ? { 'id': { $in: ids } }      :
    youtube     ? { youtube }                 :
    name        ? { $or: getNames(re(name)) } :
    channel     ? { 'channel': re(channel) }  :
                  { }                         ;
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

function getNames(name) {
  return ['name_jp', 'name_en', 'name_kr', 'name_th']
    .map(lang => ({ [lang]: name }));
}

function processNested(field) {
  const nested = `${field.match(/(?<=\().*(?=\))/g)}`.split(',');
  const [root] = field.match(/.*(?=\()/g);

  return nested.map(item => `${root}.${item}`);
}

function parseIds(ids) {
  const ranges = ids.filter(getRanges);
  return ids
    .map(int => +int)
    .concat(ranges.map(parseIdRanges))
    .flat()
    .filter(val => val);
}

function getRanges(ids) {
  return /\d+-\d+/.test(ids);
}

function parseIdRanges(range) {
  // eslint-disable-next-line prefer-const
  let [start, end] = range.split('-');
  if (Math.max(end, start) > 150) return;

  const ids = [];
  while (start <= end) {
    ids.push(start++);
  }

  return ids;
}
