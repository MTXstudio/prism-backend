import {
	CollectionCreatedArgs,
	MintArgs,
	ProjectCreatedArgs,
	TokenCreatedArgs,
} from '../helpers/types/event-types';

export const mintListener = async (args: { mNFT: number; traits: number[] }) => {
	// projectsCollection.add({ name: 'Giorgi' });

	console.log(args);
};

export const projectCreatedListener = async (args: ProjectCreatedArgs) => {
	// const aTuringRef = db.collection('projecta').doc();
	// await aTuringRef.set({
	// 	hello: 'world',
	// });
	// console.log(args);
};

export const collectionCreatedListener = async (args: CollectionCreatedArgs) => {
	// const collectionDoc = db.collection('collections').doc();
	// await collectionDoc.set({
	// 	hello: 'world',
	// });
	// console.log(args);
};

export const tokenCreatedListener = (args: TokenCreatedArgs) => {
	//
};
