require('dotenv').config({ 'path': '.env' });
const { mongo: { channels }, logger, youtube } = require('../modules');

const path = require('path');
const fs = require('fs');

const channelsDir = path.resolve('channels');

console.clear();

module.exports = {
  async init() {
    if (!await this.save(1)) return;
    require('../apps/api').init();
  },
  async save(init) {
    // check directory
    if (!fs.existsSync(channelsDir)) {
      return logger.app('Error: You tried running this script locally!\nRun this script using "npm run save-channels"!');
    }

    if (init && !await youtube.validateKey()) {
      return logger.app('Error: Invalid Youtube API key!\nPlease configure your .env file first.');
    }

    // grab all json files in directory and ignore template
    const channelsList = fs.readdirSync(channelsDir)
      .filter(file => file.endsWith('.json') && file !== 'template.json')
      .map(file => [
        file.split('.')[0],
        require(path.join(channelsDir, file))
          .map((data, i) => ({ '_id': i + 1, ...data }))
      ]);

    // write files to database
    const writeOps = channelsList.map(([group, channelList]) => {
      const bulk = channels[group].initializeUnorderedBulkOp();

      channelList.forEach(channel => bulk
        .find({ '_id': channel._id })
        .upsert()
        .replaceOne(channel)
      );

      return bulk;
    });

    // wait for writes to finish before closing
    const results = await Promise.all(writeOps.map(ops => ops.execute()));

    logger.app('done! upserted %d channels.', countUpsertedChannels(results));

    return init
    || logger.app('run "npm run scrape-channels" to fetch all channels\' videos from youtube.')
    || process.exit();
  }
};

function countUpsertedChannels(result) {
  return result.reduce((total, { nUpserted }) => total + nUpserted, 0);
}
