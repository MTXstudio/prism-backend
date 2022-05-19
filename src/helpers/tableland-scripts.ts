export const projectTableScript = () =>
	'CREATE TABLE Project (id int, name varchar(255), uri varchar(255), manager varchar(255), PRIMARY KEY (id));';

export const collectionTableScript = () =>
	'CREATE TABLE Collection (id int, projectId int, name varchar(255), invocations int, maxInvocations int, collectionURI varchar(255), paused bool, locked bool, PRIMARY KEY (id), FOREIGN KEY (projectId) REFERENCES project_580(id));';

export const tokenTableScript = () =>
	'CREATE TABLE Token (id int, projectId int, collectionId int, name varchar(255), maxSupply int, tokenPriceInWei int, tokenURI varchar(255), paused bool, locked bool, PRIMARY KEY (id), FOREIGN KEY (projectId), FOREIGN KEY (collectionId))';
