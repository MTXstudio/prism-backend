import { BigNumber } from 'ethers';
import { Collection } from '../models/collection.model';
import { Project } from '../models/project.model';
import { Token } from '../models/token.model';
import axios from 'axios';
import sharp from 'sharp';
import fs from 'fs';
import pinataSDK from '@pinata/sdk';
import { config } from '../config/index';
import { AssetType } from '../helpers/enums/asset-type';
import { Attribute } from '../helpers/interfaces/attribute';

const pinata = pinataSDK(config.pinata.apiKey, config.pinata.secretKey);

export const projectCreatedListener = async (
	id: BigNumber,
	description: string,
	name: string,
	owner: string,
	traitTypes: string[],
) => {
	const foundProject = await Project.findByPk(id.toNumber());
	if (!foundProject) {
		try {
			await Project.create({ id: id.toNumber(), name, owner, traitTypes, description });
		} catch (e) {
			return console.error(
				`Failed to save a project with the name ${name} for the owner ${owner}. ${e}`,
			);
		}
		console.log(
			`Successfully created a project for the chef ${owner} with the project id ${id.toNumber()}`,
		);
	} else console.log(`Project with the id already exists ${foundProject.id}`);
};

export const collectionCreatedListener = async (
	id: BigNumber,
	projectId: BigNumber,
	name: string,
	description: string,
	royalties: BigNumber,
	manager: string,
	maxInvocation: BigNumber,
	assetType: AssetType,
	paused: boolean,
) => {
	const foundCollection = await Collection.findByPk(id.toNumber());
	if (!foundCollection) {
		try {
			await Collection.create({
				id: id.toNumber(),
				name,
				projectId: projectId.toNumber(),
				royalties: royalties.toString(),
				maxInvocation: maxInvocation.toString(),
				manager,
				assetType,
				paused: false,
				description,
			});
		} catch (e) {
			return console.error(
				`Failed to save a collection with the project id ${projectId} for the collection id ${id.toNumber()}. ${e}`,
			);
		}
		console.log(
			`Successfully created a collection for the project id ${projectId} with the collection id ${id.toNumber()}.`,
		);
	} else console.log(`Collection with the id already exists ${foundCollection.id}`);
};
export const tokenCreatedListener = async (
	id: BigNumber,
	projectId: BigNumber,
	collectionId: BigNumber,
	name: string,
	description: string,
	priceInWei: BigNumber,
	imageCid: string,
	attributes: Attribute[],
	maxSupply: BigNumber,
	traitType: string,
	assetType: AssetType,
	paused: boolean,
) => {
	const foundToken = await Token.findByPk(id.toNumber());

	if (!foundToken) {
		try {
			await Token.create({
				name,
				id: id.toNumber(),
				collectionId: collectionId.toNumber(),
				priceInWei: priceInWei.toNumber(),
				maxSupply: maxSupply.toNumber(),
				amountMinted: 0,
				traitType,
				paused,
				description,
				assetType,
				image: config.pinata.baseUrl + imageCid,
				attributes,
			});
		} catch (e) {
			return console.error(
				`Failed to save a token with the collection id ${collectionId} for the token id ${id.toNumber()}. ${e}`,
			);
		}
		console.log(
			`Successfully created a token for the collection id ${collectionId} with the token id ${id.toNumber()}.`,
		);
	} else console.log(`Token with the id already exists ${foundToken.id}`);
};

export const masterEditListener = async (id: BigNumber, traitsBigNumbers: BigNumber[]) => {
	// projectsCollection.add({ name: 'Giorgi' });
	const masterToken = await Token.findByPk(id.toNumber());
	if (!masterToken) return console.error(`Master nft with the id ${id} does not exist in database`);

	const baseUrl =
		'https://algobits.mypinata.cloud/ipfs/QmUwLRoyf3fqrY8QEc3TrKvmS5r1YVsZBiRi17fC8ptpp7/';

	const traitIds = traitsBigNumbers.map((traitsBigNumber) => traitsBigNumber.toNumber());
	const imageUrls = traitIds.map((traitId: number) => `${baseUrl}/${traitId}.png`);
	const imageCompositeList = [];
	try {
		for (let i = 0; i < imageUrls.length; i++) {
			const imageBuffer = (await axios({ url: imageUrls[i], responseType: 'arraybuffer' }))
				.data as Buffer;
			imageCompositeList.push({ input: imageBuffer });
		}
	} catch (e) {
		return console.error(`Failed to downloading images${e}`);
	}
	// sharp.cache(false);

	try {
		await sharp({
			create: {
				width: 1200,
				height: 1200,
				channels: 4,
				background: { r: 255, g: 255, b: 255, alpha: 0 },
			},
		})
			.composite(imageCompositeList)
			.toFile('./composite.png');
	} catch (e) {
		return console.error(`Failed composing images with sharp ${e}`);
	}
	const readableStreamForFile = fs.createReadStream('./composite.png');

	// upload to ipfs
	let fileInfo;
	try {
		fileInfo = await pinata.pinFileToIPFS(readableStreamForFile, {
			pinataMetadata: { name: `Composition of following token ids ${traitIds.join(',')}` },
		});
	} catch (e) {
		return console.error(`Failed to upload a file to ipfs. ${e}`);
	}
	// console.log(`Update master nft where CID-> ${fileInfo?.IpfsHash} and master id ${id}`);
	// delete composed file
	fs.unlink('./composite.png', (err) => {
		if (err && err.code == 'ENOENT') {
			// file doens't exist
			console.info("File doesn't exist, won't remove it.");
		} else if (err) {
			// other errors, e.g. maybe we don't have enough permission
			console.log(err);
			console.error('Error occurred while trying to remove file');
		} else {
			console.info(`removed`);
		}
	});

	try {
		await masterToken.update({
			traitIds,
			image: config.pinata.baseUrl + fileInfo?.IpfsHash,
		});
	} catch (e) {
		return console.log(`Failed to update master nft with the id ${id}. ${e}`);
	}
	console.log(
		`Successfully created image IpfsHash ${fileInfo.IpfsHash}, and update medata in database`,
	);
};

export const projectEditListener = async (
	id: BigNumber,
	name: string,
	description: string,
	owner: string,
	traitTypes: string[],
) => {
	const foundProject = await Project.findByPk(id.toNumber());
	if (!foundProject) return console.log(`ProjectEdit: Project not found`);

	try {
		await foundProject.update({ name, owner, traitTypes, description });
	} catch (e) {
		return console.error(`Failed to update a project with the id ${id.toNumber()}. ${e}`);
	}
	console.log(`Successfully edited project with the id ${id}.`);
};

export const collectionEditListener = async (
	id: BigNumber,
	projectId: BigNumber,
	name: string,
	description: string,
	royalties: BigNumber,
	manager: string,
	maxInvocation: BigNumber,
	assetType: AssetType,
	paused: boolean,
) => {
	const foundCollection = await Collection.findByPk(id.toNumber());
	if (!foundCollection) return console.log(`CollectionEdit: Collection not found`);

	console.log('paused', paused);
	try {
		await foundCollection.update({
			name,
			projectId: projectId.toNumber(),
			royalties: royalties.toString(),
			manager,
			maxInvocation: maxInvocation.toString(),
			assetType,
			paused,
			description,
		});
	} catch (e) {
		return console.error(`Failed to update a collection with the id ${id.toNumber()}. ${e}`);
	}
	console.log(`Successfully edited collection with the id ${id}.`);
};

export const tokenEditListener = async (
	id: BigNumber,
	projectId: BigNumber,
	collectionId: BigNumber,
	name: string,
	description: string,
	priceinWei: BigNumber,
	maxSupply: BigNumber,
	traitType: string,
	assetType: AssetType,
	paused: boolean,
) => {
	const foundToken = await Token.findByPk(id.toNumber());
	if (!foundToken) return console.log(`TokenEdit: Token not found`);

	console.log('paused', paused);
	try {
		await foundToken.update({
			name,
			id: id.toNumber(),
			collectionId: collectionId.toNumber(),
			priceInWei: priceinWei.toNumber(),
			maxSupply: maxSupply.toNumber(),
			amountMinted: 0,
			traitType: traitType,
			paused,
			description,
			assetType: assetType,
		});
	} catch (e) {
		return console.error(`Failed to update a token with the id ${id.toNumber()}. ${e}`);
	}
	console.log(`Successfully edited token with the id ${id}.`);
};
