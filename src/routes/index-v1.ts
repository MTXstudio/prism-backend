import { config } from '../config/index';
import { ErrorCode } from '../helpers/enums/error-code';
import express from 'express';
import sharp from 'sharp';
import axios from 'axios';
import { firestore } from 'firebase-admin';
import fs from 'fs';
import pinataSDK from '@pinata/sdk';
import { TokenType } from '../helpers/enums/token-type';

const pinata = pinataSDK(config.pinata.apiKey, config.pinata.secretKey);

const router = express.Router();

router.get('/', (req, res) => {
	res.send('<h1>Welcome to1</h1>');
});

router.get('/whitelisted/:address', async (req, res) => {
	const { address } = req.params;
	if (!address) return res.status(ErrorCode.BAD_REQUEST_400).send('address property not found.');

	let axiosRes;
	try {
		axiosRes = await axios.get(
			`https://sheets.googleapis.com/v4/spreadsheets/1ZsoHD-ZoSf0FPvIurdud7LuKVj0qYjCLXok395NXyMA/values/BETA%20Testers?key=${config.google.apiKey}`,
		);
	} catch (e) {
		console.log(`Failed fetching spreadsheet data ${e}`);
		return res.status(500).send('Failed to retrieve whitelist addresses.');
	}

	const addresses = axiosRes.data.values.map((value: any[]) => value[0]) as string[];

	const foundAddress = addresses.find((addr) => addr.toLowerCase() === address.toLowerCase());

	if (foundAddress) {
		res.send(true);
	} else {
		res.send(false);
	}
});

router.get('/tokens/traits', async (req, res) => {
	let snapshots;
	try {
		snapshots = await req.db
			.collection(config.firebase.collectionNames.tokens)
			.where('tokenType', '==', TokenType.Trait)
			.get();
	} catch (e) {
		return res
			.status(ErrorCode.INTERNAL_SERVER_ERROR_500)
			.send(`Failed to get all tokens in the collection.`);
	}

	const tokens: firestore.DocumentData = snapshots.docs.map((doc: firestore.DocumentSnapshot) =>
		doc.data(),
	);

	res.send({ tokens: tokens });
});

router.get('/tokens/:tokenId', async (req, res) => {
	const { tokenId } = req.params || {};
	if (!tokenId) return res.status(ErrorCode.BAD_REQUEST_400).send('Please provider params');

	// db.collection('tokens').doc(tokenId)
	const docRef = await req.db.collection(config.firebase.collectionNames.tokens).doc(tokenId).get();
	if (docRef.exists) res.json({ data: docRef.data(), id: docRef.id });
	else res.status(ErrorCode.NOT_FOUND_404).send(`The token with the id ${tokenId} doesn't exists.`);
});

router.get('/tokens', async (req, res) => {
	const tokenIdsString = req.query.tokenIds;

	if (!tokenIdsString)
		return res.status(ErrorCode.BAD_REQUEST_400).send('Please provider token ids.');

	const tokenIds = JSON.parse(tokenIdsString as string);

	const collectionReference = req.db.collection(config.firebase.collectionNames.tokens);
	const batches = [];

	while (tokenIds.length) {
		const batch = tokenIds.splice(0, 10);
		batches.push(
			collectionReference
				.where(firestore.FieldPath.documentId(), 'in', [...batch])
				.get()
				.then((results) => results.docs.map((result) => ({ ...result.data() }))),
		);
	}

	let tokens;
	try {
		tokens = await Promise.all(batches).then((content) => content.flat());
	} catch (e) {
		console.error(e);
		return res
			.status(ErrorCode.INTERNAL_SERVER_ERROR_500)
			.send(`Failed to retrieve tokens with the ids ${tokenIds}.`);
	}
	console.log(tokens);

	res.json(tokens);
});

router.post('/token', async (req, res) => {
	const { description, external_url, image, name, attributes } = req.body;
	console.log(req.body);

	if (!description || !external_url || !image || !name || !attributes)
		return res
			.status(ErrorCode.BAD_REQUEST_400)
			.send(
				'Please pass these following properties with the body: description, external_url, image, name, attributes',
			);

	let doc;
	try {
		const docRef = await req.db.collection(config.firebase.collectionNames.tokens).add({
			description,
			external_url,
			image,
			name,
			attributes,
		});
		doc = await docRef.get();
	} catch (e) {
		return res.status(ErrorCode.INTERNAL_SERVER_ERROR_500).send('Failed to create a token');
	}

	res.json(doc.data());
});

router.patch('/token', async (req, res) => {
	const { traitIds, masterId } = req.body;

	if (!traitIds || !masterId)
		return res
			.status(ErrorCode.BAD_REQUEST_400)
			.send('Please provide following properies on body: traitIds & masterId');

	const masterDocRef = req.db
		.collection(config.firebase.collectionNames.tokens)
		.doc(masterId.toString());

	const masterDoc = await masterDocRef.get();
	if (!masterDoc.exists)
		return res
			.status(ErrorCode.NOT_FOUND_404)
			.send(`Master with the tokenId ${masterId} not found`);

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
	// get content identifier
	console.log(
		'Update master nft where CID->',
		fileInfo?.IpfsHash,
		' and ',
		'master id -> ',
		masterId,
	);

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
		await masterDocRef.update({
			traitIds: traitIds,
			image: config.pinata.baseUrl + fileInfo?.IpfsHash,
		});
	} catch (e) {
		console.log(e);
		return res
			.status(ErrorCode.INTERNAL_SERVER_ERROR_500)
			.send(`Failed to update master nft with the id ${masterId}.`);
	}

	res.send(fileInfo);
});

export default router;
