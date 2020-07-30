require('dotenv').config();
require('./apps/api');

const express = require('express');
const bodyParser = require('body-parser');
const { logger } = require('./modules');

const PORT = +process.env.PORT || 2434;
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.json({ 'endpoints': ['live', 'channels', 'videos'] });
});

app.listen(PORT, () => {
  logger.app('API is now accessible at localhost:%d', PORT);
});

app.use(require('./apps/routes'));
