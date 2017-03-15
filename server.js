/**
 * server.js
 *
 * server as a module
 */

let restify = require('restify');
let mongoose = require('mongoose');
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'Db conn error: '));
db.once('open', function() {
	console.log('connection established');
});
mongoose.connect('mongodb://localhost:27017/todolistdb');

let auth = (req, res, next) => {
	console.log('auth happens here');
	return next();
}

let logRequest = (req, res, next) => {
	console.log(req.route.method + ' ' + req.url);
	return next();
}

let server = restify.createServer({
	name: 'restifyExampleTodoApi'
});
server.use(restify.bodyParser());
server.use(auth);
server.use(logRequest);

let mockResponse = (req, res, next) => {
	res.send(200, {
		'success': true,
		'url': req.route.method + ' ' + req.route.path
	});
	return next();
}

let todoListController = require('./app/controllers/todo.list.controller');
let todoListItemController = require('./app/controllers/todo.list.item.controller');

/************************************************
 * todo list endpoints
 ************************************************/

// create todo list
server.post('/todolists', todoListController.addNewTodoList);

// update todo list
server.put('/todolists/:todoListId', todoListController.updateExistingTodoList);

// list todo list
server.get('/todolists', todoListController.getTodoListsList);

// get single todo list
server.get('/todolists/:todoListId', todoListController.getSingleTodoList);

// remove todo list
server.del('/todolists/:todoListId', todoListController.removeExistingTodoList);

// create todo list item
server.post('/todolists/:todoListId/items', todoListItemController.addItemToList);

// update todo list item
server.put('/todolists/:todoListId/items/:itemId', todoListItemController.updateItemInList);

// list items under todo list
server.get('/todolists/:todoListId/items', todoListItemController.getAllItemsUnderList);

// get single item from todo list
server.get('/todolists/:todoListId/items/:itemId', todoListItemController.getSingleItemUnderList);

// remove todo list item
server.del('/todolists/:todoListId/items/:itemId', todoListItemController.removeItemFromList);

module.exports = server;

