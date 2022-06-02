import express from 'express';
import { config } from './config/index';
import { contractEventLoader } from './events/loader';
import { Sequelize } from 'sequelize-typescript';
import Project from './models/project.model';
import routesV2 from './routes/index-v2';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import cors from 'cors';

const app = express();
const { postgres } = config;

app.use(morgan('combined'));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// app.use('/v1', routesV1);
app.use('/api/v2', routesV2);

contractEventLoader();

const start = async () => {
	const sequelize = new Sequelize(
		`postgres://${postgres.user}:${postgres.pwd}@${postgres.host}:${postgres.port}/${postgres.dbName}`,
		{ models: [__dirname + '/models/**/*.model.ts'], logging: false },
	);

	try {
		await sequelize.sync({ alter: process.env.NODE_ENV === 'development' ? true : false }); //  matches database table to the model
		console.log('Database connected!');
	} catch (e) {
		console.error(`failed synchronizing all models.`);
		process.exit(-1);
	}

	app.listen(config.server.port, () =>
		console.log(`The Server is listening to ${config.server.port}`),
	);
};

start();
