import dotenv from 'dotenv';
import { ethers } from 'ethers';
import projectAbi from '../project-abi.json';
import tokenAbi from '../token-abi.json';
dotenv.config();

// if (!process.env.ALCHEMY_KEY || !process.env.WALLET_PRIVATE_KEY) {
// 	console.log('process.env.ALCHEMY_KEY or process.env.WALLET_PRIVATE_KEY is undefined');
// 	process.exit(-1);
// }

const projectContractAddress = '0x469D67405f4AFDe9b72F90D1a68572A76a2883EE';
const tokenContractAddress = '0xC71952Ae6dD074e1a915dfF4E3a27456526d61f1';

const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');

const signer = provider.getSigner();
const projectContract = new ethers.Contract(projectContractAddress, projectAbi, signer);
const tokenContract = new ethers.Contract(tokenContractAddress, tokenAbi, signer);

export const config = {
	alchemy: {
		key: process.env.ALCHEMY_KEY || '',
	},
	wallet: {
		privateKey: process.env.WALLET_PRIVATE_KEY || '',
	},
	server: {
		port: process.env.PORT || 5000,
	},
	contract: {
		project: projectContract,
		token: tokenContract,
	},
	firebase: {
		projectId: process.env.FIREBASE_PROJECT_ID,
		privateKey: (process.env.FIREBASE_PRIVATE_KEY as string).replace(/\\n/g, '\n'),
		clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
		collectionNames: {
			tokens:
				process.env.NODE_ENV === 'development'
					? 'tokens-betaspaceship-full'
					: 'tokens-betaspaceship-full',
		},
	},
	pinata: {
		apiKey: process.env.PINATA_API_KEY || '',
		secretKey: process.env.PINATA_SECRET_KEY || '',
		jwt: process.env.PINATA_JWT || '',
		baseUrl: 'https://gateway.pinata.cloud/ipfs/',
	},
	google: {
		apiKey: process.env.GOOGLE_API_KEY,
	},
};
