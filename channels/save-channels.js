const { mongo: { channels } } = require('../modules');

const path = require('path');
const fs = require('fs');

const channelsDir = path.resolve('channels');

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
  const writeOps = channelsList.map(([group, channelList]) =>
    channels[group].insert(channelList)
  );

  // wait for writes to finish before closing
  await Promise.all(writeOps);

  console.log('done! you can now start the api using "npm start" and begin crawling videos.');
  process.exit();
}

main();
