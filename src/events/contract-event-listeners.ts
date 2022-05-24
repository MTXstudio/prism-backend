import {
	CollectionCreatedArgs,
	MintArgs,
	ProjectCreatedArgs,
	TokenCreatedArgs,
} from '../helpers/types/event-types';
import { firestore } from 'firebase-admin';

// const db = getFirestore();
// const projectsCollection = db.collection('projects');
// const projectsCollection = db.collection('projects');

export const mintListener = async (args: { mNFT: number; traits: number[] }) => {
	// projectsCollection.add({ name: 'Giorgi' });

	console.log(args);
};

export const projectCreatedListener = async (args: ProjectCreatedArgs, db: firestore.Firestore) => {
	const aTuringRef = db.collection('projecta').doc();

	await aTuringRef.set({
		hello: 'world',
	});
	console.log(args);
};

export const collectionCreatedListener = async (
	args: CollectionCreatedArgs,
	db: firestore.Firestore,
) => {
	const collectionDoc = db.collection('collections').doc();

	await collectionDoc.set({
		hello: 'world',
	});
	console.log(args);
};

export const tokenCreatedListener = (args: TokenCreatedArgs) => {
	console.log(args);
};
