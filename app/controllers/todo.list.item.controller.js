let Promise = require('q').Promise;
let mongoose = require('mongoose');
mongoose.Promise = Promise; // use Q promise
let ObjectId = mongoose.Types.ObjectId;
let moment = require('moment');

let TodoList = require('../models/todo.list');
let TodoListItem = require('../models/todo.list.item');
let ResponseCode = require('../commons/response.code');
let HttpStatus = require('../commons/http.response.code');
let Constants = require('../commons/constants');

// new ApiCustomError('message', 'response code');
let ApiCustomError = require('../errors/api.custom.error');
let ObjectUtils = require('../utils/object.utils');

let todoListItemController = {

	/**
	 * Add a new item to a TODO list
	 */
	addItemToList: (req, res, next) => {
		result = { success: false };
		todoListObjectId = null;
		item = new TodoListItem();
		if (!req.body) {
			result.code = ResponseCode.DATA_EMPTY;
			result.message = 'Please give TODO list item data';
			return res.send(HttpStatus.BAD_REQUEST, result);
		}
		if (!req.params.todoListId) {
			result.code = ResponseCode.RESOURCE_ID_INVALID;
			result.message = 'Please provide TODO list ID to be added to';
			return res.send(HttpStatus.BAD_REQUEST, result);
		}
		try {
			todoListObjectId = ObjectId(req.params.todoListId);
		} catch (e) {
			result.code = ResponseCode.RESOURCE_ID_INVALID;
			result.message = 'Invalid TODO list ID';
			return res.send(HttpStatus.BAD_REQUEST, result);
		}
		if (!req.body.title) {
			result.code = ResponseCode.TODO_LIST_ITEM_TITLE_INVALID;
			result.message = 'Please give a valid title to the item';
			return res.send(HttpStatus.BAD_REQUEST, result);
		}
		item.title = req.body.title;
		if (!req.body.time) {
			result.code = ResponseCode.TODO_LIST_ITEM_TIME_INVALID;
			result.message = 'Please give a time to start';
			return res.send(HttpStatus.BAD_REQUEST, result);
		}
		time = moment();
		timeValid = false;
		try {
			time = moment(req.body.time);
			timeValid = time.isValid();
		} catch (e) {
			timeValid = false;
		}
		if (!timeValid) {
			result.code = ResponseCode.TODO_LIST_ITEM_TIME_INVALID;
			result.message = 'Starting time is not valid';
			return res.send(HttpStatus.BAD_REQUEST, result);
		}
		item.time = time;
		item.enableAlert = req.body.enableAlert ? true : false;
		// location data
		item.location = {};
		item.location.address = {};
		item.location.geoData = {};
		req.body.location = req.body.location || {};
		req.body.location.address = req.body.location.address || {};
		req.body.location.geoData = req.body.location.geoData || {};
		item.location.address.streetAddress = req.body.location.streetAddress || {};
		item.location.address.suburb = req.body.location.address.suburb;
		item.location.address.state = req.body.location.address.state;
		item.location.address.country = req.body.location.address.country;
		item.location.address.zipCode = req.body.location.address.zipCode;
		// validate latitude
		if (!checkRange(
			req.body.location.geoData.latitude,
			Constants.MIN_LATITUDE,
			Constants.MAX_LATITUDE)
		) {
			result.code = ResponseCode.RESOURCE_LOCATION_LATITUDE_INVALID;
			result.message = 'Please give a valid latitude';
			return res.send(HttpStatus.BAD_REQUEST, result);
		}
		item.location.geoData.latitude = req.body.location.geoData.latitude;
		// validate longitude
		if (!checkRange(
			req.body.location.geoData.longitude,
			Constants.MIN_LONGITUDE,
			Constants.MAX_LONGITUDE)) {
			result.code = ResponseCode.RESOURCE_LOCATION_LONGITUDE_INVALID;
			result.message = 'Please give a valid longitude';
			return res.send(HttpStatus.BAD_REQUEST, result);
		}
		item.location.geoData.longitude = req.body.location.geoData.longitude;
		// validate todo list from db
		TodoList
		.findOne({
			'avail': true,
			'_id': todoListObjectId
		})
		.select({
			version: 1
		})
		.exec()
		.then(dbList => {
			if (!dbList) {
				// not found
				result.code = ResponseCode.RESOURCE_NOT_FOUND;
				result.message = 'Could not find TODO list which the item is to be added to';
				return res.send(HttpStatus.NOT_FOUND, result);
			}
			ObjectUtils.setObjectDefaultFields(item);
			return TodoList
				.update({
					'_id': todoListObjectId,
					'version': dbList.version,
					'avail': true
				}, {
					'$set': {
						'version': dbList.version + 1
					},
					'$push': {
						'items': item
					}
				});
		})
		.then(updResult => {
			if (!updResult || updResult.ok != 1 || updResult.nModified != 1) {
				result.code = ResponseCode.RESOURCE_UPDATE_VERSION_EXPIRED;
				result.message = 'Failed to add new item, please try again';
				return res.send(HttpStatus.INTERNAL_SERVER_ERROR, result);
			}
			result.success = true;
			result.data = { '_id': item._id };
			result.message = 'Item added to TODO list';
			return res.send(HttpStatus.CREATED, result);
		})
		.catch(e => {
			console.log(e);
			result.code = ResponseCode.SYSTEM_ERROR;
			result.message = 'Failed to add item to TODO list due to a system error';
			return res.send(HttpStatus.INTERNAL_SERVER_ERROR, result);
		})
		.done();
	},

	updateItemInList: (req, res, next) => {
		result = { 'success': false };
		todoListObjectId = null;
		todoListItemObjectId = null;
		item = {};
		if (!req.body) {
			result.code = ResponseCode.DATA_EMPTY;
			result.message = 'Please give TODO list item data';
			return res.send(HttpStatus.BAD_REQUEST, result);
		}
		if (!req.params.todoListId) {
			result.code = ResponseCode.RESOURCE_ID_INVALID;
			result.message = 'Please provide TODO list ID to be added to';
			return res.send(HttpStatus.BAD_REQUEST, result);
		}
		try {
			todoListObjectId = ObjectId(req.params.todoListId);
		} catch (e) {
			result.code = ResponseCode.RESOURCE_ID_INVALID;
			result.message = 'Invalid TODO list ID';
			return res.send(HttpStatus.BAD_REQUEST, result);
		}
		if (!req.params.itemId) {
			result.code = ResponseCode.RESOURCE_ID_INVALID;
			result.message = 'Please give the ID of the item to be retrieved';
			return res.send(HttpStatus.BAD_REQUEST, result);
		}
		try {
			todoListItemObjectId = ObjectId(req.params.itemId);
		} catch (e) {
			result.code = ResponseCode.RESOURCE_ID_INVALID;
			result.message = 'Invalid TODO list item ID';
			return res.send(HttpStatus.BAD_REQUEST, result);
		}
		if (!req.body.title) {
			result.code = ResponseCode.TODO_LIST_ITEM_TITLE_INVALID;
			result.message = 'Please give a valid title to the item';
			return res.send(HttpStatus.BAD_REQUEST, result);
		}
		item.title = req.body.title;
		if (!req.body.time) {
			result.code = ResponseCode.TODO_LIST_ITEM_TIME_INVALID;
			result.message = 'Please give a time to start';
			return res.send(HttpStatus.BAD_REQUEST, result);
		}
		item.description = req.body.description || '';
		time = moment();
		timeValid = false;
		try {
			time = moment(req.body.time);
			timeValid = time.isValid();
		} catch (e) {
			timeValid = false;
		}
		if (!timeValid) {
			result.code = ResponseCode.TODO_LIST_ITEM_TIME_INVALID;
			result.message = 'Starting time is not valid';
			return res.send(HttpStatus.BAD_REQUEST, result);
		}
		item.time = time;
		item.enableAlert = req.body.enableAlert ? true : false;
		// location data
		item.location = {};
		item.location.address = {};
		item.location.geoData = {};
		req.body.location = req.body.location || {};
		req.body.location.address = req.body.location.address || {};
		req.body.location.geoData = req.body.location.geoData || {};
		item.location.address.streetAddress = req.body.location.streetAddress || {};
		item.location.address.suburb = req.body.location.address.suburb;
		item.location.address.state = req.body.location.address.state;
		item.location.address.country = req.body.location.address.country;
		item.location.address.zipCode = req.body.location.address.zipCode;
		// validate latitude
		if (!checkRange(
			req.body.location.geoData.latitude,
			Constants.MIN_LATITUDE,
			Constants.MAX_LATITUDE)
		) {
			result.code = ResponseCode.RESOURCE_LOCATION_LATITUDE_INVALID;
			result.message = 'Please give a valid latitude';
			return res.send(HttpStatus.BAD_REQUEST, result);
		}
		item.location.geoData.latitude = req.body.location.geoData.latitude;
		// validate longitude
		if (!checkRange(
			req.body.location.geoData.longitude,
			Constants.MIN_LONGITUDE,
			Constants.MAX_LONGITUDE)
		) {
			result.code = ResponseCode.RESOURCE_LOCATION_LONGITUDE_INVALID;
			result.message = 'Please give a valid longitude';
			return res.send(HttpStatus.BAD_REQUEST, result);
		}
		item.location.geoData.longitude = req.body.location.geoData.longitude;
		TodoList
		.findOne({
			'_id': todoListObjectId,
			'avail': true,
			'items._id': todoListItemObjectId,
		})
		.select({
			'version': 1,
			'items': {
				'$elemMatch': {
					'avail': true
				}
			}
		})
		.exec()
		.then(dbItem => {
			if (!dbItem) {
				result.code = ResponseCode.RESOURCE_NOT_FOUND;
				result.message = 'Could not find TODO list';
				return res.send(HttpStatus.NOT_FOUND, result);
			}
			if (!dbItem.items || dbItem.items.length != 1 || !dbItem.items[0].avail) {
				result.code = ResponseCode.RESOURCE_NOT_FOUND;
				result.message = 'Could not find item from TODO list';
				return res.send(HttpStatus.NOT_FOUND, result);
			}
			// update
			return TodoList
				.update({
					'_id': todoListObjectId,
					'avail': true,
					'items._id': todoListItemObjectId,
					'items.avail': true
				}, {
					'$set': {
						'items.$.title': item.title,
						'items.$.description': item.description,
						'items.$.time': item.time,
						'items.$.enableAlert': item.enableAlert,
						'items.$.location': item.location
					}
				});
		})
		.then(updResult => {
			if (!updResult || updResult.ok != 1 || updResult.nModified != 1) {
				result.code = ResponseCode.RESOURCE_UPDATE_VERSION_EXPIRED;
				result.message = 'Failed to update item, please try again';
				return res.send(HttpStatus.INTERNAL_SERVER_ERROR, result);
			}
			result.success = true;
			result.data = {};
			result.message = 'Item updated';
			return res.send(HttpStatus.OK, result);
		})
		.catch()
		.done();
	},

	removeItemFromList: (req, res, next) => {
		result = { 'success': false };
		todoListObjectId = null;
		todoListItemObjectId = null;
		if (!req.params.todoListId) {
			result.code = ResponseCode.RESOURCE_ID_INVALID;
			result.message = 'Please give the ID of TODO list whose items to be retrieved';
			return res.send(HttpStatus.BAD_REQUEST, result);
		}
		if (!req.params.itemId) {
			result.code = ResponseCode.RESOURCE_ID_INVALID;
			result.message = 'Please give the ID of the item to be retrieved';
			return res.send(HttpStatus.BAD_REQUEST, result);
		}
		try {
			todoListObjectId = ObjectId(req.params.todoListId);
		} catch (e) {
			result.code = ResponseCode.RESOURCE_ID_INVALID;
			result.message = 'Invalid TODO list ID';
			return res.send(HttpStatus.BAD_REQUEST, result);
		}
		try {
			todoListItemObjectId = ObjectId(req.params.itemId);
		} catch (e) {
			result.code = ResponseCode.RESOURCE_ID_INVALID;
			result.message = 'Invalid TODO list item ID';
			return res.send(HttpStatus.BAD_REQUEST, result);
		}
		TodoList
		.findOne({
			'_id': todoListObjectId,
			'avail': true,
			'items._id': todoListItemObjectId,
		})
		.select({
			'version': 1,
			'items': {
				'$elemMatch': {
					'avail': true
				}
			}
		})
		.exec()
		.then(dbItem => {
			if (!dbItem) {
				result.code = ResponseCode.RESOURCE_NOT_FOUND;
				result.message = 'Could not find TODO list';
				return res.send(HttpStatus.NOT_FOUND, result);
			}
			if (!dbItem.items || dbItem.items.length != 1) {
				result.code = ResponseCode.RESOURCE_NOT_FOUND;
				result.message = 'Could not find item from TODO list';
				return res.send(HttpStatus.NOT_FOUND, result);
			}
			return TodoList
				.update({
					'_id': todoListObjectId,
					'avail': true,
					'items._id': todoListItemObjectId,
					'items.avail': true,
					'items.version': dbItem.items[0].version,
					'version': dbItem.version
				}, {
					'$set': {
						'version': dbItem.version + 1,
						'items.$.avail': false,
						'items.$.version': dbItem.items[0].version + 1
					}
				});
		})
		.then(updResult => {
			if (!updResult || updResult.ok != 1 || updResult.nModified != 1) {
				result.code = ResponseCode.RESOURCE_UPDATE_VERSION_EXPIRED;
				result.message = 'Failed to remove the item, please try again';
				return res.send(HttpStatus.INTERNAL_SERVER_ERROR, result);
			}
			result.success = true;
			result.data = {};
			result.message = 'Item removed';
			return res.send(HttpStatus.OK, result);
		})
		.catch(e => {
			console.log(e);
			result.code = ResponseCode.SYSTEM_ERROR;
			result.message = 'Failed to remove the item due to a system error';
			return res.send(HttpStatus.INTERNAL_SERVER_ERROR, result);
		})
		.done()
	},

	/**
	 * Retrieve all items from TODO list
	 */
	getAllItemsUnderList: (req, res, next) => {
		result = { 'success': false };
		todoListObjectId = null;
		if (!req.params.todoListId) {
			result.code = ResponseCode.RESOURCE_ID_INVALID;
			result.message = 'Please give the ID of TODO list whose items to be retrieved';
			return res.send(HttpStatus.BAD_REQUEST, result);
		}
		try {
			todoListObjectId = ObjectId(req.params.todoListId);
		} catch (e) {
			result.code = ResponseCode.RESOURCE_ID_INVALID;
			result.message = 'Invalid TODO list ID';
			return res.send(HttpStatus.BAD_REQUEST, result);
		}
		TodoList
		.findOne({
			'_id': todoListObjectId,
			'avail': true
		})
		.select({
			'items.avail': 0,
			'items.version': 0,
			'items.__v': 0,
			'items': {
				'$elemMatch': {
					'avail': true
				}
			}
		})
		.exec()
		.then(dbList => {
			if (!dbList) {
				result.code = ResponseCode.RESOURCE_NOT_FOUND;
				result.message = 'Could not find TODO list';
				return res.send(HttpStatus.NOT_FOUND, result);
			}
			result.success = true;
			result.data = dbList.items || [];
			result.message = 'Items got from TODO list';
			return res.send(HttpStatus.OK, result);
		})
		.catch(e => {
			console.log(e);
			result.code = ResponseCode.SYSTEM_ERROR;
			result.message = 'Failed to retrieve items due to a system error';
			return res.send(HttpStatus.INTERNAL_SERVER_ERROR, result);
		})
		.done();
	},

	/**
	 * Get a single item from TODO list
	 */
	getSingleItemUnderList: (req, res, next) => {
		result = { 'success': false };
		todoListObjectId = null;
		todoListItemObjectId = null;
		if (!req.params.todoListId) {
			result.code = ResponseCode.RESOURCE_ID_INVALID;
			result.message = 'Please give the ID of TODO list whose items to be retrieved';
			return res.send(HttpStatus.BAD_REQUEST, result);
		}
		if (!req.params.itemId) {
			result.code = ResponseCode.RESOURCE_ID_INVALID;
			result.message = 'Please give the ID of the item to be retrieved';
			return res.send(HttpStatus.BAD_REQUEST, result);
		}
		try {
			todoListObjectId = ObjectId(req.params.todoListId);
		} catch (e) {
			result.code = ResponseCode.RESOURCE_ID_INVALID;
			result.message = 'Invalid TODO list ID';
			return res.send(HttpStatus.BAD_REQUEST, result);
		}
		try {
			todoListItemObjectId = ObjectId(req.params.itemId);
		} catch (e) {
			result.code = ResponseCode.RESOURCE_ID_INVALID;
			result.message = 'Invalid TODO list item ID';
			return res.send(HttpStatus.BAD_REQUEST, result);
		}
		TodoList
		.findOne({
			'_id': todoListObjectId,
			'avail': true
		})
		.select({
			'items': {
				'$elemMatch': {
					'_id': todoListItemObjectId,
					'avail': true
				}
			}
		})
		.exec()
		.then(dbItem => {
			if (!dbItem) {
				result.code = ResponseCode.RESOURCE_NOT_FOUND;
				result.message = 'Could not find TODO list';
				return res.send(HttpStatus.NOT_FOUND, result);
			}
			if (!dbItem.items || dbItem.items.length != 1) {
				result.code = ResponseCode.RESOURCE_NOT_FOUND;
				result.message = 'Could not find item from TODO list';
				return res.send(HttpStatus.NOT_FOUND, result);
			}
			dbItem.items[0].avail = undefined;
			dbItem.items[0].version = undefined;
			dbItem.items[0].__v = undefined;
			result.success = true;
			result.data = dbItem.items[0];
			result.message = 'Item got';
			return res.send(HttpStatus.OK, result);
		})
		.catch(e => {})
		.done();
	}
}

/**
 * Check the range of the number between (min, max)
 *
 * @param num the number to be checked
 * @param min minimum of the range
 * @param max maximum of the range
 * @return if the number stays within the range
 */
let checkRange = (num, min, max) => {
	if (num != null && (num > max || num < min)) {
		return false;
	}
	return true;
}

module.exports = todoListItemController;