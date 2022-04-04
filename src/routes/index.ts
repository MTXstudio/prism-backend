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
// import pinataSDK from '@pinata/sdk';

const router = express.Router();

router.get('/', (req, res) => {
	res.send('<h1>Welcome to1</h1>');
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

router.get('/tokens/:tokens', async (req, res) => {
	const tokenIds = req.params.tokens;

	if (!tokenIds) return res.status(ErrorCode.BAD_REQUEST_400).send('Please provider trait ids.');

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
	// db.collection('tokens').doc(tokenId)
	let docRef;
	try {
		docRef = await req.db.collection(config.firebase.collectionNames.tokens).add({
			name: (Math.random() + 1).toString(36).substring(7),
		});
	} catch (e) {
		return res.send({ success: false, message: 'Failed to add a token' });
	}

	const doc = await docRef?.get();

	res.json({ success: true, data: doc?.data() || {} });
});

router.patch('/token', async (req, res) => {
	//body contains => traitIds, masterId
	const { traitIds, masterId } = req.body;

	if (!traitIds || !masterId)
		return res
			.status(ErrorCode.BAD_REQUEST_400)
			.send('Please provide following properies on body: traitIds & masterId');

	const masterDocRef = req.db.collection(config.firebase.collectionNames.tokens).doc(masterId);
	const masterDoc = await masterDocRef.get();
	if (!masterDoc.exists)
		return res
			.status(ErrorCode.NOT_FOUND_404)
			.send(`Master with the tokenId ${masterId} not found`);

	const baseUrl =
		'https://sentientmachine.mypinata.cloud/ipfs/Qmbg2pbztK7T4MKe886HSSjNK1Gz4H8v4xHqSdhpthaueB';

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

	let updateResult;
	try {
		updateResult = await masterDocRef.update({
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

	res.send({
		success: true,
		fileInfo,
	});
});

export default router;
