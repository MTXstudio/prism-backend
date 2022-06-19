import dotenv from 'dotenv';
import { ethers } from 'ethers';
import projectAbi from '../project-abi.json';
import tokenAbi from '../token-abi.json';
dotenv.config();

// if (!process.env.ALCHEMY_KEY || !process.env.WALLET_PRIVATE_KEY) {
// 	console.log('process.env.ALCHEMY_KEY or process.env.WALLET_PRIVATE_KEY is undefined');
// 	process.exit(-1);
// }
if (
	process.env.NODE_ENV !== 'development' &&
	!process.env.HEROKU_PG_USERNAME &&
	!process.env.HEROKU_PG_PWD
) {
	console.error('Please provide heroku user & password for production.');
	process.exit(-1);
} else if (!process.env.ALCHEMY_KEY) {
	console.error('Please provide an alchemy api key.');
	process.exit(-1);
}
const projectContractAddress = '0x2E9563618F7cC7B4bef7784750cb8616a8Cb8D32';
const tokenContractAddress = '0x3455371c6A400686024E8f5cA8Fc59dca51A1666';

const provider = new ethers.providers.JsonRpcProvider(
	`https://polygon-mumbai.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`,
);

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
	postgres: {
		user: process.env.NODE_ENV === 'development' ? 'postgres' : process.env.HEROKU_PG_USERNAME,
		pwd: process.env.NODE_ENV === 'development' ? 'postgres' : process.env.HEROKU_PG_PWD,
		port: process.env.NODE_ENV === 'development' ? 5432 : process.env.HEROKU_PG_PORT,
		host: process.env.NODE_ENV === 'development' ? 'localhost' : process.env.HEROKU_PG_HOST,
		dbName: process.env.NODE_ENV === 'development' ? 'prism_test' : process.env.HEROKU_PG_DB,
		// connectionUrl:
		// 	process.env.NODE_ENV === 'development'
		// 		? `postgres://postgres:postgres@localhost:5432/postgres`
		// 		: process.env.HEROKU_PG_CONNECTIONU_URL + '?sslmode=require',
	},
};
