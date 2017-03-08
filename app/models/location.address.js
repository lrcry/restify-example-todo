let LocationAddress = data => {
	this.data = data;
}
LocationAddress.prototype.data = {};

/**
 * setters and getters
 */
LocationAddress.prototype.setStreetAddress = streetAddress => {
	this.data.streetAddress = streetAddress;
}
LocationAddress.prototype.getStreetAddress = () => {
	return this.data.streetAddress;
}
LocationAddress.prototype.setSuburb = suburb => {
	this.data.suburb = suburb;
}
LocationAddress.prototype.getSuburb = () => {
	return this.data.suburb;
}
LocationAddress.prototype.setState = state => {
	this.data.state = state;
}
LocationAddress.prototype.getState = () => {
	return this.data.state;
}
LocationAddress.prototype.setCountry = country => {
	this.data.country = country;
}
LocationAddress.prototype.getCountry = () => {
	return this.data.country;
}
LocationAddress.prototype.setZipCode = zipCode => {
	this.data.zipCode = zipCode;
}
LocationAddress.prototype.getZipCode = () => {
	return this.data.zipCode;
}