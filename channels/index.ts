import { config } from 'dotenv';
config();

if (!process.env.GOOGLE_API_KEY) throw new Error('GOOGLE_API_KEY is undefined!');

import { readdirSync, readFileSync } from 'fs';
import { MemberObject, PlatformId } from '../database/types/members';
import { Members } from '../modules';
import { ChannelId } from '../modules/types/youtube';
import scrapeChannel from './scrapers/youtube-channel-scraper';

const ROOT_DIR = 'channels/organizations';

function saveChannel(filename: string, dry = false, save = true): [ChannelId, string, PlatformId][] {
  const groupName = filename.slice(0, -5);
  const channelList: MemberObject[] = JSON.parse(readFileSync(`${ROOT_DIR}/${filename}`, 'utf-8'));
  const parseChannel = (channel: MemberObject): any => { channel.organization = groupName; return channel; };
  const parsedChannels = channelList.map(parseChannel);
  if (dry) return parsedChannels;
  if (save) Members.create(parsedChannels);
  return channelList.map(channel => [channel.channel_id, groupName, channel.platform_id]);
}

function checkChannels<T>(channelList: T[]): T[]|never {
  if (!channelList.length) {
    throw new Error('No channels found.');
  } else { return channelList; }
}

interface saveOptions { dry?: boolean; save?: boolean; }
export const saveChannels = (options: saveOptions = { dry: false, save: true }) => checkChannels(
  readdirSync(`${ROOT_DIR}`)
    .filter(file => file.endsWith('.json'))
    .flatMap(groups => saveChannel(groups, options.dry, options.save))
);

export const validateChannels = () => {
  const channels = saveChannels({ dry: true });
  let errors = 0;
  for (let i = channels.length; i--;) {
    const err = new Members(channels[i]).validateSync();
    if (!err) continue;
    console.log({ error: err.message, channel: channels[i] });
    errors++;
  }
  if (errors) {
    console.info(`Failed to validate ${errors} channels.`);
  } else { console.info('All channels validated successfully.'); }
};

export async function scrapeChannels(channelList?: [ChannelId, string, PlatformId][]) {
  const channelIds = channelList ?? await Members.find({ crawled_at: { $exists: false } })
    .then(channels => channels.map(channel => [channel.channel_id, channel.organization, channel.platform_id]));
  const RESULTS = { OK: <ChannelId[]>[], FAIL: <ChannelId[]>[], videoCount: 0 };
  for (let i = channelIds.length; i--;) {
    const [currentChannel, organization, platform] = channelIds[i];
    switch (platform) {
    case 'yt': {
      const [status, videoCount] = await scrapeChannel(currentChannel, organization);
      RESULTS[status].push(currentChannel);
      RESULTS.videoCount += videoCount;
    } break;
    case 'bb': {
    } break;
    case 'tt':
    }
  }
  console.log(`Finished scraping ${channelIds.length}.`);
  console.log(`Failed to scrape ${RESULTS.FAIL.length} channels, and got a total of ${RESULTS.videoCount.toLocaleString()} new videos.`);
}

export default async function init() {
  const channelIds = saveChannels({ save: false });
  scrapeChannels(channelIds);
}
