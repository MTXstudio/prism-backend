import express from 'express';
import { config } from './config/index';
import './helpers/fetch-polyfill';
import { contractEventLoader } from './events/loader';

const app = express();

contractEventLoader();

app.listen(config.server.port, () =>
	console.log(`The Server is listening to ${config.server.port}`),
);
