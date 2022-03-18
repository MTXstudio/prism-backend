import { Connection } from '@tableland/sdk';
import { BigNumber } from 'ethers';

export const projectAddedListener = (
	name: string,
	uri: string,
	manager: string,
	projectId: BigNumber,
	tbl: Connection,
) => {
	console.log('project added:', name, uri, manager, projectId.toNumber());
};
