let LocationGeoData = data => {
	this.data = data;
}
LocationGeoData.prototype.data = {};

/**
 * setters and getters
 */
LocationGeoData.prototype.setLatitude = latitude => {
	this.data.latitude = latitude;
}
LocationGeoData.prototype.getLatitude = () => {
	return this.data.latitude;
}
LocationGeoData.prototype.setLongitude = longitude => {
	this.data.longitude = longitude;
}
LocationGeoData.prototype.getLongitude = () => {
	return this.data.longitude;
}