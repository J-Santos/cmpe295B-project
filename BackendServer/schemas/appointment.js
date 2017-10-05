var mongoose    =   require("mongoose");

var addressSchema = require('./address');
var Address = addressSchema.Address;

var appointmentSchema  = new mongoose.Schema({
	"patient_id": {type: String},
	"doctor_id": {type: String},
	"date": {type: String},
	"time": {type: String},
	"location":{
		"place": {type: String},
		"phone_number": {type: String},
		"address": {type: mongoose.Types, ref: 'Address'}
	}
});

exports.Appointment = mongoose.model('Appointment', appointmentSchema);