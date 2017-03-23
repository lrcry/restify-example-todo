const request = require('q-supertest');
const mongoose = require('mongoose');
server = require('../../server');

listNew = {
	'title': '#1 from todo.list.test',
	'description': '#description# from test',
	'isEnabled': true
}

genErrorMsg = function(test, code, msg) {
	return '[TODO.LIST.TEST.' + test + ']'
		+ (code ? '[' + code + ']' : '')
		+ (msg ? '[' + msg + ']' : '');
}

isObjEmpty = function(obj) {
	for (k in obj) {
		if (obj.hasOwnProperty(k)) {
			return false;
		}
	}
	return true;
}


// - post to create a new one, get ID
// - list all to find out the one with ID
// - update the one by ID
// - get single by ID
// - delete by ID
// - list all to find, should not be there anymore
// - get single by ID, should be not found

request(server)
	// create a new todo list
	.post('/todolists')
	.send(listNew)
	.expect(201)
	.then(res => {
		if (!res || !res.body) {
			throw new Error(genErrorMsg('create', null, 'no response'));
		}
		if (!res.body.success) {
			throw new Error(genErrorMsg('create', res.body.code, res.body.message));
		}
		if (isObjEmpty(res.body.data)) {
			throw new Error(genErrorMsg('create', null, 'no data in response body'));
		}
		if (!res.body.data._id) {
			throw new Error(genErrorMsg('create', null, 'no id in response data'));
		}
		listNew._id = res.body.data._id;
		// list all todo lists
		return request(server)
			.get('/todolists')
			.expect(200)
			.expect('Content-Type', /json/);
	})
	.then(res => {
		if (!res || !res.body) {
			throw new Error(genErrorMsg('listall', null, 'no response'));
		}
		if (!res.body.success) {
			throw new Error(genErrorMsg('listall', res.body.code, res.body.message));
		}
		if (isObjEmpty(res.body.data) || res.body.data.length <= 0) {
			throw new Error(genErrorMsg('listall', null, 'no data in response body'));
		}
		all = res.body.data;
		theOne = all.find(l => { return l._id == listNew._id });
		if (!theOne) {
			throw new Error(genErrorMsg('listall', null, 'the newly added one was not found'));
		}
		if (theOne.title !== listNew.title) {
			throw new Error(genErrorMsg('listall', null, 'title not match'));
		}
		if (theOne.description !== listNew.description) {
			throw new Error(genErrorMsg('listall', null, 'description not match'));
		}
		if (theOne.isEnabled != listNew.isEnabled) {
			throw new Error(genErrorMsg('listall', null, 'isEnabled not match'));
		}
		if (!theOne.createAt) {
			throw new Error(genErrorMsg('listall', null, 'doesn\'t generate createAt'));
		}
		// update the list
		listNew.title = '#1 changed by test';
		listNew.description = null;
		return request(server)
			.put('/todolists/' + listNew._id)
			.send(listNew)
			.expect(200)
			.expect('Content-Type', /json/);
	})
	.then(res => {
		if (!res || !res.body) {
			throw new Error(genErrorMsg('modify', null, 'no response'));
		}
		if (!res.body.success) {
			throw new Error(genErrorMsg('modify', res.body.code, res.body.message));
		}
		if (!isObjEmpty(res.body.data)) {
			throw new Error(genErrorMsg('modify', null, 'data in body should be nothing'));
		}
		// get single list
		return request(server)
			.get('/todolists/' + listNew._id)
			.expect(200)
			.expect('Content-Type', /json/);
	})
	.then(res => {
		if (!res || !res.body) {
			throw new Error(genErrorMsg('getsingle', null, 'no response'));
		}
		if (!res.body.success) {
			throw new Error(genErrorMsg('getsingle', res.body.code, res.body.message));
		}
		if (isObjEmpty(res.body.data)) {
			throw new Error(genErrorMsg('getsingle', null, 'no data'));
		}
		if (!res.body.data.items) {
			throw new Error(genErrorMsg('getsingle', null, 'items was not inited to an empty array'));
		}
		if (res.body.data.title !== listNew.title) {
			throw new Error(genErrorMsg('getsingle', null, 'title not match'))
		}
		if (res.body.data.description !== '') {
			throw new Error(genErrorMsg('getsingle', null, 'description not match'))
		}
		if (res.body.data.isEnabled != listNew.isEnabled) {
			throw new Error(genErrorMsg('getsingle', null, 'isEnabled not match'))
		}
		if (!res.body.data.createAt) {
			throw new Error(genErrorMsg('getsingle', null, 'createAt not inited'));
		}
		// remove single list
		return request(server)
			.del('/todolists/' + listNew._id)
			.expect(200)
			.expect('Content-Type', /json/);
	})
	.then(res => {
		if (!res || !res.body) {
			throw new Error(genErrorMsg('getsingle', null, 'no response'));
		}
		if (!res.body.success) {
			throw new Error(genErrorMsg('getsingle', res.body.code, res.body.message));
		}
		if (!isObjEmpty(res.body.data)) {
			throw new Error(genErrorMsg('getsingle', null, 'shouldn\'t have data'));
		}
		// get and check the list
		return request(server)
			.get('/todolists')
			.expect(200)
			.expect('Content-Type', /json/);
	})
	.then(res => {
		if (!res || !res.body) {
			throw new Error(genErrorMsg('listallafterdelete', null, 'no response'));
		}
		if (!res.body.success) {
			throw new Error(genErrorMsg('listallafterdelete', res.body.code, res.body.message));
		}
		if (!res.body.data) {
			throw new Error(genErrorMsg('listallafterdelete', null, 'no data'))
		}
		if (res.body.data.find(l => { return l._id === listNew._id })) {
			throw new Error(genErrorMsg('listallafterdelete', null, 'already deleted, shouldn\'t be in the list'))
		}
		// get and check the single
		return request(server)
			.get('/todolists/' + listNew._id)
			.expect(404)
			.expect('Content-Type', /json/);
	})
	.then(res => {
		if (!res || !res.body) {
			throw new Error(genErrorMsg('getsingleafterdelete', null, 'no response'));
		}
		if (res.body.success) {
			throw new Error(genErrorMsg('getsingleafterdelete', null, 'shouldn\'t be successful'));
		}
		if (res.body.code != 8404) {
			throw new Error(genErrorMsg('getsingleafterdelete', null, 'shouldn\'t be other than not found response code 8404'))
		}
		if (!isObjEmpty(res.body.data)) {
			throw new Error(genErrorMsg('getsingleafterdelete', null, 'already deleted, should be not found'))
		}
		console.log('ALL TESTS SUCCESSFUL');
	})
	.finally(() => {
		mongoose.connection.close();
	})
	.done();

