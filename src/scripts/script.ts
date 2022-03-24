import { ethers } from 'ethers';
import { Project } from '../interfaces/project';

import abi from '../abi.json';
import { Collection } from 'interfaces/collection';
import { config } from '../config/index';
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
		// The operation is NOT complete yet; we must wait until it is mined
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
		// The operation is NOT complete yet; we must wait until it is mined
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
) => {
	//add tokens
	let receipt;
	try {
		const tx = await contract.createTokens(names, prices, projectIds, collectionIds, maxSupplies);
		// The operation is NOT complete yet; we must wait until it is mined
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
	// for await (const line of rl) {
	// 	// Each line in the readline input will be successively available here as
	// 	// `line`.
	// 	if (Number(line) === 0) {
	// 	} else if (Number(line) === 0) {
	// 	}
	// 	console.log(line);
	// }
	console.log(await signer.getAddress());
	try {
		const projectId = await getCurrentProjectId();
		if (!projectId) throw new Error('Failed to get project id');
		const receiptProject = await createProject({
			name: 'Demo Project',
			managerAddress: '0xedf4AaA709F12e67AC5834c70c5Fafc00Bc12bb3',
			projectURI: 'ipfs://some_uid',
		});
		if (!receiptProject) throw new Error('Failed to create a project');

		const collectionId = await getCurrentProjectCollectionId();
		if (!collectionId) throw new Error('Failed to retrieve current collection id');

		const receiptCollection = await createCollection({
			name: 'Demo Collection',
			maxInvocations: 10,
			projectId: projectId,
		});
		if (!receiptCollection)
			throw new Error('Failed to create collection with the project id', projectId);

		const receiptTokens = await createTokens(
			['Demo Name'],
			[10000],
			[projectId],
			[collectionId],
			[100],
		);
		if (!receiptTokens)
			throw new Error(`Failed to create tokens with the collection ids [${collectionId}]`);

		console.log('', receiptTokens);
	} catch (e) {
		console.error(e);
		process.exit(-1);
	}
};

runScripts();
