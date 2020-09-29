import { config } from 'dotenv';
config({ path: '.env' });

import { mongo, logger, youtube } from '../modules';
const { channels } = mongo;

import path from 'path';
import fs from 'fs';

const channelsDir = path.resolve('channels');

console.clear();


export async function init() {
  if (!await this.save(1)) return;
  import('../apps/api').then(mod => mod.init());
}
export async function save(init) {
  // check directory
  if (!fs.existsSync(channelsDir)) {
    return logger.app('Error: You tried running this script locally!\nRun this script using "npm run save-channels"!');
  }

  if (init && !await youtube.validateKey()) {
    return logger.app('Error: Invalid Youtube API key!\nPlease configure your .env file first.');
  }

  // grab all json files in directory and save channels
  const writeOps = fs.readdirSync(channelsDir)
    .filter(file => file.endsWith('.json') && file !== 'template.json')
    .map(saveChannels);

  // wait for writes to finish before closing
  const results = await Promise.all(writeOps);

  logger.app('done! upserted %d channels.', countUpsertedChannels(results));

  return init
      || logger.app('run "npm run scrape-channels" to fetch all channels\' videos from youtube.')
      || process.exit();
}

function countUpsertedChannels(result) {
  return result.reduce((total, { nUpserted }) => total + nUpserted, 0);
}

async function saveChannels(file) {
  const [group] = file.split('.');
  const channelList = require(path.join(channelsDir, file));

  logger.app(await channels[group].drop()
    .then(() => `dropped ${group} collection.`)
    .catch(() => `couldn't drop ${group} collection. probably doesn't exist.`));
  const bulk = channels[group].initializeUnorderedBulkOp();

  channelList.forEach((channel, i) => {
    const _id = i + 1;
    bulk.find({ _id })
      .upsert()
      .replaceOne({ _id, ...channel });
  });

  return bulk.execute();
}
