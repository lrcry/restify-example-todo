let Promise = require('q').Promise;
let request = require('superagent-promise')(require('superagent'), Promise);
let Base64 = require('js-base64').Base64;
let mongoose = require('mongoose');
mongoose.Promise = Promise; // use Q promise
let ObjectId = mongoose.Types.ObjectId;

let TodoList = require('../models/todo.list');
let ResponseCode = require('../commons/response.code');
let HttpStatus = require('../commons/http.response.code');
let Constants = require('../commons/constants');
let ObjectUtils = require('../utils/object.utils');
let TodoListUtils = require('../utils/todo.list.utils');

let ApiCustomError = require('../errors/api.custom.error');

let todoListController = {

	/**
	 * Add a new TODO list
	 */
	addNewTodoList: (req, res, next) => {
		result = { 'success': false };
		if (!req.body) {
			result.code = ResponseCode.DATA_EMPTY;
			result.message = 'Please provide TODO list data';
			return res.send(HttpStatus.BAD_REQUEST, result);
		}
		if (!req.body.title) {
			result.code = ResponseCode.TODO_LIST_TITLE_INVALID;
			result.message = 'Please give a title';
			return res.send(HttpStatus.BAD_REQUEST, result);
		}
		todoList = new TodoList();
		TodoListUtils.createTodoListObject(req.body, todoList);
		ObjectUtils.setObjectDefaultFields(todoList);
		// put into mongodb
		todoList
		.save()
		.then(() => {
			// insert successful
			result.success = true;
			result.data = { '_id': todoList._id };
			result.message = 'TODO list successfully added';
			return res.send(HttpStatus.CREATED, result);
		})
		.catch((e) => {
			// insert error
			result.code = ResponseCode.SYSTEM_ERROR;
			result.message = 'Failed to add TODO list due to system error';
			return res.send(HttpStatus.INTERNAL_SERVER_ERROR, result);
		})
		.done();
	},

	/**
	 * Update an existing TODO list
	 */
	updateExistingTodoList: (req, res, next) => {
		result = { 'success': false };
		todoListObjectId = null;
		if (!req.params.todoListId) {
			result.code = ResponseCode.RESOURCE_ID_INVALID;
			result.message = 'Please give ID of TODO list';
			return res.send(HttpStatus.BAD_REQUEST, result);
		}
		try {
			todoListObjectId = ObjectId(req.params.todoListId);
		} catch (e) {
			result.code = ResponseCode.RESOURCE_ID_INVALID;
			result.message = 'Invalid TODO list ID';
			return res.send(HttpStatus.BAD_REQUEST, result);
		}
		if (!req.body) {
			result.code = ResponseCode.DATA_EMPTY;
			result.message = 'Please provide TODO list data';
			return res.send(HttpStatus.BAD_REQUEST, result);
		}
		if (!req.body.title) {
			result.code = ResponseCode.TODO_LIST_TITLE_INVALID;
			result.message = 'Please give a title';
			return res.send(HttpStatus.BAD_REQUEST, result);
		}
		// validate id from db
		TodoList
		.findOne({
			'_id': todoListObjectId,
			'avail': true
		})
		.select({
			'_id': 0,
			'__v': 0,
			'items': 0
		})
		.exec()
		.then((dbTodoList) => {
			if (!dbTodoList) {
				result.code = ResponseCode.RESOURCE_NOT_FOUND;
				result.message = 'Could not find the TODO list to be modified';
				return res.send(HttpStatus.NOT_FOUND, result);
			}
			return TodoList.update({
				'_id': todoListObjectId,
				'avail': true,
				'version': dbTodoList.version
			}, {
				'$set': {
					'title': req.body.title,
					'description': req.body.description || '',
					'isEnabled': req.body.isEnabled == true ? true : false,
					'version': dbTodoList.version + 1
				}
			});
		})
		.then((updResult) => {
			if (!updResult || updResult.ok != 1 || updResult.nModified != 1) {
				result.code = ResponseCode.RESOURCE_UPDATE_VERSION_EXPIRED;
				result.message = 'Failed to update TODO list, please try again';
				return res.send(HttpStatus.INTERNAL_SERVER_ERROR, result);
			}
			// success
			result.success = true;
			result.data = {};
			result.message = 'Update successful';
			return res.send(HttpStatus.OK, result);
		})
		.catch((e) => {
			console.log(e);
			result.code = ResponseCode.SYSTEM_ERROR;
			result.message = 'Failed to update TODO list due to a system error';
			return res.send(HttpStatus.INTERNAL_SERVER_ERROR, result);
		})
		.done();
	},

	/**
	 * Remove an existing TODO list
	 */
	removeExistingTodoList: (req, res, next) => {
		result = { 'success': false };
		todoListObjectId = null;
		if (!req.params.todoListId) {
			result.code = ResponseCode.RESOURCE_ID_INVALID;
			result.message = 'Please give TODO list ID';
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
			'_id': 1,
			'version': 1
		})
		.exec()
		.then((dbTodoList) => {
			if (!dbTodoList) {
				// not found
				result.code = ResponseCode.RESOURCE_NOT_FOUND;
				result.message = 'Could not find the TODO list to be removed';
				return res.send(HttpStatus.NOT_FOUND, result);
			}
			return TodoList.update({
				'_id': todoListObjectId,
				'version': dbTodoList.version,
				'avail': true
			}, {
				'$set': {
					'avail': false,
					'version': dbTodoList.version + 1
				}
			});
		})
		.then((updResult) => {
			if (!updResult || updResult.ok != 1 || updResult.nModified != 1) {
				result.code = ResponseCode.RESOURCE_UPDATE_VERSION_EXPIRED;
				result.message = 'Failed to remove TODO list, please try again';
				return res.send(HttpStatus.INTERNAL_SERVER_ERROR, result);
			}
			// success
			result.success = true;
			result.data = {};
			result.message = 'Removed';
			return res.send(HttpStatus.OK, result);
		})
		.catch((e) => {
			console.log(e);
			result.code = ResponseCode.SYSTEM_ERROR;
			result.message = 'Failed to remove TODO list due to a system error';
			return res.send(HttpStatus.INTERNAL_SERVER_ERROR, result);
		})
		.done();
	},

	/**
	 * List TODO lists
	 */
	getTodoListsList: (req, res, next) => {
		result = { 'success': false };
		TodoList
		.find({
			'avail': true
		})
		.select(Constants.UNWANTED_FIELDS_RETRIEVE_RESOURCES)
		.exec()
		.then((dbTodoLists) => {
			result.success = true;
			result.data = dbTodoLists;
			result.message = 'TODO lists got';
			return res.send(HttpStatus.OK, result);
		})
		.catch((e) => {
			console.log(e);
			result.code = ResponseCode.SYSTEM_ERROR;
			result.message = 'Failed to retrieve TODO lists due to a system error';
			return res.send(HttpStatus.INTERNAL_SERVER_ERROR, result);
		})
		.done();
	},

	/**
	 * Retrieve a single TODO list
	 */
	getSingleTodoList: (req, res, next) => {
		result = { 'success': false };
		todoListObjectId = null;
		if (!req.params.todoListId) {
			result.code = ResponseCode.RESOURCE_ID_INVALID;
			result.message = 'Please give a valid TODO list ID';
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
			'avail': true,
			'_id': todoListObjectId
		})
		.select(Constants.UNWANTED_FIELDS_RETRIEVE_RESOURCES)
		.exec()
		.then((dbTodoList) => {
			if (!dbTodoList) {
				result.code = ResponseCode.RESOURCE_NOT_FOUND;
				result.message = 'Could not find the TODO list requested';
				return res.send(HttpStatus.NOT_FOUND, result);
			}
			result.success = true;
			result.data = dbTodoList;
			result.message = 'TODO list got';
			return res.send(HttpStatus.OK, result);
		})
		.catch((e) => {
			console.log(e);
			result.code = ResponseCode.SYSTEM_ERROR;
			result.message = 'Failed to retrieve TODO list due to a system error';
			return res.send(HttpStatus.INTERNAL_SERVER_ERROR, result);
		})
		.done();
	}
}

module.exports = todoListController;