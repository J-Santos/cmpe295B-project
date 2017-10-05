var appointmentSchema = require('../schemas/appointment');
var Appointment = appointmentSchema.Appointment;

var userSchema = require('../schemas/user');
var User = userSchema.User;

exports.addAppointment = function (query, req, callback){
	//console.log("addAppointment ...")
	//console.log(req.body);
	//console.log(req);
	//console.log("addAppointment ...")
	var new_appt = new Appointment(req.body);
	User.findOne(query,function(err,user){	
		if(err){
			return callback(err,null);
		}
		else if(user == null){
			return callback(new Error("User not found"),null );
		}
		// console.log(user.medical_record.upcoming_appts);
		// user.upcoming_appts.push(new_appt);
		// user.save(callback(err, user));
		//console.log(new_appt);
		new_appt.save(function(err){
			if(err){
				return callback(err, null);
			}
			user.upcoming_appts.push(new_appt);
			user.save(callback(err, user));
		});
	});
}

exports.getUserAppointments = function (req, callback){
	//console.log("User id: ",req.params.user_id);
	//User.find({'email': req.params.user_id}).select('-address -medical_record -password -phone')
	User.find({'email': req.params.user_id}).select('_id email patient_id upcoming_appts')
	.populate({path: 'upcoming_appts',options: { sort: { 'creationDate': -1 } }} )
	//.populate({path: 'timeline.images', select : '_id data'} )
	.exec(function(err, user) {
		callback(err,user);
	});
}

exports.getAppointment = function (query, callback){
	Appointment.findOne(query).exec(function(err, appointment) {
        callback(err,appointment);
    });
}

exports.updateAppointment = function (query, conditions, callback){
	//console.log("User body: "+JSON.stringify(conditions));
	Appointment.findOne(query,function(err,appointment){	
		if(err){
			return callback(err,null);
		}
		else if(appointment == null){
			return callback(new Error("Appointment not found"),null );
		}
		
		for (var key in conditions){
			if(key == '_id' || key == 'patient_id'){
				return callback(new Error(key + ' is unique and cannot be modified'), null)
			}
			appointment[key] = conditions[key];
		}
		appointment.save(callback(err, appointment));
	});
}

exports.deleteAppointment = function (req,callback){
	Appointment.remove({_id : req.params.appointment_id}, function(err) {
            callback(err);
    });
}
