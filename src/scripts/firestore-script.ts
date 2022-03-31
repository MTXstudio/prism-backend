import admin, { firestore } from 'firebase-admin';
import { config } from '../config/index';
import fs from 'fs';

const firebaseApp = admin.initializeApp({
	credential: admin.credential.cert({
		projectId: config.firebase.projectId,
		privateKey: config.firebase.privateKey,
		clientEmail: config.firebase.clientEmail,
	}),
});

const db = firebaseApp.firestore();

const writeAllDocumentsInJsonFile = async (collectionName: string) => {
	let snapshots;
	try {
		snapshots = await db.collection(collectionName).get();
	} catch (e) {
		return console.error(e);
	}

	const tokens: firestore.DocumentData = snapshots.docs.map((doc: firestore.DocumentSnapshot) =>
		doc.data(),
	);
	const tokensString = JSON.stringify(tokens);
	fs.writeFile(`./${collectionName}.json`, tokensString, 'utf-8', (err) => {
		console.log(err);
		//callback
	});
};

writeAllDocumentsInJsonFile('tokens-test');
