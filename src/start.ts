import express from 'express';
import admin, { firestore } from 'firebase-admin';
import { ErrorCode } from './enums/error-code';
import { config } from './config/index';
import './helpers/fetch-polyfill';
import { contractEventLoader } from './events/loader';
import { json, urlencoded } from 'body-parser';
import { Token } from 'interfaces/token';

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
	const docRef = await db.collection(config.firebase.collectionNames.tokens).doc(tokenId).get();
	if (docRef.exists) res.json({ data: docRef.data(), id: docRef.id });
	else res.status(ErrorCode.NOT_FOUND_404).send(`The token with the id ${tokenId} doesn't exists.`);
});

app.get('/tokens', async (req, res) => {
	let snapshots;
	try {
		snapshots = await db.collection(config.firebase.collectionNames.tokens).get();
	} catch (e) {
		return res
			.status(ErrorCode.INTERNAL_SERVER_ERROR_500)
			.send(`Failed to get all tokens in the collection.`);
	}

	const tokens: firestore.DocumentData = snapshots.docs.map((doc: firestore.DocumentSnapshot) =>
		doc.data(),
	);

	res.send({ tokens: tokens });
});

app.get('/tokens/:tokens', async (req, res) => {
	const tokenIds = req.params.tokens;

	if (!tokenIds) return res.status(ErrorCode.BAD_REQUEST_400).send('Please provider trait ids.');

	let snapshot;
	try {
		snapshot = await db
			.collection(config.firebase.collectionNames.tokens)
			.where(firestore.FieldPath.documentId(), 'in', tokenIds)
			.get();
	} catch (e) {
		console.error(e);
		return res.status(ErrorCode.INTERNAL_SERVER_ERROR_500).send({
			success: false,
			message: `Failed to retrieve tokens with the ids ${tokenIds}.`,
		});
	}

	const docs: firestore.DocumentData[] = [];
	snapshot.forEach((doc) => {
		docs.push(doc.data());
	});

	res.send(docs);
});

app.post('/token', async (req, res) => {
	// db.collection('tokens').doc(tokenId)
	let docRef;
	try {
		docRef = await db.collection(config.firebase.collectionNames.tokens).add({
			name: (Math.random() + 1).toString(36).substring(7),
		});
	} catch (e) {
		return res.send({ success: false, message: 'Failed to add a token' });
	}

	const doc = await docRef?.get();

	res.json({ success: true, data: doc?.data() || {} });
});

// contractEventLoader(db);

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
