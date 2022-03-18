import { connect } from '@tableland/sdk';
import { ethers } from 'ethers';
import { config } from '../config/index';

const provider = new ethers.providers.AlchemyProvider('rinkeby', config.alchemy.key);
const wallet = new ethers.Wallet(config.wallet.privateKey);
const signer = wallet.connect(provider);

export const connectToTableLand = async () => {
	let tbl;
	try {
		tbl = await connect({ network: 'testnet', signer });
	} catch (e) {
		console.error('connectToTableLand failed:', e);
		return;
	}
	return tbl;
};
