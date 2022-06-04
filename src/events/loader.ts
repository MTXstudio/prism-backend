import { config } from '../config/index';
import { BigNumber } from '@ethersproject/bignumber';
import Project from '../models/project.model';
import {
	collectionCreatedListener,
	masterEditListener,
	projectCreatedListener,
	tokenCreatedListener,
} from './event-listeners';

enum AssetType {
	MASTER,
	TRAIT,
	OTHER,
}

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

	// config.contract.token.on('MasterEdit', collectionEditListener);

	// config.contract.token.on(
	// 	'ProjectEdit',
	// 	(id: BigNumber, name: string, chef: string, traitTypes: string[]) => {
	// 		console.log(`Project edit with follwing args: ${name}, ${id}, ${chef}, ${traitTypes}`);
	// 	},
	// );

	// // config.contract.token.on('MasterEdit', collectionEditListener);

	// config.contract.token.on(
	// 	'CollectionEdit',
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
	// 			`Collection edit with follwing args: ${name}, ${id}, ${projectId}, ${royalties}, ${manager}, ${maxInvocation}, ${assetType}, ${paused}`,
	// 		);
	// 	},
	// );

	config.contract.token.on('MasterEdit', masterEditListener);

	// config.contract.token.on('MasterEdit', (masterId: BigNumber, traits: BigNumber[]) => {
	// 	console.log(`Edit Master with follwing args: ${masterId}, ${traits}`);
	// });
};
