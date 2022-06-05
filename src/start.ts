import express from 'express';
import { config } from './config/index';
import { contractEventLoader } from './events/loader';
import { Sequelize, SequelizeOptions } from 'sequelize-typescript';
import routesV2 from './routes/index-v2';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';

const app = express();

app.use(morgan('combined'));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// app.use('/v1', routesV1);
app.use('/api/v2', routesV2);

contractEventLoader();

const start = async () => {
	const options: SequelizeOptions = {
		username: config.postgres.user,
		password: config.postgres.pwd,
		database: config.postgres.dbName,
		dialect: 'postgres',
		host: config.postgres.host,
		port: config.postgres.port as number,
		models: [path.resolve(__dirname, './models/*.model.*')],
		modelMatch: (filename, member) => true,
		logging: false,
	};
	if (process.env.NODE_ENV !== 'development') {
		options.dialectOptions = {
			ssl: {
				require: true,
				rejectUnauthorized: false,
			},
		};
	}
	const sequelize = new Sequelize(options);

	try {
		await sequelize.sync(); // Drop tables and create them again.
		// await sequelize.addModels([]);
		console.log(
			`Server connected with database engine on host ${config.postgres.host} at ${config.postgres.port}`,
		);
	} catch (e) {
		console.error(`failed synchronizing all models. ${e}`);
		process.exit(-1);
	}

	app.listen(config.server.port, () =>
		console.log(`The Server is listening on ${config.server.port}`),
	);
};

start();
