import { config } from '../config/index';
import { ErrorCode } from '../helpers/enums/error-code';
import express from 'express';
import sharp from 'sharp';
import axios from 'axios';
import { firestore } from 'firebase-admin';
import fs from 'fs';
import pinataSDK from '@pinata/sdk';
import { TokenType } from '../helpers/enums/token-type';

const whiteListAddresses = [
	'0x6BbEF4ce6Fa65d1f009918B00240AB009b40552a',
	'0x7C5CC6d1dC1a297CFbb71A37e1c7a72F519204C1',
	'0xD6f360590FAa66F9E3CACDCf5CCa633cB3721D92',
	'0x10836d93f39CC896651C210084f98b63E1055529',
	'0xe93F7bAd98e3742cE5c046e58F7084165243725a',
	'0xD93a5F13fbc22bC7733553FA3000b394C28485c5',
	'0x17dF1FAfEFDb096Ff53230EaadaAd25FAfae8BD0',
	'0x20c467db9b9fe0fa39d879b3f23c475582da2fba',
	'0xf7791248951da4f9221fe4efa0a3a9825b48861d',
	'0x6c7413E76cC6aE39a4B17dDD2b9B27b6C11cf359',
	'0x1Ca7fD1aA6fC8afa541D4e5B049812B6cD976b09',
	'0xCE8e2e39674da0A7bAcf1cD4BBCeC514404949f9',
	'0x7cf6CAd5F7c5eB24BEA6d79EA082f986583926C4',
	'0xC61813Dd7Af58Ce3439BE1D91F79469E5Dc1B326',
	'0x6620DF04CFc6fC69E0969062F4c427cA3b4a7f90',
	'0x67a32e5b2E3923f6575269b4F77055dD370bC629',
	'0xe0bC3649F98a9c11407e14109440e7B70969E502',
	'0x6fc933944c659f156B121DE0f54c50E22Eebe066',
	'0x016546408c22259CeC9BaA4F442a64a5cA161701',
];
const pinata = pinataSDK(config.pinata.apiKey, config.pinata.secretKey);

const router = express.Router();

router.get('/', (req, res) => {
	res.send('<h1>Welcome to1</h1>');
});

router.get('/whitelisted/:address', (req, res) => {
	const { address } = req.params;
	if (!address) return res.status(ErrorCode.BAD_REQUEST_400).send('address property not found.');

	const foundAddress = whiteListAddresses.find((addr) => addr === address);
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

	let snapshot;
	try {
		snapshot = await req.db
			.collection(config.firebase.collectionNames.tokens)
			.where(firestore.FieldPath.documentId(), 'in', tokenIds)
			.get();
	} catch (e) {
		console.error(e);
		return res.status(ErrorCode.INTERNAL_SERVER_ERROR_500).send({
			success: false,
			message: `Failed to retrieve tokens with the ids ${tokenIds}.`,
		});
	}

	const docs: firestore.DocumentData[] = [];
	snapshot.forEach((doc) => {
		docs.push(doc.data());
	});

	res.send(docs);
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
	//body contains => traitIds, masterId
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
		'https://algobits.mypinata.cloud/ipfs/QmWv6JsEV77UhzG6hLMjczuZ5seAiRN6TcGNRHg5JwR2KD/';

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

	// update masterNft traitIds, imageURI

	//Upload to ipfs ->

	res.send(fileInfo);
});

export default router;
