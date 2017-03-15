let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let TodoListItemSchema = new Schema({
	title: String,
	description: String,
	time: Date,
	enableAlert: Boolean,
	location: {
		address: {
			streetAddress: String,
			suburb: String,
			state: String,
			country: String,
			zipCode: String
		},
		geoData: {
			latitude: Number,
			longitude: Number
		}
	},
	avail: Boolean,
	createAt: Date,
	version: Number
});

module.exports = mongoose.model('TodoListItem', TodoListItemSchema);
