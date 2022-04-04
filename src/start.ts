import express, { Express, Request } from 'express';
import admin from 'firebase-admin';
import { config } from './config/index';
import './helpers/fetch-polyfill';
import { json, urlencoded } from 'body-parser';
import cors from 'cors';
import morgan from 'morgan';
import routes from './routes/index';

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

// contractEventLoader(db);
app.use((req, res, next) => {
	if (!req.db) req.db = db;
	next();
});

app.use(routes);

app.listen(config.server.port, () =>
	console.log(`The Server is listening to ${config.server.port}`),
);

// const tbl = await connectToTableLand();
// if (!tbl) process.exit(-1);
// const tables = await tbl.list();

// console.log('tables', tables[tables.length - 1]);

// if (tables.length === 0 || true) {
// 	// await tbl.create(projectTableScript(), {
// 	// 	description: 'In this table are stored all the nft projects',
// 	// });
// 	await tbl.create(collectionTableScript(), {
// 		description: 'In this table are stored all the nft collections',
// 	});
// 	// await tbl.create(tokenTableScript(), {
// 	// 	description: 'In this table are stored all the nft tokens',
// 	// });
// }
