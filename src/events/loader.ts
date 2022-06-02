import { config } from '../config/index';
import { BigNumber } from '@ethersproject/bignumber';
import Project from '../models/project.model';

enum AssetType {
	MASTER,
	TRAIT,
	OTHER,
}

export const contractEventLoader = async () => {
	config.contract.project.on(
		'ProjectCreated',
		async (
			id: BigNumber,
			name: string,
			chef: string,
			traitTypes: string[],
			description: string,
		) => {
			//
		},
	);

	config.contract.project.on(
		'CollectionCreated',
		(
			name: string,
			id: BigNumber,
			projectId: BigNumber,
			royalties: BigNumber,
			manager: string,
			maxInvocation: BigNumber,
			assetType: AssetType,
			paused: boolean,
		) => {
			//collection created
		},
	);

	config.contract.token.on(
		'TokenCreated',
		(
			name: string,
			id: BigNumber,
			projectId: BigNumber,
			collectionId: BigNumber,
			priceInWei: BigNumber,
			maxSupply: BigNumber,
			traitType: string,
			assetType: AssetType,
			paused: boolean,
		) => {
			// Token created
		},
	);

	config.contract.token.on('MasterEdit', (masterId: BigNumber, traits: BigNumber[]) => {
		// Edit master Id
	});
};
