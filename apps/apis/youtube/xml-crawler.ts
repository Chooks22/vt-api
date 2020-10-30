import { config } from 'dotenv';
config();

import fetch from 'node-fetch';
import schedule from 'node-schedule';
import { parseString } from 'xml2js';
import { Channels, debug, memcache } from '../../../modules';
import { ChannelId } from '../../../modules/types/youtube';
import database from '../../database-managers/youtube';
import { VideoXmlEntry, YoutubeVideoObject } from './types';

const channel = 'UC5CwaMl1eIgY8h02uZw7u8A';
const getXmlLink = (channelId: ChannelId) => `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}&t=${Date.now()}`;
const fetchXml = (channelId: ChannelId) => fetch(getXmlLink(channelId)).then(res => res.text());

function parseXml(xml: string): Promise<VideoObject[]> {
  return new Promise((res, rej) => {
    parseString(xml, { explicitArray: false }, (err, result) => {
      if (err) rej (err);
      res(result?.feed?.entry?.map(parseEntries));
    });
  });
}

const parseEntries = (entry: VideoEntry) => ({
  videoId: entry['yt:videoId'],
  channel: entry['yt:channelId'],
  title: entry.title,
  timestamp: +new Date(entry.published)
});

fetchXml(channel)
  .then(xml => parseXml(xml))
  .then(async data => {
    if (!data) return console.error(`feed from channel ${channel} returned empty?`);
    const latestTimestamp = (await memcache.get(`yt-${channel}`)) ?? 0;
    const newVideos = data
      .filter(item => item.timestamp > latestTimestamp)
      .sort((item1, item2) => item2.timestamp - item1.timestamp);
    if (!newVideos.length) return;
    memcache.set(`yt-${channel}`, newVideos[0].timestamp, 900);
    console.log(newVideos);
  })
  .catch(error => console.error(error));
