const request = require('supertest');
const restify = require('restify');
const mongoose = require('mongoose');
let server = require('../../server');

var id = '';

request(server)
	.get('/todolists')
	.expect('Content-Type', /json/)
	.expect(200)
	.end((err, res) => {
		if (err) {
			throw err;
		}
		if (!res.body) {
			throw Error('should be with response body');
		}
		if (!res.body.success) {
			throw Error('should be successful');
		}
		if (!res.body.data || res.body.data.length <= 0) {
			throw Error('should get at least one TODO list');
		}
		console.log('hah');
		id = res.body.data[0]._id;
		console.log(id);
	});

// TODO don't do this!
// try to chain these tests up to one promise chain
// e.g. supertest-as-promise

request(server)
	.get('/todolists/' + id)
	.expect('Content-Type', /json/)
	.expect(200)
	.end((err, res) => {
		if (err) {
			throw err;
		}
		console.log('another');
	});

mongoose.connection.close();