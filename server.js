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
server.post('/todolists/:todoListId/items', mockResponse);

// update todo list item
server.put('/todolists/:todoListId/items/:itemId', mockResponse);

// list items under todo list
server.get('/todolists/:todoListId/items', mockResponse);

// get single item from todo list
server.get('/todolists/:todoListId/items/:itemId', mockResponse);

// remove todo list item
server.del('/todolists/:todoListId/items/:itemId', mockResponse);

module.exports = server;

