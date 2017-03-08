let Location = data => {
	this.data = data;
}

Location.prototype.data = {};

/**
 * setters and getters
 */
Location.prototype.setAddress = address => {
	this.data.address = address;
}
Location.prototype.getAddress = () => {
	return this.data.address;
}
Location.prototype.setGeoData = geoData => {
	this.data.geoData = geoData;
}
Location.prototype.getGeoData = () => {
	return this.data.geoData;
}