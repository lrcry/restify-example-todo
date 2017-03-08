let _ = require('lodash');
let schemas = require('../schemas/schemas');

TodoList = function() {}

TodoList.prototype.data = {}

/*
 * setters and getters
 */
TodoList.prototype.setId = function(_id) {
	this._id = _id;
}
TodoList.prototype.getId = function() {
	return this._id;
}
TodoList.prototype.setTitle = function(title) {
	this.title = title;
}
TodoList.prototype.getTitle = function() {
	return this.title;
}
TodoList.prototype.setDescription = function(description) {
	this.description = description;
}
TodoList.prototype.getDescription = function() {
	return this.getDescription;
}
TodoList.prototype.setEnabled = function(isEnabled) {
	this.isEnabled = isEnabled;
}
TodoList.prototype.isEnabled = function() {
	return this.isEnabled;
}
TodoList.prototype.setItems = function(items) {
	this.items = items;
}
TodoList.prototype.getItems = function() {
	return this.items;
}
TodoList.prototype.setAvail = function(avail) {
	this.avail = avail;
}
TodoList.prototype.getAvail = function() {
	return this.avail;
}
TodoList.prototype.setCreateAt = function(createAt) {
	this.createAt = createAt;
}
TodoList.prototype.getCreateAt = function() {
	return this.createAt;
}
TodoList.prototype.setVersion = function(version) {
	this.version = version;
}
TodoList.prototype.getVersion = function() {
	return this.version;
}

TodoList.prototype.sanitize = function(data) {
	data = data || {};
	schema = schemas.todoList;
	return _.pick(_.defaults(data, schema), _.keys(schema));
}

module.exports = TodoList;
