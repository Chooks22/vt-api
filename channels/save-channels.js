const { mongo: { channels } } = require('../modules');

const path = require('path');
const fs = require('fs');

const channelsDir = path.resolve('channels');

console.clear();
async function main() {
  // check directory
  if (!fs.existsSync(channelsDir)) {
    return console.error('Error: You tried running this script locally!\nRun this script using "npm run save-channels"!');
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

    channelList.map(channel => bulk
      .find({ '_id': channel._id })
      .upsert()
      .replaceOne(channel)
    );

    return bulk;
  });

  // wait for writes to finish before closing
  const results = await Promise.all(writeOps.map(ops => ops.execute()));

  console.log(`done! upserted ${countUpsertedChannels(results)} channels.\nrun "npm run init" to fetch initial channel and video data from youtube.`);
  process.exit();
}

function countUpsertedChannels(result) {
  return result.reduce((total, { nUpserted }) => total + nUpserted, 0);
}

main();
