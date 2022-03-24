import dotenv from 'dotenv';
dotenv.config();

if (!process.env.ALCHEMY_KEY || !process.env.WALLET_PRIVATE_KEY) {
	console.log('process.env.ALCHEMY_KEY or process.env.WALLET_PRIVATE_KEY is undefined');
	process.exit(-1);
}

export const config = {
	alchemy: {
		key: process.env.ALCHEMY_KEY || '',
	},
	wallet: {
		privateKey: process.env.WALLET_PRIVATE_KEY || '',
	},
	server: {
		port: process.env.PORT || 3001,
	},
	contract: {
		address: '0x2A69AB2c7B4ac80aC0E45C6DA036F5dFc7433772',
	},
};
