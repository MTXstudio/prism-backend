import { config } from '../config/index';
import {
	collectionCreatedListener,
	collectionEditListener,
	masterEditListener,
	projectCreatedListener,
	projectEditListener,
	tokenCreatedListener,
	tokenEditListener,
} from './event-listeners';

export const contractEventLoader = async () => {
	config.contract.project.on('ProjectCreated', projectCreatedListener);
	config.contract.project.on('CollectionCreated', collectionCreatedListener);
	config.contract.token.on('TokenCreated', tokenCreatedListener);
	config.contract.project.on('ProjectEdit', projectEditListener);
	config.contract.project.on('CollectionEdit', collectionEditListener);
	config.contract.token.on('TokenEdit', tokenEditListener);
	config.contract.token.on('MasterEdit', masterEditListener);
};
