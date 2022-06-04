import express, { Request } from 'express';
import { ErrorCode } from '../helpers/enums/error-code';
import Project from '../models/project.model';
import Collection from '../models/collection.model';
import Token from '../models/token.model';
import axios from 'axios';
import sharp from 'sharp';
import fs from 'fs';
import pinataSDK from '@pinata/sdk';
import { config } from '../config/index';

const pinata = pinataSDK(config.pinata.apiKey, config.pinata.secretKey);

const router = express.Router();

router.post('/project', async (req: Request, res) => {
	const { id, name, owner, traitTypes } = req.body || {};
	// console.log(req.body);
	if (!name || !owner || !traitTypes || id == undefined) {
		return res
			.status(ErrorCode.BAD_REQUEST_400)
			.send('Please provide required arguments in the body.');
	}

	// const project = new Project({ name, owner, description, traitTypes, externalUrl });

	let project;
	try {
		project = await Project.create({ id, name, owner, traitTypes });
	} catch (e) {
		console.error(`Failed to save a project with the name ${name} for the owner ${owner}. ${e}`);
		return res
			.status(ErrorCode.INTERNAL_SERVER_ERROR_500)
			.send(`Failed to save a project with the name ${name} for the owner ${owner}`);
	}

	res.json(project.toJSON());
});

router.get('/project/:id', async (req, res) => {
	const { id } = req.params;

	if (!id) {
		return res
			.status(ErrorCode.INTERNAL_SERVER_ERROR_500)
			.send('Bad Request: forgot to pass projectId.');
	}

	let project;
	try {
		project = await Project.findByPk(id);
	} catch (e) {
		console.error(`Failed to get a project by the id ${id}. ${e}`);
		return res
			.status(ErrorCode.INTERNAL_SERVER_ERROR_500)
			.send(`Failed to get a project by the id ${id}.`);
	}

	res.send(project);
});

router.get('/projects', async (req, res) => {
	let projects;
	try {
		projects = await Project.findAll({});
	} catch (e) {
		console.error(`Failed to get projects. ${e}`);
		return res
			.status(ErrorCode.INTERNAL_SERVER_ERROR_500)
			.send('Failed to get all the project from databse.');
	}

	res.json(projects);
});

router.post('/collection', async (req, res) => {
	const { id, name, projectId, royalties, manager, maxInvocation, assetType, paused } = req.body;

	if (
		id === undefined ||
		!name ||
		!projectId ||
		!royalties ||
		!manager ||
		!maxInvocation ||
		assetType === undefined
	) {
		return res
			.status(ErrorCode.BAD_REQUEST_400)
			.send('Please provide required arguments in the body.');
	}

	let collection;
	try {
		collection = await Collection.create({
			id,
			name,
			projectId,
			royalties,
			maxInvocation,
			manager,
			assetType,
			paused: false,
		});
	} catch (e) {
		console.error(
			`Failed to save a collection with the name ${name} for the projectId ${projectId}. ${e}`,
		);
		return res
			.status(ErrorCode.INTERNAL_SERVER_ERROR_500)
			.send(`Failed to save a collection with the name ${name} for the projectId ${projectId}.`);
	}

	res.send(collection);
});

router.get('/collection/:id', async (req, res) => {
	const { id } = req.params;

	if (!id) {
		return res
			.status(ErrorCode.INTERNAL_SERVER_ERROR_500)
			.send('Bad Request: forgot to pass collectionId.');
	}

	let collection;
	try {
		collection = await Collection.findByPk(id);
	} catch (e) {
		console.error(`Failed to get a collection by the id ${id}. ${e}`);
		return res
			.status(ErrorCode.INTERNAL_SERVER_ERROR_500)
			.send(`Failed to get a collection by the id ${id}.`);
	}

	res.send(collection);
});
router.patch('/project', async (req, res) => {
	const { id } = req.body;
	const keys = Object.keys(req.body);
	if (!id) {
		return res.status(ErrorCode.BAD_REQUEST_400).send('Forgot to attach id to body');
	} else if (keys.length < 2) {
		return res.status(ErrorCode.BAD_REQUEST_400).send('No update values inside body');
	}

	let project;

	try {
		project = await Project.update(req.body, { where: { id } });
	} catch (e) {
		console.error(`Failed to update a project with the update body ${req.body}. ${e}`);
		return res
			.status(ErrorCode.INTERNAL_SERVER_ERROR_500)
			.send(`Failed to update a project with the update body ${req.body}.`);
	}
	res.json(project);
});

router.patch('/collection', async (req, res) => {
	const { id } = req.body;
	const keys = Object.keys(req.body);
	if (!id) {
		return res.status(ErrorCode.BAD_REQUEST_400).send('Forgot to attach id to body');
	} else if (keys.length < 2) {
		return res.status(ErrorCode.BAD_REQUEST_400).send('No update values inside body');
	}

	let collection;

	try {
		collection = await Collection.update(req.body, { where: { id } });
	} catch (e) {
		console.error(`Failed to update a collection with the update body ${req.body}. ${e}`);
		return res
			.status(ErrorCode.INTERNAL_SERVER_ERROR_500)
			.send(`Failed to update a collection with the update body ${req.body}.`);
	}
	res.json(collection);
});

router.post('/token', async (req, res) => {
	const { name, id, collectionId, priceInWei, maxSupply, traitType } = req.body;

	if (id === undefined || !name || !collectionId || !maxSupply || !priceInWei || !traitType) {
		return res
			.status(ErrorCode.BAD_REQUEST_400)
			.send('Please provide required arguments in the body.');
	}

	let token;
	try {
		token = await Token.create({
			id,
			collectionId,
			name,
			maxSupply,
			amountMinted: 0,
			priceInWei,
			image: '',
			traitType,
			paused: false,
		});
	} catch (e) {
		console.error(`Failed creating token with the name.`);
		return res
			.status(ErrorCode.INTERNAL_SERVER_ERROR_500)
			.send(`Failed creating token with the name ${name}`);
	}
	res.json(token);
});

router.patch('/master', async (req, res) => {
	const { traitIds, masterId } = req.body;
	if (!traitIds || !masterId)
		return res
			.status(ErrorCode.BAD_REQUEST_400)
			.send('Please provide required arguments in the body.');

	const masterToken = await Token.findByPk(masterId);
	if (!masterToken)
		return res.status(ErrorCode.NOT_FOUND_404).send('Master nft not found in database');

	const baseUrl =
		'https://algobits.mypinata.cloud/ipfs/QmUwLRoyf3fqrY8QEc3TrKvmS5r1YVsZBiRi17fC8ptpp7/';

	const imageUrls = traitIds.map((traitId: number) => `${baseUrl}/${traitId}.png`);
	const imageCompositeList = [];

	try {
		for (let i = 0; i < imageUrls.length; i++) {
			const imageBuffer = (await axios({ url: imageUrls[i], responseType: 'arraybuffer' }))
				.data as Buffer;
			imageCompositeList.push({ input: imageBuffer });
		}
	} catch (e) {
		console.error(`Failed to downloading images${e}`);
		return res.status(ErrorCode.INTERNAL_SERVER_ERROR_500).send('Failed to download remotely');
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
		console.log(`Failed composing images with sharp ${e}`);
		return res
			.status(ErrorCode.INTERNAL_SERVER_ERROR_500)
			.send('Failed composing images with sharp');
	}
	const readableStreamForFile = fs.createReadStream('./composite.png');

	// upload to ipfs
	let fileInfo;
	try {
		fileInfo = await pinata.pinFileToIPFS(readableStreamForFile, {
			pinataMetadata: { name: `Composition of following token ids ${traitIds.join(',')}` },
		});
	} catch (e) {
		console.error(e);
		return res.status(ErrorCode.INTERNAL_SERVER_ERROR_500).send('Failed to upload a file to ipfs.');
	}
	console.log(`Update master nft where CID-> ${fileInfo?.IpfsHash} and master id ${masterId}`);
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
			traitIds: traitIds,
			image: config.pinata.baseUrl + fileInfo?.IpfsHash,
		});
	} catch (e) {
		console.log(`Failed to update master nft with the id ${masterId}. ${e}`);
		return res
			.status(ErrorCode.INTERNAL_SERVER_ERROR_500)
			.send(`Failed to update master nft with the id ${masterId}.`);
	}

	res.send(fileInfo);
});

export default router;
