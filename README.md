# VTuber API
A Mongoose / GraphQL based API to serve VTuber information from multiple platforms.

## Development
* Prerequisites:
  * Have `node` installed.
  * Have [MongoDB](https://docs.mongodb.com/manual/installation/) and [Memcached](https://www.howtoforge.com/how-to-install-memcached-on-ubuntu-2004-lts/) installed locally.
    * Optional: Download [MongoDB Compass](https://www.mongodb.com/try/download/compass) to access your database with a GUI.
  * Have a [Google Cloud Project](https://console.cloud.google.com/apis/credentials) API Key with Youtube API enabled.
  * Setup some channels first before starting.

## Installation
```
# Install dependencies and create your .env copy
$ npm i
$ cp .env.sample .env
# Make sure to adjust your .env file before continuing!

# Create a directory called organizations inside channels, then move the files from
# channels/default to channels/organizations, or check the template.json file to see how to create your own list.

# After populating channels/organizations, run:
$ npm run channel-manager
# OR
$ npm run init

# If all things went well, you can then start the api.
$ npm start
```

## GraphQL Schema

## Types
```ts
{
  VideoId: string
  ChannelId: string
  PlatformId: "yt"|"bb"|"tt"
  VideoStatus: "live"|"upcoming"|"ended"|"uploaded"|"missing"
}
```

## `VideoObject` Schema
```ts
{
  _id: VideoId!
  platform_id: PlatformId!
  channel_id: ChannelId!
  organization: string!
  title: string!
  time: {
    published: number
    scheduled: number
    start: number
    end: number
    duration: number
  }
  status: VideoStatus!
  viewers: number
}
```

## `ChannelObject` Schema
```ts
{
  _id: number!
  name: {
    en: string!
    jp: string
    kr: string
    cn: string
  }!
  organization: string!
  platform_id: PlatformId!
  channel_name: string
  channel_id: ChannelId!
  details: {
    [key: string]: any
  }
  channel_stats: {
    published_at: number
    views: number
    subscribers: number
    videos: number
  }
  description: string
  thumbnail: string
}
```

## Videos Resource
```
{
  items: [VideoObject]!
  next_page_token: String
}
```

## Channels Resource
```
{
  items: [ChannelObject]!
  next_page_token: String
}
```

## Live Query
```
{
  live(
    organizations: [String]
    platforms: [PlatformId]
    exclude_organizations: [String]
  ): [VideoObject]
}
```

## Videos Query
```
{
  videos(
    channel_id: [ChannelId]
    status: [VideoStatus]
    organization: [String]
    platforms: [PlatformId]
    max_upcoming_mins: Int
    order_by: {
      published: asc|desc
      scheduled: asc|desc
      start: asc|desc
    }
    next_page_token: String
    limit: Int // 1-50
  ): VideosResource!
}
```

## Channels Query
```
{
  channels(
    _id: [Int]
    name: String
    organizations: [String]
    platforms: [PlatformId]
    channel_id: [ChannelId]
    order_by: {
      _id: asc|desc
      published_at: asc|desc
      subscribers: asc|desc
    }
    next_page_token: String
    limit: Int // 1-50
  ): ChannelsResource!
}
```

##

## TO-DOs
* Implement twitch and bilibili apis
* Better documentation