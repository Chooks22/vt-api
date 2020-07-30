# VTuber API

## Development
* Prerequisites
  * Have `node` installed.
  * Have `MongoDB` and `Memcached` installed locally.
  * Have a [Google Cloud Project](https://console.cloud.google.com/apis/credentials) API Key with the Youtube API enabled.
  * Setup some channels first before starting.


* Installation
```
# Install MongoDB and Memcached
$ sudo apt install mongodb-server-core memcached

# You'll have to run mongod and memcached in the background before starting.
$ mongod
$ memcached

# Assuming you've already cloned the repository and is in the same directory

# This will install node modules and create your `.env` copy
$ npm i
$ cp .env.sample .env

# Check the template.json file inside the channels folder first!
# Make sure you've set the channels you want to target, then run:
$ npm run save-channels

# Make sure to adjust your .env file first before running!
$ npm start
```

## API Basics
### Queries
* `string[]` are strings split with `,`.
  * Example: `status=live,upcoming`
* Add parameters by fetching the endpoint using any module.
  * Example using `axios`:
```js
const axios = require('axios');
const parameters = { status: 'live,upcoming', title: 'apex' };

axios.get('http://localhost:2434/live', { params: parameters }).then(res => console.log(res.data));
```
* Access nested `fields` query with `.` or `()`.
  * Example:
```js
const singleFields = { id: 1, fields: 'id,channel_stats.views,channel_stats.subscribers' };
const multipleFields = { id: 1, fields: 'id,channel_stats(views,subscribers)' };
const eitherFields = { id: 1, fields: 'id,channel_stats(views),channel_stats.subscribers' }

/**
* Any of these queries will return:
* [  
*   {
*     id: 1,
*     channel_stats: {
*       views: number,  
*       subscribers: number
*     }
*   }
* ]
```

### Endpoints
#### `/live`
Displays live, upcoming, and ended videos.
###### Query parameters:
```json
{
  "status": string[],
  "title": string,
  "group": string 
}
```
###### Returns:
```json
{
  "live": object[],
  "upcoming": object[],
  "ended": object[]
}
```

#### `/channels`
Shows a list of all channels (Max 150).
###### Query parameters:
```json
{
  "id": number,
  "name": string,
  "youtube": string,
  "channel": string,
  "fields": string[],
  "limit": number
}
```
###### Returns:
```json
[
  {
    "id": number,
    "name_jp": string,
    "name_en": string,
    "youtube": string,
    "twitter": string,
    "channel": string,
    "channel_stats": {
      "published_at": number,
      "views": number,
      "subscribers": number,
      "videos": number,
    },
    "description": string,
    "thumbnail": string
  }
]
```

#### `/videos`
Shows a list of all videos (Max 100).
###### Query parameters:
```json
{
  "status": string[],
  "title": string,
  "fields": string[],
  "limit": number
}
```
###### Returns:
```json
[
  {
    "id": string,
    "title": string,
    "channel": string,
    "group": string,
    "published_at": number,
    "scheduled_time": number,
    "start_time": number,
    "end_time": number,
    "length": number,
    "status": string
  }
]
```

## TO-DOs
* Add support for Bilibili channels(?)
* Google PubSub for getting new videos
* API documentation
* Cooler name, maybe?