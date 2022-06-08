import { config } from '../config/index';
import {
	collectionCreatedListener,
	collectionEditListener,
	masterEditListener,
	projectCreatedListener,
	projectEditListener,
	tokenCreatedListener,
	tokenEditListener,
} from './event-listeners';

export const contractEventLoader = async () => {
	config.contract.project.on('ProjectCreated', projectCreatedListener);
	// config.contract.project.on(
	// 	'ProjectCreated',
	// 	(id: BigNumber, name: string, owner: string, traitTypes: string[]) => {
	// 		console.log(`Create Project with following args: ${id}, ${name}, ${owner}, ${traitTypes}`);
	// 	},
	// );

	config.contract.project.on('CollectionCreated', collectionCreatedListener);
	// config.contract.project.on(
	// 	'CollectionCreated',
	// 	(
	// 		name: string,
	// 		id: BigNumber,
	// 		projectId: BigNumber,
	// 		royalties: BigNumber,
	// 		manager: string,
	// 		maxInvocation: BigNumber,
	// 		assetType: AssetType,
	// 		paused: boolean,
	// 	) => {
	// 		console.log(
	// 			`Create Collection with following args: ${id}, ${name}, ${projectId}, ${royalties}, ${manager}, ${maxInvocation}, ${assetType}, ${paused}}`,
	// 		);
	// 	},
	// );

	config.contract.token.on('TokenCreated', tokenCreatedListener);
	// config.contract.token.on(
	// 	'TokenCreated',
	// 	(
	// 		name: string,
	// 		id: BigNumber,
	// 		projectId: BigNumber,
	// 		collectionId: BigNumber,
	// 		priceInWei: BigNumber,
	// 		maxSupply: BigNumber,
	// 		traitType: string,
	// 		assetType: AssetType,
	// 		paused: boolean,
	// 	) => {
	// 		console.log(
	// 			`Create Token with following args: ${id}, ${name}, ${projectId}, ${collectionId}, ${priceInWei}, ${maxSupply}, ${traitType}, ${assetType}, ${paused}}`,
	// 		);
	// 	},
	// );

	config.contract.project.on('ProjectEdit', projectEditListener);
	config.contract.project.on('CollectionEdit', collectionEditListener);
	config.contract.token.on('TokenEdit', tokenEditListener);
	config.contract.token.on('MasterEdit', masterEditListener);
};
