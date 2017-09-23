'use strict';

var Messages = require('./messages');
var Alexa = require("alexa-sdk");
var Requests = require('./requests');

// var launchRequestHandler = function () {
//     this.emit(welcomeIntentHandler);
// };

var STATES = {
	NEWSESSION : "_NEWSESSION",
	INSESSION : "_INSESSION"
};

var newSessionHandler =  function(){
	this.handler.state = STATES.INSESSION;
	var speechOutput = Messages.WELCOME + " " + Messages.HELP;
    var repromptSpeech =  Messages.HELP;
    this.attributes['session_symptoms'] = []
    this.emit(':ask', speechOutput, repromptSpeech);
};

var launchRequestHandler = function () {
	console.log("LAUNCH_REQUEST");
	this.attributes['session_symptoms'] = []
    var speechOutput = Messages.WELCOME + " " + Messages.HELP;
    var repromptSpeech =  Messages.HELP;
    this.emit(':ask', speechOutput, repromptSpeech);
};

var symptomIntentHandler = function () {
	var slotVal = this.event.request.intent.slots.Symptom.value;
	console.log("SLOT_VALUE: " + slotVal);
	Requests.makeRequest();
	if(slotVal == null){
		this.emit(':ask', Messages.ERROR, Messages.HELP);
	}else{
		console.log("SESSION_ATTRIBUTES: " + this.attributes['session_symptoms']);
		this.attributes['session_symptoms'].push(slotVal);
		//console.log("SLOT_VALUE: " + slotVal);
	    this.emit(':ask', Messages.HELLO_WORLD, Messages.HELP);
	}
};

var cancelIntentHandler = function () {
	this.attributes['session_symptoms'] = [];
	this.emit(":tell", Messages.GOODBYE);
};

var stopIntentHandler = function () {
	this.attributes['session_symptoms'] = [];
	this.emit(":tell", Messages.GOODBYE);
};

var helpIntentHandler = function () {
	//this.attributes['session_symptoms'] = []
	this.emit(':ask', Messages.HELP, Messages.HELP);
};

var yesIntentHandler = function () {
	//this.attributes['session_symptoms'] = []
	this.emit(':ask', Messages.YES + " " + Messages.HELP, Messages.HELP);
};

var noIntentHandler = function () {
	this.attributes['session_symptoms'] = []
	this.emit(":tell", Messages.GOODBYE);
};

var unhandledIntentHandler = function () {
	this.emit(':ask', Messages.ERROR, Messages.HELP);
};


// var copyIntentHandler = function () {
// 	//var slotVal = this.event.request.intent.slots.Symptom.value;
// 	console.log("SLOT_VALUE: " + slotVal);
// 	//console.log("SESSION_ATTRIBUTES: " + this.attributes['session_symptoms']);
// 	//this.attributes['session_symptoms'].push(slotVal);
// 	//console.log("SLOT_VALUE: " + slotVal);
//     this.emit(':ask', Messages.ERROR, Messages.HELP);
// };

var newSessionHandlers = {};
newSessionHandlers['NewSession'] = newSessionHandler;

var handlers = {};
handlers['Unhandled'] = unhandledIntentHandler;
handlers['LaunchRequest'] = launchRequestHandler;
//handlers['WelcomeIntent'] = welcomeIntentHandler;
handlers['SymptomIntent'] = symptomIntentHandler;
handlers['AMAZON.CancelIntent'] = cancelIntentHandler;
handlers['AMAZON.StopIntent'] = stopIntentHandler;
handlers['AMAZON.HelpIntent'] = helpIntentHandler;
handlers['AMAZON.NoIntent'] = noIntentHandler;
handlers['AMAZON.YesIntent'] = yesIntentHandler;

//handlers['CopyIntent'] = copyIntentHandler;

var sessionHandlers = Alexa.CreateStateHandler(STATES.INSESSION, handlers);

module.exports = {sessionHandlers, newSessionHandlers};