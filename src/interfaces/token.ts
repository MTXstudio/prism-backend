export interface Token {
	name: string;
	maxSupply: number;
	tokenPriceInWei: number;
	projectId: number;
	collectionId: number;
	paused: boolean;
	locked: boolean;
}
