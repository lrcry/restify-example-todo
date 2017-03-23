let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let TodoListSchema = new Schema({
	title: String,
	description: String,
	isEnabled: Boolean,
	items: [],
	avail: Boolean,
	createAt: Date,
	version: Number
});

module.exports = mongoose.model('TodoList', TodoListSchema);
