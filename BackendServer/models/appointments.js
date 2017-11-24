var appointmentSchema 	= require('../schemas/appointment');
var Appointment 		= appointmentSchema.Appointment;
var userSchema 			= require('../schemas/user');
var usersModel          = require("./users");
var User 				= userSchema.User;

exports.addAppointment = function(req, callback){
	//console.log("addAppointment ...")
	//console.log(req.body);
	//console.log(req);
	//console.log("addAppointment ...")
	var startTime = req.body.date + "T"+ req.body.start_time;// + ":00-07:00";
	var startTimeDate = new Date(startTime);
	var endTime = req.body.date + "T"+ req.body.end_time;// + ":00-07:00";
	var endTimeDate = new Date(endTime);

	var format_req = {
		"patient_id": req.body.patient_id,
		"doctor_id": req.body.doctor_id,
		"doctor_name": req.body.doctor_name,
		"purpose": req.body.purpose,
		"status": req.body.status,
		"date": new Date(req.body.date),
		"start_time": startTimeDate,
		"end_time": endTimeDate,
		"location": req.body.location,
		"start_time_timestamp": startTimeDate.getTime()
	}
	//console.log(format_req);
	var new_appt = new Appointment(format_req);
	new_appt.save(function(err){
		callback(err);
	});
}

exports.getAppointments = function (query, callback){
	Appointment.find(query,function(err, appointments) {
		callback(err,appointments)
	});
}
exports.getAppointmentsByUser = function (query, callback){
	Appointment.find(query).sort({"start_time_timestamp": 1}).exec(function(err, appointments) {
        callback(err,appointments);
    });
}

exports.getAppointment = function (query, callback){
	Appointment.findOne(query).exec(function(err, appointment) {
        callback(err,appointment);
    });
}

exports.deleteAppointment = function (query,callback){
	Appointment.remove(query, function(err) {
        callback(err);
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
			//appointment[key] = conditions[key];
			if(key == "date"){
				appointment[key] = new Date(conditions[key]);

				var current_start_time = appointment['start_time'];
				var start_time_split = current_start_time.toISOString().split("T");
				var new_start_time = conditions[key] + "T" + start_time_split[1];
				var startTimeDate = new Date(new_start_time);
				appointment['start_time'] = startTimeDate;
				appointment["start_time_timestamp"] = startTimeDate.getTime();

				var current_end_time = appointment['end_time'];
				var end_time_split = current_end_time.toISOString().split("T");
				var new_end_time = conditions[key] + "T" + end_time_split[1];
				appointment['end_time'] = new Date(new_end_time);
			}else if(key == "start_time"){
				var current_time = appointment['start_time'];
				var current_time_split = current_time.toISOString().split("T");
				var new_start_time = current_time_split[0] + "T" + conditions[key];// + ":00-07:00"
				var startTimeDate = new Date(new_start_time);
				appointment['start_time'] = startTimeDate;
				appointment["start_time_timestamp"] = startTimeDate.getTime();
			}else if(key == "end_time"){
				var current_time = appointment['end_time'];
				var current_time_split = current_time.toISOString().split("T");
				var new_start_time = current_time_split[0] + "T" + conditions[key];// + ":00-07:00"
				appointment['end_time'] = new Date(new_start_time);
			}else{
				appointment[key] = conditions[key];
			}
		}
		appointment.save(callback(err, appointment));
	});
}

exports.finishAppointment = function (query, callback){
	Appointment.findOne({"_id": query._id},function(err,appointment){	
		if(err){
			return callback(err,null, null);
		}
		else if(appointment == null){
			return callback(new Error("Appointment not found"), null, null);
		}
		else{
			appointment["status"] = "finished";
			appointment.save(function(err){
				if(err){
					callback(err, appointment, null);
				}else{
					usersModel.updateUserAppointmentComments({'_id': query.user_id}, query.doctor_comment, function(err, user){
						callback(err, appointment ,user)

					});
				}
			});
		}
	});
}
// exports.addAppointment = function (query, req, callback){
// 	//console.log("addAppointment ...")
// 	//console.log(req.body);
// 	//console.log(req);
// 	//console.log("addAppointment ...")
// 	var new_appt = new Appointment(req.body);
// 	User.findOne(query,function(err,user){	
// 		if(err){
// 			return callback(err,null);
// 		}
// 		else if(user == null){
// 			return callback(new Error("User not found"),null );
// 		}
// 		// console.log(user.medical_record.upcoming_appts);
// 		// user.upcoming_appts.push(new_appt);
// 		// user.save(callback(err, user));
// 		//console.log(new_appt);
// 		new_appt.save(function(err){
// 			if(err){
// 				return callback(err, null);
// 			}
// 			user.upcoming_appts.push(new_appt);
// 			user.save(callback(err, user));
// 		});
// 	});
// }

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

// exports.getAppointment = function (query, callback){
// 	Appointment.findOne(query).exec(function(err, appointment) {
//         callback(err,appointment);
//     });
// }

// exports.updateAppointment = function (query, conditions, callback){
// 	//console.log("User body: "+JSON.stringify(conditions));
// 	Appointment.findOne(query,function(err,appointment){	
// 		if(err){
// 			return callback(err,null);
// 		}
// 		else if(appointment == null){
// 			return callback(new Error("Appointment not found"),null );
// 		}
		
// 		for (var key in conditions){
// 			if(key == '_id' || key == 'patient_id'){
// 				return callback(new Error(key + ' is unique and cannot be modified'), null)
// 			}
// 			appointment[key] = conditions[key];
// 		}
// 		appointment.save(callback(err, appointment));
// 	});
// }

// exports.deleteAppointment = function (req,callback){
// 	Appointment.remove({_id : req.params.appointment_id}, function(err) {
//             callback(err);
//     });
// }
