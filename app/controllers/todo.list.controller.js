let request = require('superagent-promise')(require('superagent'), require('q').Promise);
let Base64 = require('js-base64').Base64;

let orchIoApiKey = process.env.orchestrate_api_key;
let orchIoApiSecret = process.env.orchestrate_api_secret;
let orchIoApiKeyBase64 = Base64.encode(orchIoApiKey + ':' + orchIoApiSecret);

let orchIoBaseUrl = process.env.orchestrate_api_base_url;
let orchIoVersion = process.env.orchestrate_api_version_url;
let orchIoTodoListUrlBase = process.env.orchestrate_api_todolist_url_base;
let orchIoTodoListItemUrlBase = process.env.orchestrate_api_todolist_item_url_base;

let orchIoTodoListUrl = orchIoBaseUrl + orchIoVersion + orchIoTodoListUrlBase;
let TodoList = require('../models/todo.list');
let ResponseCode = require('../commons/response.code');
let ObjectUtils = require('../utils/object.utils');
let TodoListUtils = require('../utils/todo.list.utils');

let ApiCustomError = require('../errors/api.custom.error');

let todoListController = {
	addNewTodoList: (req, res, next) => {
		result = { 'success': false };
		if (!req.body) {
			result.code = ResponseCode.DATA_EMPTY;
			result.msg = 'Please provide TODO list data';
			return res.send(200, result);
		}
		if (!req.body.title) {
			result.code = ResponseCode.TODO_LIST_TITLE_INVALID;
			result.msg = 'Please give a title';
			return res.send(200, result);
		}
		req.body.description = req.body.description || '';
		req.body.isEnabled = req.body.isEnabled ? true : false;
		todoList = new TodoList();
		TodoListUtils.createTodoListObject(req.body, todoList);
		ObjectUtils.setObjectDefaultFields(todoList);
		request
			.post(orchIoTodoListUrl)
			.send(todoList)
			.set('Authorization', 'Basic ' + orchIoApiKeyBase64)
			.set('Content-Type', 'application/json')
			.end()
			.then((apiRes) => {
				result.success = true;
				result.data = {
					'_id': apiRes.headers.location.match('todolists\/(.*)\/refs')[1],
					'location': orchIoBaseUrl + apiRes.headers.location
				};
				result.message = 'New TODO list added';
				res.send(200, result);
			})
			.catch((e) => {
				console.log(e);
				result.code = ResponseCode.SYSTEM_ERROR;
				result.message = 'Unknown error';
				res.send(500, result);
			})
			.done();
	},

	updateExistingTodoList: (req, res, next) => {
		result = { 'success': false };
		if (!req.params.todoListId) {
			result.code = ResponseCode.RESOURCE_ID_INVALID;
			result.message = 'Please give ID of TODO list';
			return res.send(200, result);
		}
		if (!req.body) {
			result.code = ResponseCode.DATA_EMPTY;
			result.msg = 'Please provide TODO list data';
			return res.send(200, result);
		}
		if (!req.body.title) {
			result.code = ResponseCode.TODO_LIST_TITLE_INVALID;
			result.msg = 'Please give a title';
			return res.send(200, result);
		}
		todoList = new TodoList();
		req.body.description = req.body.description || '';
		req.body.isEnabled = req.body.isEnabled ? true : false;
		TodoListUtils.createTodoListObject(req.body, todoList);				
		request
			.patch(orchIoTodoListUrl + req.params.todoListId)
			.send(todoList)
			.set('Authorization', 'Basic ' + orchIoApiKeyBase64)
			.set('Content-Type', 'application/json')
			.end()
			.then((apiRes) => {
				result.success = true;
				result.data = {};
				result.message = 'TODO list updated';
				res.send(200, result);
			})
			.catch((e) => {
				if (e.name === 'ApiCustomError') {
					result.code = e.extra;
					result.message = e.message;
					res.send(200, result);
				} else if (e.status && e.status == 404) {
					result.code = ResponseCode.RESOURCE_NOT_FOUND;
					result.message = 'Could not find TODO list';
					res.send(200, result);
				} else {
					console.log(e);
					result.code = ResponseCode.SYSTEM_ERROR;
					result.message = 'Unknown error';
					res.send(500, result);
				}
			})
			.done();
	},

	removeExistingTodoList: (req, res, next) => {

	}
}

module.exports = todoListController;