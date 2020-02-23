const fs = require('fs')
const path = require('path')

require("dotenv").config({
	path: `.env.${process.env.NODE_ENV}`,
})

let rootPath = process.env.AGILITY_LOCAL_CACHE_FOLDER;
if (!rootPath) rootPath = ".agility-files";

const getFilePath = ({ itemType, languageCode, itemID }) => {
	const fileName = `${itemID}.json`;

	return path.join(rootPath, languageCode, itemType, fileName);
}

const saveItem = async ({ item, itemType, languageCode, itemID }) => {

	let filePath = getFilePath({ itemType, languageCode, itemID });

	let dirPath = path.dirname(filePath);


	if (!fs.existsSync(dirPath)) {
		fs.mkdirSync(dirPath, { recursive: true });
	}

	let json = JSON.stringify(item);
	fs.writeFileSync(filePath, json);
}

const deleteItem = async ({ itemType, languageCode, itemID }) => {

	let filePath = getFilePath({ itemType, languageCode, itemID });

	if (fs.existsSync(filePath)) {
		fs.unlinkSync(filePath);
	}

}

const mergeItemToList = async ({ item, languageCode, itemID, referenceName, definitionName }) => {

	let contentList = await getItem({ itemType: "list", languageCode, itemID: referenceName });

	if (contentList == null) {
		//initialize the list
		contentList = [item];
	} else {
		//replace the item...
		const cIndex = contentList.findIndex((ci) => {
			return ci.contentID === itemID;
		});

		if (item.properties.state === 3) {
			//*** deleted item (remove from the list) ***
			if (cIndex >= 0) {
				//remove the item
				contentList.splice(cIndex, 1);
			}

		} else {
			//*** regular item (merge) ***
			if (cIndex >= 0) {
				//replace the existing item
				contentList[cIndex] = item;
			} else {
				//and it to the end of the
				contentList.push(item);
			}
		}
	}

	await saveItem({ item: contentList, itemType: "list", languageCode, itemID: referenceName });
}

const getItem = async ({ itemType, languageCode, itemID }) => {
	let filePath = getFilePath({ itemType, languageCode, itemID });

	if (!fs.existsSync(filePath)) return null;

	let json = fs.readFileSync(filePath, 'utf8');
	return JSON.parse(json);
}

const clearItems = async () => {
	fs.rmdirSync(rootPath, { recursive: true })
}


module.exports = {
	saveItem: saveItem,
	deleteItem: deleteItem,
	getItem: getItem,
	clearItems: clearItems,
	mergeItemToList: mergeItemToList
}