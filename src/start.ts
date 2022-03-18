import express from 'express';
import './helpers/fetch-polyfill';
import { connectToTableLand } from './services/tableland';
import { config } from './config/index';
import { contractEventLoader } from './events/loader';
const app = express();

const start = async () => {
	const tbl = await connectToTableLand();

	if (!tbl) process.exit(-1);

	contractEventLoader(tbl);

	app.listen(config.server.port, () =>
		console.log(`The Server is listening to ${config.server.port}`),
	);
};

start();
