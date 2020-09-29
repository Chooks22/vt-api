require('dotenv').config();
require('./apps/api').main();

const { logger, youtube } = require('./modules');

(async () => {
  if (await youtube.validateKey()) return;
  logger.app('Invalid Youtube API key! Please check your .env file.');
  process.exit();
})();

const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const cors = require('cors');

const PORT = +process.env.PORT || 2434;
const app = express();

app.use(helmet());
app.use(cors());

app.use(require('./apps/routes'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
  res.redirect('docs');
});

app.listen(PORT, () => {
  logger.app('API is now accessible at localhost:%d', PORT);
});

