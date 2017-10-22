var userModel = require('../schemas/user');
var User = userModel.User;

exports.createUser = function (req,callback){
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
			//console.log(err);
        	callback(err);
    	});
	});
}

exports.getUser = function (query, callback){
	//console.log("User id: ",req.params.user_id);
	User.findOne(query).exec(function(err, user) {
        callback(err,user);
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
			}
			user[key] = conditions[key];
		}
		user.save(callback(err, user));
	});
}

exports.getUsers = function (query,callback){
	User.find({},function(err, users) {
		callback(err,users)
	});
}

exports.deleteUser = function (req,callback){
	User.remove({"_id" : req.params.user_id}, function(err) {
        callback(err);
    });
}

exports.getUserPatients = function (req,callback){
	User.find({'user_type': 'patient', 'doctor_id': req.params.user_id},function(err, users) {
		callback(err,users)
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



