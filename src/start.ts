import express from 'express';
import admin from 'firebase-admin';
import { config } from './config/index';
import './helpers/fetch-polyfill';
import { json, urlencoded } from 'body-parser';
import cors from 'cors';
import morgan from 'morgan';
import routes from './routes/index';
import { contractEventLoader } from './events/loader';

const app = express();
app.use(json());
app.use(urlencoded({ extended: false }));
app.use(
	cors({
		origin: '*',
		methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
		preflightContinue: false,
		optionsSuccessStatus: 204,
	}),
);
app.use(morgan('tiny'));

const firebaseApp = admin.initializeApp({
	credential: admin.credential.cert({
		projectId: config.firebase.projectId,
		privateKey: config.firebase.privateKey,
		clientEmail: config.firebase.clientEmail,
	}),
});

const db = firebaseApp.firestore();

// app.use((req, res, next) => {
// 	if (!req.db) req.db = db;
// 	next();
// });

// app.use(routes);

contractEventLoader(db);

app.listen(config.server.port, () =>
	console.log(`The Server is listening to ${config.server.port}`),
);
