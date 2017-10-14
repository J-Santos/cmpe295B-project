var express             =   require("express");
var app                 =   express();
var bodyParser          =   require("body-parser");
var usersModel          =   require("./models/users");
var predictionModel     =   require("./models/prediction");
var appointmentsModel   =   require("./models/appointments");
var diseasesModel       =   require("./models/diseases");
var router              =   express.Router();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({"extended" : true}));
app.set('json spaces', 3);

router.get("/",function(req,res){
    res.json({"error" : false,"message" : "Hello World"});
});

router.route("/api/prediction")
    .get(function(req,res){
        predictionModel.predictDisease(req,function(err,disease){
            if (err){
                //console.log('before 500');
                res.status(500).send(err.message);
            }
            // else if(users == undefined || users == null ){
            //     res.status(404).json({ message: 'User not found' })
            // }
            else{
                res.status(200).json(disease);
            }
        });
    });

router.route("/api/users")
    .get(function(req,res){
        // var query = {
        //     email : req.param.email,
        //     password : req.param.password
        // }
        //console.log('Before getUsers');
        usersModel.getUsers(req,function(err,users){
            if (err){
                //console.log('before 500');
                res.status(500).send(err.message);
            }
            else if(users == undefined || users == null ){
                res.status(404).json({ message: 'User not found' })
            }
            else{
                res.status(200).json(users);
            }
        });
    })

    .post(function(req,res){
        var response = res;
        //console.log(req.body);
        usersModel.createUser(req, function (err){
            if(err){
                res.status(500).send(err.message);
            }
            else{
                res.status(201).json({ message: 'User created!' });
            }
        });
        //var db = new usersModel();
        // var response = res;
        // // fetch email and password from REST request.
        // // Add strict validation when you use this in Production.
        
        // db.userEmail = req.body.email; 
        // // Hash the password using SHA1 algorithm.
        // db.userPassword =  require('crypto')
        //                   .createHash('sha1')
        //                   .update(req.body.password)
        //                   .digest('base64');
    });

router.route("/api/users/:user_id")
    .get(function(req,res){
        usersModel.getUser(req,function(err,user){
            //console.log(user);
            if (err){
                res.status(500).send(err.message);
            }
            else if(user == undefined || user == null || user == []){
                res.status(404).json({ message: 'User not found' })
            }
            else{
                res.status(200).json(user);
            }
        });
    })

    .put(function(req, res) {
        usersModel.updateUser({"_id":req.params.user_id},req.body,function(err,user){
            //console.log("Err: "+JSON.stringify(err, ["message", "arguments", "type", "name"]));
            if (err){
                res.status(500).send(err.message);
            }
            else if(user == undefined || user == null  ){
                res.status(404).json({ message: 'User not found' });
            }
            else{
                res.status(204).send();
            }
        });
    })

    .delete(function(req, res) {
        usersModel.deleteUser(req,function(err){
            if (err)
                res.status(500).send(err.message);
            else
                res.status(200).json({ message: 'User deleted' });
        });
    });

router.route("/api/users/:user_id/appointments")
    .post(function(req,res){
        appointmentsModel.addAppointment({email:req.params.user_id},req,function(err,user){
            if (err){
                res.status(500).send(err.message);
            }
            else if(user == undefined || user == null  ){
                res.status(404).json({ message: 'User not found' });
            }
            else{
                res.status(201).json({ message: 'Appointment added!' });
            }
        });
    })
    .get(function(req,res){
        appointmentsModel.getUserAppointments(req,function(err,user){
            //console.log(user);
            if (err){
                res.status(500).send(err.message);
            }
            else if(user == undefined || user == null || user == []){
                res.status(404).json({ message: 'User not found' })
            }
            else{
                res.status(200).json(user);
            }
        });
    });

router.route("/api/users/:user_id/appointments/:appointment_id")
    .get(function(req,res){
        appointmentsModel.getAppointment({_id : req.params.appointment_id},function(err,appointment){
            if (err){
                res.status(500).send(err.message);
            }
            else if(appointment == undefined || appointment == null || appointment == []){
                res.status(404).json({ message: 'Appointment not found' })
            }
            else{
                res.status(200).json(appointment);
            }
        });
    })

    .put(function(req, res) {
        appointmentsModel.updateAppointment({_id : req.params.appointment_id},req.body,function(err,appointment){
            if (err){
                res.status(500).send(err.message);
            }
            else if(appointment == undefined || appointment == null  ){
                res.status(404).json({ message: 'Appointment not found' });
            }
            else{
                res.status(204).send();
            }
        });
    })

    .delete(function(req, res) {
        appointmentsModel.deleteAppointment(req,function(err){
            if (err)
                res.status(500).send(err.message);
            else
                res.status(200).json({ message: 'Appointment deleted' });
        });
    });

router.route("/api/users/:user_id/patients")
    .get(function(req,res){
        usersModel.getUserPatients(req,function(err,user){
            if (err){
                res.status(500).send(err.message);
            }
            else if(user == undefined || user == null || user == []){
                res.status(404).json({ message: 'User not found' })
            }
            else{
                res.status(200).json(user);
            }
        });
    });

router.route("/api/diseases")
    .post(function(req,res){
        diseasesModel.createDisease(req, function (err){
            if(err){
                res.status(500).send(err.message);
            }
            else{
                res.status(201).json({ message: 'Disease created!' });
            }
        });
    })
    .get(function(req,res){
        var query = {
            name : req.query.name,
            symptom : req.query.symptom
        };
        diseasesModel.getDiseases(query,function(err,diseases){
            if (err){
                res.status(500).send(err.message);
            }
            else if(diseases == undefined || diseases == null ){
                res.status(404).json({ message: 'Disease not found' })
            }
            else{
                res.status(200).json(diseases);
            }
        });
    });

router.route("/api/diseases/:disease_id")
    .get(function(req,res){
        diseasesModel.getDisease({_id : req.params.disease_id},function(err,disease){
            if (err){
                res.status(500).send(err.message);
            }
            else if(disease == undefined || disease == null || disease == []){
                res.status(404).json({ message: 'Disease not found' })
            }
            else{
                res.status(200).json(disease);
            }
        });
    })

    .put(function(req, res) {
        diseasesModel.updateDisease({_id : req.params.disease_id},req.body,function(err,disease){
            if (err){
                res.status(500).send(err.message);
            }
            else if(disease == undefined || disease == null  ){
                res.status(404).json({ message: 'Disease not found' });
            }
            else{
                res.status(204).send();
            }
        });
    })

    .delete(function(req, res) {
        diseasesModel.deleteDisease(req,function(err){
            if (err)
                res.status(500).send(err.message);
            else
                res.status(200).json({ message: 'Disease deleted' });
        });
    });


app.use('/',router);

var port = process.env.PORT || 5000;
app.listen(port);
console.log("Listening to PORT "+ port);

var http = require ('http');
var mongoose    =   require("mongoose");
//mongoose.connect('mongodb://localhost:27017/users');
//var connection_uri = 'mongodb://localhost:27017/healthcare-system'
var connection_uri = process.env.MONGODB_URI || 'mongodb://cmpe295a:chandra3295a@ds143330.mlab.com:43330/healthcare-system';

mongoose.connect(connection_uri, function (err, res) {
  if (err) { 
    console.log ('ERROR connecting to: ' + connection_uri + '. ' + err);
  } else {
    console.log ('Succeeded connected to: ' + connection_uri);
  }
});

