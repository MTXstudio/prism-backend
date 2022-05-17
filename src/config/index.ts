import dotenv from 'dotenv';
dotenv.config();

// if (!process.env.ALCHEMY_KEY || !process.env.WALLET_PRIVATE_KEY) {
// 	console.log('process.env.ALCHEMY_KEY or process.env.WALLET_PRIVATE_KEY is undefined');
// 	process.exit(-1);
// }

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
		address: '0x7a2ffDc74520801764BDB6499DaD81f05384Bd33',
	},
	firebase: {
		projectId: process.env.FIREBASE_PROJECT_ID,
		privateKey: (process.env.FIREBASE_PRIVATE_KEY as string).replace(/\\n/g, '\n'),
		clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
		collectionNames: {
			tokens:
				process.env.NODE_ENV === 'development' ? 'tokens-betaspaceship' : 'tokens-betaspaceship',
		},
	},
	pinata: {
		apiKey: process.env.PINATA_API_KEY || '',
		secretKey: process.env.PINATA_SECRET_KEY || '',
		jwt: process.env.PINATA_JWT || '',
		baseUrl: 'https://gateway.pinata.cloud/ipfs/',
	},
};
