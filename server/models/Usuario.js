var mongoose = require('mongoose');

//create the Schema
var userSchema = new mongoose.Schema({
	username: {type: String, required: true, unique: true},
	password: {type: String, required: true}, //hash created from password
	firstname: String,
	lastname: String,
	datebirth: String,
	phone: String,
	email: String,
	created_at: {type: Date, default: Date.now}
})

// Export the model.
module.exports = mongoose.model('Usuario', userSchema);
