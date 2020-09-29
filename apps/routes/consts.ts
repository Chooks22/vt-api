const { Router } = require('express');
const { logger, memcache, mongo } = require('../../modules');
const TWO_HOURS = 72e5;

const templates = {
  videoFields(item) {
    return {
      'id': item._id,
      'title': item.title,
      'channel': item.channel,
      'group': item.group,
      'published_at': item.published_at,
      'scheduled_time': item.scheduled_time,
      'start_time': item.start_time,
      'end_time': item.end_time,
      'length': item.length,
      'viewers': item.viewers,
      'status': item.status
    };
  },
  channelFields(item) {
    const { channel_stats } = item;
    return {
      'id': item.id,
      'name_jp': item.name_jp,
      'name_en': item.name_en,
      'name_kr': item.name_kr,
      'name_th': item.name_th,
      'youtube': item.youtube,
      'twitter': item.twitter,
      'branch': item.branch,
      'group': item.group,
      'updated_at': item.updated_at,
      'channel': item.channel,
      'channel_stats': channel_stats && {
        'published_at': channel_stats.published_at,
        'views': channel_stats.views,
        'subscribers': channel_stats.subscribers,
        'videos': channel_stats.videos,
      },
      'description': item.description,
      'thumbnail': item.thumbnail
    };
  }
};

const defaults = {
  live: {
    validStatus: [
      'live',
      'upcoming',
      'ended'
    ],
    dbQueries(now) {
      return {
        'live': {
          'status': 'live'
        },
        'upcoming': {
          'status': 'upcoming'
        },
        'ended': {
          'status': 'ended',
          'end_time': { $gte: now - TWO_HOURS }
        }
      };
    }
  },
  channel: {
    projectFields: [
      'id',
      'name_jp',
      'name_en',
      'name_kr',
      'name_th',
      'youtube',
      'twitter',
      'branch',
      'group',
      'channel',
      'channel_stats',
      'description',
      'thumbnail'
    ],
    hiddenFields: {
      '_id': 0,
      'from': 0,
      'updated_at': 0
    }
  },
  video: {
    projectFields: [
      'title',
      'channel',
      'published_at',
      'scheduled_time',
      'start_time',
      'end_time',
      'length',
      'status',
    ],
    hiddenFields: {
      'viewers': 0,
      'updated_at': 0
    }
  }
};

addNested({
  root: 'channel_stats',
  fields: [
    'published_at',
    'views',
    'subscribers',
    'videos'
  ],
  array: defaults.channel.projectFields
});

module.exports = {
  ...mongo,
  defaults,
  memcache,
  logger,
  Router,
  send404,
  templates,
  sanitizeRegex,
  toProjectionField,
  asyncWrapper
};

function addNested({ root, fields, array }) {
  fields.map(field => array.push(`${root}.${field}`));
}

function send404(res, error = 'Not found.') {
  return res.status(404).json({ error });
}

function sanitizeRegex(string = '') {
  return RegExp(string.replace(/[#-.]|[[-^]|[?|{}]/g, '\\$&'), 'gi');
}

function toProjectionField(field) {
  return { [field]: 1 };
}

function asyncWrapper(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
