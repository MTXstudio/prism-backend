import { ethers } from 'ethers';
import { Project } from '../interfaces/project';

import abi from '../../abi.json';
import { Collection } from '../interfaces/collection';
import { config } from '../../config/index';
import readline from 'readline';

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');
const signer = provider.getSigner();
const contract = new ethers.Contract(config.contract.address, abi, signer);

const createProject = async ({ name, managerAddress }: Project) => {
	let receipt;
	try {
		const tx = await contract.createProject(name, managerAddress);
		receipt = await tx.wait();
	} catch (e) {
		console.error('script.ts[createProject]', e);
		return;
	}
	return receipt;
};

const createCollection = async ({ name, maxInvocations, projectId }: Collection) => {
	let receipt;
	try {
		const tx = await contract.createCollection(name, maxInvocations, projectId);
		receipt = await tx.wait();
	} catch (e) {
		console.error('script.ts[createCollection]', e);
		return;
	}
	return receipt;
};

const createTokens = async (
	names: string[],
	prices: number[],
	projectIds: string[],
	collectionIds: string[],
	maxSupplies: number[],
	tokenUris: string[],
	tokenTypes: number[],
) => {
	let receipt;
	try {
		const tx = await contract.createTokens(
			names,
			prices,
			projectIds,
			collectionIds,
			maxSupplies,
			tokenUris,
			tokenTypes,
		);

		receipt = await tx.wait();
	} catch (e) {
		console.error('script.ts[createTokens]', e);
		return;
	}
	return receipt;
};

const getCurrentProjectId = async () => {
	let res;
	try {
		res = await contract.nextProjectId();
	} catch (e) {
		console.error('script.ts[getCurrentProjectId]', e);
		return;
	}

	return res.toNumber();
};

const getCurrentProjectCollectionId = async () => {
	let res;
	try {
		res = await contract.nextCollectionId();
	} catch (e) {
		console.error('script.ts[getCurrentProjectCollectionId]', e);
		return;
	}

	return res.toNumber();
};

const runScripts = async () => {
	console.log('runScripts');

	try {
		console.log('current project id');
		const projectId = await getCurrentProjectId();
		if (!projectId) throw new Error('Failed to get project id');
		console.log('Creating Project');
		const receiptProject = await createProject({
			name: 'Demo Project',
			managerAddress: '0xedf4AaA709F12e67AC5834c70c5Fafc00Bc12bb3',
			projectURI: 'ipfs://some_uid',
		});
		if (!receiptProject) throw new Error('Failed to create a project');

		const collectionId = await getCurrentProjectCollectionId();
		if (!collectionId) throw new Error('Failed to retrieve current collection id');

		console.log('Creating Collection');
		const receiptCollection = await createCollection({
			name: 'Demo Collection',
			maxInvocations: 10,
			projectId: projectId,
		});
		if (!receiptCollection)
			throw new Error('Failed to create collection with the project id', projectId);

		const traitIds = Array.from(Array(3).keys()).map((id) => id + 1); // [1-5]
		const masterIds = [4];
		const allTokenIds = traitIds.concat(masterIds);

		const tokenNames = allTokenIds.map((id) => `Token #${id}`);
		const prices = allTokenIds.map((id) => 1000);
		const projectIds = allTokenIds.map((id) => projectId);
		const collectionIds = allTokenIds.map((id) => collectionId);
		const maxSupplies = allTokenIds.map((id) => 100);
		const tokenUris = allTokenIds.map((id) => `https://some_random_domain_maybe_pinata/${id}`);
		const tokenTypes = allTokenIds.map((id) => (id > 40 ? 2 : 1));

		console.log('Creating Tokens');
		const receiptTokens = await createTokens(
			tokenNames,
			prices,
			projectIds,
			collectionIds,
			maxSupplies,
			tokenUris,
			tokenTypes,
		);

		if (!receiptTokens)
			throw new Error(`Failed to create tokens with the collection ids [${collectionId}]`);
		console.log('Waiting for minting');

		const tokensAmount = allTokenIds.map((e) => 10);
		console.log('allTokenIds', allTokenIds);
		console.log('tokensAmount', tokensAmount);

		const tx1 = await contract.mintBatch(allTokenIds, tokensAmount, '0x00', {
			gasLimit: 10000,
		});
		await tx1.wait();

		const addr = await signer.getAddress();
		const tokens = await contract.tokensOfAddress(addr);
		console.log('done');
		console.log(tokens);
	} catch (e) {
		console.error(e);
	}
	// const address = await signer.getAddress();
	// const tokens = await contract.viewTokensOfAddress(address);
	// console.log(tokens);
	process.exit(0);
};

runScripts();

// for await (const line of rl) {
// 	// Each line in the readline input will be successively available here as
// 	// `line`.
// 	if (Number(line) === 0) {
// 	} else if (Number(line) === 0) {
// 	}
// 	console.log(line);
// }
