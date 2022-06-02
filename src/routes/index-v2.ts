import express, { Request } from 'express';
import { ErrorCode } from '../helpers/enums/error-code';
import Project from '../models/project.model';
import Collection from '../models/collection.model';

const router = express.Router();

router.post('/project', async (req: Request, res) => {
	console.log(req.body);
	const { name, owner, description, traitTypes, externalUrl } = req.body || {};

	if (!name || !owner || !description || !traitTypes || !externalUrl) {
		return res.status(ErrorCode.BAD_REQUEST_400).send('.');
	}

	// const project = new Project({ name, owner, description, traitTypes, externalUrl });

	let project;
	try {
		project = await Project.create({ name, owner, description, traitTypes, externalUrl });
	} catch (e) {
		console.error(`Failed to save a project with the name ${name} for the owner ${owner}. ${e}`);
		return res
			.status(ErrorCode.INTERNAL_SERVER_ERROR_500)
			.send(`Failed to save a project with the name ${name} for the owner ${owner}`);
	}

	res.json(project.toJSON());
});

router.get('/project/:id', async (req, res) => {
	const { id } = req.params;

	if (!id) {
		return res
			.status(ErrorCode.INTERNAL_SERVER_ERROR_500)
			.send('Bad Request: forgot to pass projectId.');
	}

	let project;
	try {
		project = await Project.findByPk(id);
	} catch (e) {
		console.error(`Failed to get a project by the id ${id}. ${e}`);
		return res
			.status(ErrorCode.INTERNAL_SERVER_ERROR_500)
			.send(`Failed to get a project by the id ${id}.`);
	}

	res.send(project);
});

router.get('/projects', async (req, res) => {
	let projects;
	try {
		projects = await Project.findAll({});
	} catch (e) {
		console.error(`Failed to get projects. ${e}`);
		return res
			.status(ErrorCode.INTERNAL_SERVER_ERROR_500)
			.send('Failed to get all the project from databse.');
	}

	res.json(projects);
});

router.post('/collection', async (req, res) => {
	const { name, projectId, roaylties, maxSupply, manager, collectionType, paused } = req.body;

	let collection;
	try {
		collection = await Collection.create({
			name,
			projectId,
			roaylties,
			maxSupply,
			manager,
			collectionType,
			paused,
		});
	} catch (e) {
		console.error(
			`Failed to save a project with the name ${name} for the projectId ${projectId}. ${e}`,
		);
		return res
			.status(ErrorCode.INTERNAL_SERVER_ERROR_500)
			.send(`Failed to save a project with the name ${name} for the projectId ${projectId}.`);
	}

	res.send(collection);
});

router.get('/collection/:id', async (req, res) => {
	const { id } = req.params;

	if (!id) {
		return res
			.status(ErrorCode.INTERNAL_SERVER_ERROR_500)
			.send('Bad Request: forgot to pass collectionId.');
	}

	let collection;
	try {
		collection = await Collection.findByPk(id);
	} catch (e) {
		console.error(`Failed to get a collection by the id ${id}. ${e}`);
		return res
			.status(ErrorCode.INTERNAL_SERVER_ERROR_500)
			.send(`Failed to get a collection by the id ${id}.`);
	}

	res.send(collection);
});
router.patch('/project', async (req, res) => {
	const { id } = req.body;
	const keys = Object.keys(req.body);
	if (!id) {
		return res.status(ErrorCode.BAD_REQUEST_400).send('Forgot to attach id to body');
	} else if (keys.length < 2) {
		return res.status(ErrorCode.BAD_REQUEST_400).send('No update values inside body');
	}

	let project;

	try {
		project = await Project.update(req.body, { where: { id } });
	} catch (e) {
		console.error(`Failed to update a project with the update body ${req.body}. ${e}`);
		return res
			.status(ErrorCode.INTERNAL_SERVER_ERROR_500)
			.send(`Failed to update a project with the update body ${req.body}.`);
	}
	res.json(project);
});

router.patch('/collection', async (req, res) => {
	const { id } = req.body;
	const keys = Object.keys(req.body);
	if (!id) {
		return res.status(ErrorCode.BAD_REQUEST_400).send('Forgot to attach id to body');
	} else if (keys.length < 2) {
		return res.status(ErrorCode.BAD_REQUEST_400).send('No update values inside body');
	}

	let collection;

	try {
		collection = await Collection.update(req.body, { where: { id } });
	} catch (e) {
		console.error(`Failed to update a collection with the update body ${req.body}. ${e}`);
		return res
			.status(ErrorCode.INTERNAL_SERVER_ERROR_500)
			.send(`Failed to update a collection with the update body ${req.body}.`);
	}
	res.json(collection);
});

router.post('/token', (req, res) => {
	const {} = req.body;

	try {
	} catch (e) {
		console.error(``);
		return res.status(ErrorCode.INTERNAL_SERVER_ERROR_500).send(``);
	}
});

export default router;
