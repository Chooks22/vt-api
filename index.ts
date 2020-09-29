import { config } from 'dotenv';
config();

import { main } from './apps/api';
main();

import { logger, youtube } from './modules';

(async () => {
  if (await youtube.validateKey()) return;
  logger.app('Invalid Youtube API key! Please check your .env file.');
  process.exit();
})();

import express from 'express';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import cors from 'cors';

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

