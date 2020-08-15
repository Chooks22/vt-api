# VTuber API

## Development
* Prerequisites
  * Have `node` installed.
  * Have [MongoDB](https://docs.mongodb.com/manual/installation/) and [Memcached](https://www.howtoforge.com/how-to-install-memcached-on-ubuntu-2004-lts/) installed locally.
    * Optional: Download [MongoDB Compass](https://www.mongodb.com/try/download/compass) to access your database with a GUI.
  * Have a [Google Cloud Project](https://console.cloud.google.com/apis/credentials) API Key with Youtube API enabled.
  * Setup some channels first before starting.


* Installation
```
# Install dependencies and create your .env copy
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
* `any[]` are queries split with `,`.
  * Example: `status=live,upcoming`
* Add queries by adding parameters to GET requests.
  * Example using `node-js` with `axios`:
```js
const axios = require('axios');
const parameters = { status: 'live,upcoming', title: 'apex' };

axios.get('http://localhost:2434/live', { params: parameters })
  .then(res => console.log(res.data));
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
 */
```

### Endpoints
#### `/live`
Displays live, upcoming, and ended videos.
###### Query parameters:
```json
{
  "status": "string[]",
  "title": "string",
  "group": "string"
}
```
###### Returns:
```json
{
  "live": "object[]",
  "upcoming": "object[]",
  "ended": "object[]"
}
```
###### Video object:
```json
{
  "id": "string",
  "title": "string",
  "channel": "string",
  "group": "string",
  "published_at": "number",
  "scheduled_time": "number",
  "start_time": "number",
  "end_time": "number",
  "length": "number",
  "viewers": "number",
  "status": "string"
}
```

#### `/channels`
Shows a list of all channels (Max 150).
###### Query parameters:
```json
{
  "id": "number[]",
  "name": "string",
  "group": "string",
  "youtube": "string[]",
  "channel": "string",
  "fields": "string[]",
  "limit": "number"
}
```
You can use number ranges for `id` query, example:
```js
// Any of these queries will return channels with ids from 1 to 5
const idArray = { id: '1,2,3,4,5' };
const idRange = { id: '1-5' };
const idBoth = { id: '1,2,3-5' };
```
###### Returns:
```json
[
  {
    "id": "number",
    "name_jp": "string",
    "name_en": "string",
    "youtube": "string",
    "twitter": "string",
    "channel": "string",
    "channel_stats": {
      "published_at": "number",
      "views": "number",
      "subscribers": "number",
      "videos": "number",
    },
    "description": "string",
    "thumbnail": "string"
  }
]
```

#### `/videos`
Shows a list of all videos (Max 100).
###### Query parameters:
```json
{
  "group": "string[]",
  "status": "string[]",
  "channel": "string[]",
  "title": "string",
  "fields": "string[]",
  "limit": "number"
}
```
###### Returns:
```json
[
  {
    "id": "string",
    "title": "string",
    "channel": "string",
    "group": "string",
    "published_at": "number",
    "scheduled_time": "number",
    "start_time": "number",
    "end_time": "number",
    "length": "number",
    "status": "string"
  }
]
```

## TO-DOs
* Add support for Bilibili channels(?)
* Sort queries
* API documentation
* Cooler name, maybe?