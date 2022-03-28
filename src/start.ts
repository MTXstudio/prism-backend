import express from 'express';
import admin, { firestore } from 'firebase-admin';
import { ErrorCode } from './enums/error-code';
import { config } from './config/index';
import './helpers/fetch-polyfill';
import { contractEventLoader } from './events/loader';
import { json, urlencoded } from 'body-parser';

const app = express();

app.use(json());
app.use(urlencoded({ extended: false }));

const firebaseApp = admin.initializeApp({
	credential: admin.credential.cert({
		projectId: config.firebase.projectId,
		privateKey: config.firebase.privateKey,
		clientEmail: config.firebase.clientEmail,
	}),
});

const db = firebaseApp.firestore();

app.get('/', (req, res) => {
	res.send('Its working!');
});

app.get('/tokens/:tokenId', async (req, res) => {
	const { tokenId } = req.params || {};
	if (!tokenId) return res.status(ErrorCode.BAD_REQUEST_400).send('Please provider params');

	// db.collection('tokens').doc(tokenId)
	const docRef = await db.collection('tokens').doc(tokenId).get();
	if (docRef.exists) res.json({ data: docRef.data(), id: docRef.id });
	else res.status(ErrorCode.NOT_FOUND_404).send(`The token with the id ${tokenId} doesn't exists.`);
});

app.get('/tokens', async (req, res) => {
	const { traits } = req.body || {};
	console.log('traits', traits);
	if (!traits) return res.status(ErrorCode.BAD_REQUEST_400).send('Please provider params');

	let snapshot;
	try {
		snapshot = await db
			.collection('tokens')
			.where(firestore.FieldPath.documentId(), 'in', traits)
			.get();
	} catch (e) {
		console.error(e);
		return res.send({
			success: false,
			message: `Failed to retrieve tokens with the ids ${traits}.`,
		});
	}

	const docs: any[] = [];
	snapshot.docs[0].data();
	snapshot.forEach((doc) => {
		docs.push(doc.data());
	});

	res.send(docs);
});

app.post('/token', async (req, res) => {
	// db.collection('tokens').doc(tokenId)
	let docRef;
	try {
		docRef = await db.collection('tokens').add({
			name: (Math.random() + 1).toString(36).substring(7),
		});
	} catch (e) {
		return res.send({ success: false, message: 'Failed to add a token' });
	}

	const doc = await docRef?.get();

	res.json({ success: true, data: doc?.data() || {} });
});

contractEventLoader(db);

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
