let restify = require('restify');

// in-memory storage
let tempDataSet = {};

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
server.use(auth);
server.use(logRequest);

let mockResponse = (req, res, next) => {
	res.send(200, {
		'success': true,
		'url': req.route.method + ' ' + req.route.path
	});
	return next();
}

/************************************************
 * todo list endpoints
 ************************************************/

// create todo list
server.post('/todolists', mockResponse);

// update todo list
server.put('/todolists/:todoListId', mockResponse);

// list todo list
server.get('/todolists', mockResponse);

// get single todo list
server.get('/todolists/:todoListId', mockResponse);

// remove todo list
server.del('/todolists/:todoListId', mockResponse);

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

server.listen(10240);