var mongoose    =   require("mongoose");
var apptSchema = require('./appointment');
var Appointment = apptSchema.Appointment;
var addressSchema = require('./address');
var Address = addressSchema.Address;

var userSchema  = new mongoose.Schema({
    "email" : {type: String},
    "password" : {type: String},
    "user_type": {type: String},
    "patient_id": {type: String},
    "family_patient_id": {type: String},
    "doctor_id": {type: String},
    "name": {
    	"first_name": {type: String},
    	"last_name": {type: String},
    },
    "phone_number": {type: String},
    "address": {type: mongoose.Schema.Types, ref: 'Address'},
    "medical_record":{
    	"patient_id": {type: String},
    	"gender": {type: String},
    	"age": {type: Number},
    	"weight": {type: Number},
    	"past_diagnosis": [String],
    	"current_diagnosis": [String],
    	"family_history": [String],
    	"prescriptions": [String],
    },
    "upcoming_appts": [{type: mongoose.Schema.Types.ObjectId, ref: 'Appointment'}],
    "patients": [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}]
});
// create model if not exists.
exports.User = mongoose.model('User', userSchema);