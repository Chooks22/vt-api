import { config } from 'dotenv';
config();

process.env.DEBUG += ',-db:*';
import { readdirSync, readFileSync } from 'fs';
import { createInterface } from 'readline';
import { MemberObject, MemberProps, PlatformId } from '../database/types/members';
import { Counter, debug, Members } from '../modules';
import { ChannelId } from '../modules/types/youtube';
import youtubeChannelScraper from './apps/scrapers/youtube-scraper';
import updateYoutube from './apps/updaters/youtube-updater';

if (!process.env.GOOGLE_API_KEY) throw new Error('GOOGLE_API_KEY is undefined!');
function main() {
  console.clear();
  console.log(
    '----------------------------   Manage Channels   ----------------------------\n' +
    ' Make sure you\'ve set up the .json files in channels/organizations directory.\n' +
    ' Check templates.json to see how to make custom channels, or move the files\n' +
    ' from the default directory to the organizations directory.\n' +
    '-----------------------------------------------------------------------------\n' +
    ' [1] Initialize (Run Everything)\n' +
    ' [2] Validate JSON Files\n' +
    ' [3] Save Channels\n' +
    ' [4] Update Channels\n' +
    ' [5] Scrape Channels\n' +
    ' [6] Drop Members and Channels Collection\n' +
    ' [7] Exit\n'
  );
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Selection: ', async input => {
    process.env.DEBUG = process.env.DEBUG.slice(0, -6);
    rl.close();
    switch (input) {
    default:
      return main();
    case '1':
      await init();
      break;
    case '2':
      validateChannels();
      break;
    case '3':
      await Promise.all(saveChannels({}, true));
      break;
    case '4':
      await updateChannels(true);
      break;
    case '5':
      await scrapeChannels();
      break;
    case '6':
      await dropCollections();
      break;
    case '7':
    }
    console.log('Press any key to continue: ');
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('data', process.exit.bind(process, 0));
  });
}

main();

const logger = debug('channels');
const ROOT_DIR = 'channels/organizations';

type ChannelPlatform<T> = {[key in PlatformId]: T[]};
type BasicChannelData = [ChannelId, string, PlatformId];

function saveChannel(filename: string, dry = false, save = true, async = false) {
  const groupName = filename.slice(0, -5);
  const channelList: MemberObject[] = JSON.parse(readFileSync(`${ROOT_DIR}/${filename}`, 'utf-8'));
  const parseChannel = (channel: MemberObject): any => { channel.organization = groupName; return channel; };
  const parsedChannels: MemberObject[] = channelList.map(parseChannel);
  if (dry) return parsedChannels;
  if (save) {
    const writeOp = Members
      .create(<any[]>parsedChannels)
      .then(() => logger.info(`${filename} OK`))
      .catch(() => logger.error(`${filename} EXISTS`));
    if (async) return writeOp;
  }
  return channelList.map((channel): BasicChannelData => [channel.channel_id, groupName, channel.platform_id]);
}

function checkChannels<T>(channelList: T[]): T[]|never {
  if (!channelList.length) {
    throw new Error('No channels found.');
  } else { return channelList; }
}

function saveChannels<T1 extends boolean, T2 extends boolean = false>(
  options: { dry?: T1; save?: boolean; } = { dry: <T1>false, save: true },
  async: T2 = <T2>false
): T2 extends true ? Promise<MemberProps[]>[] : T1 extends true ? MemberObject[] : BasicChannelData[] {
  return checkChannels(readdirSync(ROOT_DIR)
    .filter(file => file.endsWith('.json'))
    .flatMap((group): any => saveChannel(group, options.dry, options.save, async))
  ) as T2 extends true ? Promise<MemberProps[]>[] : T1 extends true ? MemberObject[] : BasicChannelData[];
}

function validateChannels() {
  const channels = saveChannels({ dry: true });
  if (!channels.length) {
    logger.error(new Error('No channel jsons found.'));
    return;
  }
  logger.info(`Found ${channels.length} channels.`);
  let errorCount = 0;
  for (let i = channels.length; i--;) {
    const err = new Members(channels[i]).validateSync();
    if (!err) continue;
    logger.error({ error: err.message, channel: channels[i] });
    errorCount++;
  }
  if (errorCount) {
    logger.info(`Failed to validate ${errorCount} channels.`);
  } else { logger.info('All channels validated successfully.'); }
}

async function scrapeChannels() {
  const channelList = await Members
    .find({ crawled_at: { $exists: false } })
    .then(groupMemberObject);
  if (!Object.values(channelList).flat().length) {
    logger.error(new Error('No saved members found.'));
    return;
  }
  const scraper = {
    RESULTS: { OK: [], FAIL: [], videoCount: 0 },
    async youtube(channels: MemberObject[]) {
      for (let i = channels.length; i--;) {
        const currentChannel = channels[i];
        const [STATUS, VIDEO_COUNT] = await youtubeChannelScraper(currentChannel);
        this.RESULTS[STATUS].push(currentChannel.channel_id);
        this.RESULTS.videoCount += VIDEO_COUNT;
      }
    },
    // async bilibili(channels: MemberObject[]) {
    // },
    // async twitchtv(channels: MemberObject[]) {
    // }
  };
  await Promise.all([
    scraper.youtube(channelList.yt),
    // scraper.bilibili(channelList.bb),
    // scraper.twitchtv(channelList.tt)
  ]);
  logger.info(scraper.RESULTS);
}

async function updateChannels(async = false) {
  const CHANNEL_PLATFORMS = await Members.find()
    .then(groupMemberObject) as ChannelPlatform<MemberProps>;
  await Promise.all([
    updateYoutube(CHANNEL_PLATFORMS.yt, async),
    // @TODO: Implement bb and ttv apis
    // updateBilibili(CHANNEL_PLATFORMS.bb),
    // updateTwitch(CHANNEL_PLATFORMS.tt)
  ]);
}

async function dropCollections() {
  const { connection } = await require('mongoose');
  logger.info('Dropping channel related collections...');
  await Promise.all([
    connection.dropCollection('members'),
    connection.dropCollection('channels'),
    Counter.deleteOne({ _id: 'member_id' })
  ]);
  logger.info('Dropped members and channels collection.');
}

function groupMemberObject(memberList: MemberObject[]): ChannelPlatform<MemberObject> {
  return memberList.reduce(
    (platforms, channel) => {
      platforms[channel.platform_id].push(channel);
      return platforms;
    }, { yt: [], bb: [], tt: [] }
  );
}

async function init() {
  validateChannels();
  await Promise.all(saveChannels({}, true));
  await updateChannels();
  await scrapeChannels();
}
