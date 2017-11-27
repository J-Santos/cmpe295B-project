var Bcrypt 		= require('bcrypt-nodejs');
var userModel 	= require('../schemas/user');
var User 		= userModel.User;

exports.createUser = function (req,callback){
	var password = req.body.password;
	req.body.password = Bcrypt.hashSync(password, Bcrypt.genSaltSync(8), null);
	var new_user = new User(req.body);
	User.findOne({"_id":req.body._id},function(err,user){	
		//console.log(user);
		if(err){
			return callback(err,null);
		}
		else if(user != null){
			return callback(new Error("User already exists."));
		}
		new_user.save(function(err) {
        	callback(err);
    	});
	});
}

exports.getUser = function (query, callback){
	//console.log("User id: ",req.params.user_id);
	User.findOne(query, {"password":0}).exec(function(err, user) {
        callback(err,user);
    });
}

exports.authenticateUserLogin = function (query, callback){
	//console.log("ID: " + query._id);
	//console.log("Password: " + query.password);
	User.findOne({'_id': query._id}).exec(function(err, user) {
        if (err){
        	//console.log("Password 1: " + query.password);
            callback(err, null, null);
        }else if(user == undefined || user == null){
        	//console.log("Password 2: " + query.password);
            callback(null, user, null);
        }else{
            if(Bcrypt.compareSync(query.password, user.password)){
            	//console.log("Password 3: " + query.password);
            	callback(null, user, true);
            }else{
            	//console.log("Password 4: " + query.password);
            	callback(null, user, false);
            }
        }
    });
}

exports.updateUser = function (query, conditions, callback){
	//console.log("User body: "+JSON.stringify(conditions));
	User.findOne(query,function(err,user){	
		if(err){
			return callback(err,null);
		}
		else if(user == null){
			return callback(new Error("User not found"),null );
		}
		for (var key in conditions){
			if(key == '_id'){
				return callback(new Error('Email is unique and cannot be modified'), null)
			}else if(key == 'password'){
				var pwd = conditions[key];
				pwd = Bcrypt.hashSync(pwd, Bcrypt.genSaltSync(8), null)
				user[key] = pwd;
			}else{
				user[key] = conditions[key];
			}
		}
		user.save(callback(err, user));
	});
}

exports.getUsers = function (query,callback){
	User.find({}, {"password":0},function(err, users) {
		callback(err,users)
	});
}

exports.deleteUser = function (req,callback){
	User.remove({"_id" : req.params.user_id}, function(err) {
        callback(err);
    });
}

exports.getUserPatients = function (req,callback){
	User.find({'user_type': 'patient', 'doctor_id': req.params.user_id}, {"password":0}, function(err, users) {
		callback(err,users)
	});	
}

exports.updateUserAppointmentComments = function (query, comment, callback){
	User.findOne(query,function(err,user){	
		if(err){
			return callback(err,null);
		}
		else if(user == null){
			return callback(new Error("User not found"), null);
		}
		user.medical_record.appointment_comments.push(comment);
		user.save(callback(err, user));
	});
}

// exports.getUsers = function (req,callback){
// 	mongoOp.find({},function(err,data){
//         // Mongo command to fetch all data from collection.
//             if(err) {
//                 response = {"error" : true,"message" : "Error fetching data"};
//             } else {
//                 response = {"error" : false,"message" : data};
//             }
//             res.json(response);
//         });
// }

// exports.getUsers = function (query,callback){
// 	User.find({},function(err, users) {
// 		callback(err,users)
// 	});
// 	// if(JSON.stringify(query) != '{}'){
// 	// 	console.log("Query found");
// 	// 	User.find({visibility : {$in : ['public','friends-only']}, email : {$ne : query.email}}).or([{nick_name : new RegExp(query.search, 'i')}, {interests : new RegExp(query.search, 'i')}]).exec(function(err, users) {
// 	// 		callback(err,users)
// 	// 	});
// 	// }else{
// 	// 	User.find({visibility : {$in : ['public','friends-only']}},function(err, users) {
// 	// 		callback(err,users)
// 	// 	});
// 	// }
	
// }



