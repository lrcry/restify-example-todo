let TodoListItem = data => {
	this.data = data;
}

TodoListItem.prototype.data = {};

/**
 * setters and getters
 */
TodoListItem.prototype.setId = _id => {
	this.data._id = _id;
}
TodoListItem.prototype.getId = () => {
	return this.data._id;
}
TodoListItem.prototype.setTitle = title => {
	this.data.title = title;
}
TodoListItem.prototype.getTitle = () => {
	return this.data.title;
}
TodoListItem.prototype.setDescription = description => {
	this.data.description = description;
}
TodoListItem.prototype.getDescription = () => {
	return this.data.getDescription;
}
TodoListItem.prototype.setTime = time => {
	this.data.time = time;
}
TodoListItem.prototype.getTime = () => {
	return this.data.time;
}
TodoListItem.prototype.setEnableAlert = enableAlert => {
	this.data.enableAlert = enableAlert;
}
TodoListItem.prototype.isEnableAlert = () => {
	return this.data.enableAlert;
}
TodoListItem.prototype.setLocation = location => {
	this.data.location = location;
}
TodoListItem.prototype.getLocation = () => {
	return this.data.location;
}
TodoListItem.prototype.setAvail = avail => {
	this.data.avail = avail;
}
TodoListItem.prototype.getAvail = () => {
	return this.data.avail;
}
TodoListItem.prototype.setCreateAt = createAt => {
	this.data.createAt = createAt;
}
TodoListItem.prototype.getCreateAt = () => {
	return this.data.createAt;
}
TodoListItem.prototype.setVersion = version => {
	this.data.version = version;
}
TodoListItem.prototype.getVersion = () => {
	return this.data.version;
}