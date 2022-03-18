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
		port: process.env.PORT || 3000,
	},
	contract: {
		address: '0x1E33F210A9581f127eb93ee0eB2F8fe419414545',
	},
};
