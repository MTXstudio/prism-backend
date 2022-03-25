import express from 'express';
import admin from 'firebase-admin';
import { ErrorCode } from './enums/error-code';
import { config } from './config/index';
// import { contractEventLoader } from './events/loader';
import './helpers/fetch-polyfill';
// import { ErrorCode } from './enums/error-code';

const app = express();

//https://stackoverflow.com/questions/41287108/deploying-firebase-app-with-service-account-to-heroku-environment-variables-wit

const firebaseApp = admin.initializeApp({
	credential: admin.credential.cert({
		projectId: config.firebase.projectId,
		privateKey: config.firebase.privateKey,
		clientEmail: config.firebase.clientEmail,
	}),
});

const db = firebaseApp.firestore();

const start = async () => {
	// contractEventLoader(firebaseApp);
	db.collection('heroku').add({ isWorking: true });
	app.get('/', (req, res) => {
		res.send('Its working');
	});
	app.get('/:tokenId', async (req, res) => {
		const { tokenId } = req.params || {};
		if (!tokenId)
			return res.status(ErrorCode.BAD_REQUEST_400).send('Please provider the tokenId as param');

		// db.collection('tokens').doc(tokenId)
		const docRef = await db.collection('tokens').doc(tokenId).get();
		if (docRef.exists) res.json({ data: docRef.data(), id: docRef.id });
		else
			res.status(ErrorCode.NOT_FOUND_404).send(`The token with the id ${tokenId} doesn't exists.`);
	});

	app.listen(config.server.port, () =>
		console.log(`The Server is listening to ${config.server.port}`),
	);
};

start();

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
