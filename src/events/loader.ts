import { Connection } from '@tableland/sdk';
import { ethers } from 'ethers';
import { config } from '../config/index';
import abi from '../abi.json';
import { projectAddedListener } from './contract_event_listeners';

const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');
const signer = provider.getSigner();
const contract = new ethers.Contract(config.contract.address, abi, signer);

export const contractEventLoader = (tbl: Connection) => {
	// tbl.list().then(console.log); // prints out tableland tables
	contract.on('ProjectAdded', (name, uri, manager, projectId) => {
		projectAddedListener(name, uri, manager, projectId, tbl);
	});

	// To be continued
	// contract.on('EventName', (args) => {
	// 	eventListener(args, tbl);
	// });
};
