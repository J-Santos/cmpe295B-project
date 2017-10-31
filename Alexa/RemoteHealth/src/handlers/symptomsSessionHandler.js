'use strict';

var Messages = require('../messages');
var Alexa = require("alexa-sdk");
//var request = require("request");
var Requests = require('../requests');
var Handlers = require('../handlers');

var SessionStates = require('./sessionStates');

////////////////////////////////////////////////////////////////////////
//// SYMPTOM SESSION
////////////////////////////////////////////////////////////////////////
var symptomIntentHandler = function () {
	var slotVal = this.event.request.intent.slots.Symptom.value;
	this.handler.state = SessionStates.states.SYMPTOMS_SESSION;
	console.log("SLOT_VALUE: " + slotVal);
	// var url = "https://remote-health-api.herokuapp.com/api/prediction?symptoms=dehydration,headache&email=jesantos0527@gmail.com";
	// Requests.makeRequest(url);
	if(slotVal == null){
		this.emit(':ask', Messages.ERROR, Messages.HELP);
	}else{
		console.log("SESSION_ATTRIBUTES: " + this.attributes['session_symptoms']);
		this.attributes['session_symptoms'].push(slotVal);
		var symptoms = this.attributes['session_symptoms'];
		var userEmail = this.attributes['user_email'];
		if(symptoms.length < 2){
			this.emit(':ask', Messages.SYMPTOM_ASK, Messages.HELP);
		}else{
			var prediction = getPrediction(userEmail, symptoms, this);
			//this.emit(':ask', Messages.SYMPTOM_ASK, Messages.HELP);
		}		
	}
};

var yesIntentHandler = function () {
	//this.attributes['session_symptoms'] = []
	this.handler.state = SessionStates.states.SYMPTOMS_SESSION;
	this.emit(':ask', Messages.SYMPTOM_YES + " " + Messages.SAMPLE_UTTERANCE, Messages.HELP);
};

var noIntentHandler = function () {
	this.attributes['session_symptoms'] = []
	this.emit(":tell", Messages.GOODBYE);
};

function getPrediction(email, symptoms, thisPointer){
	//var url = "https://remote-health-api.herokuapp.com/api/prediction?symptoms=dehydration,headache&email=jesantos0527@gmail.com";
	var url = "https://remote-health-api.herokuapp.com/api/prediction?symptoms="+ symptoms.toString()+"&email=" +email;
	console.log("PREDICTION URL: " + url);
	Requests.makeGETRequest(url, function(res){
		//console.log("PREDICTION RES: " + res);
		//console.log("PREDICTION RES Disease: " + res.disease);
		var resObj = JSON.parse(res);
		var output = "Our recommendation system predicts that you may have " + resObj.disease + ". " + resObj.description;
		//var output2 = res
		// var obj = JSON.parse(res);
		// console.log("PREDICTION RES Disease: " + obj.disease);
    	thisPointer.emit(':ask', output, Messages.HELP);
	});
	//console.log("SLOT_VALUE: " + slotVal);
    //this.emit(':ask', Messages.HELLO_WORLD, Messages.HELP);
}

var symptomHandlers = {};
// handlers['Unhandled'] = unhandledIntentHandler;
// handlers['LaunchRequest'] = launchRequestHandler;
//handlers['WelcomeIntent'] = welcomeIntentHandler;
symptomHandlers['SymptomIntent'] = symptomIntentHandler;
// handlers['AMAZON.CancelIntent'] = cancelIntentHandler;
// handlers['AMAZON.StopIntent'] = stopIntentHandler;
// handlers['AMAZON.HelpIntent'] = helpIntentHandler;
symptomHandlers['AMAZON.NoIntent'] = noIntentHandler;
symptomHandlers['AMAZON.YesIntent'] = yesIntentHandler;


var symptomSessionHandlers = Alexa.CreateStateHandler(SessionStates.states.SYMPTOMS_SESSION, symptomHandlers);

module.exports = {symptomSessionHandlers};
