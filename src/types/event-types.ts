import { BigNumber } from 'ethers';

export type MintArgs = {
	to: string;
	tokenId: BigNumber;
	collectionId: BigNumber;
	invocations: BigNumber;
	value: BigNumber;
};

export type ProjectCreatedArgs = {
	projectId: BigNumber;
	name: string;
};

export type CollectionCreatedArgs = {
	name: string;
	collectionId: BigNumber;
	projectId: BigNumber;
	maxInvocation: BigNumber;
};

export type TokenCreatedArgs = {
	name: string;
	tokenId: BigNumber;
	projectId: BigNumber;
	collectionId: BigNumber;
	price: BigNumber;
	maxSupply: BigNumber;
};
