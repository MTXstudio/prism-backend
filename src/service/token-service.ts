export const getContentById = (ids: string[]) => {
	// don't run if there aren't any ids or a path for the collection
	// if (!ids || !ids.length || !path) return [];
	// const collectionPath = db.collection(path);
	// const batches = [];
	// while (ids.length) {
	// 	// firestore limits batches to 10
	// 	const batch = ids.splice(0, 10);
	// 	// add the batch request to to a queue
	// 	batches.push(
	// 		collectionPath
	// 			.where(firebase.firestore.FieldPath.documentId(), 'in', [...batch])
	// 			.get()
	// 			.then((results) =>
	// 				results.docs.map((result) => ({ /* id: result.id, */ ...result.data() })),
	// 			),
	// 	);
	// }
	// // after all of the data is fetched, return it
	// return Promise.all(batches).then((content) => content.flat());
};
