import { mintListener } from './contract-event-listeners';
import colors from 'colors';
import { firestore } from 'firebase-admin';
import { config } from '../config/index';

export const contractEventLoader = async (db: firestore.Firestore) => {
	config.contract.project.on('MasterEdit', (mNFT: number, traits: number[]) => {
		console.log(colors.blue('Mint'));
		mintListener({ mNFT, traits }, db);
	});

	// contract.on('ProjectCreated', (projectId: BigNumber, name: string) => {
	// 	console.log(colors.yellow('ProjectCreated'));
	// 	projectCreatedListener({ name, projectId }, db);
	// });

	// contract.on(
	// 	'CollectionCreated',
	// 	(name: string, collectionId: BigNumber, projectId: BigNumber, maxInvocation: BigNumber) => {
	// 		console.log(colors.red('CollectionCreated'));
	// 		collectionCreatedListener({ name, collectionId, projectId, maxInvocation }, db);
	// 	},
	// );

	// contract.on(
	// 	'TokenCreated',
	// 	(
	// 		name: string,
	// 		tokenId: BigNumber,
	// 		projectId: BigNumber,
	// 		collectionId: BigNumber,
	// 		price: BigNumber,
	// 		maxSupply: BigNumber,
	// 	) => {
	// 		console.log(colors.cyan('TokenCreated'));
	// 		tokenCreatedListener({
	// 			collectionId,
	// 			maxSupply,
	// 			name,
	// 			price,
	// 			projectId,
	// 			tokenId,
	// 		});
	// 	},
	// );
};
