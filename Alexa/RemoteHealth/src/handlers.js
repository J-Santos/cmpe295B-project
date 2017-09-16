'use strict';

var Messages = require('./messages')

// var launchRequestHandler = function () {
//     this.emit(welcomeIntentHandler);
// };

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
	console.log("SESSION_ATTRIBUTES: " + this.attributes['session_symptoms']);
	this.attributes['session_symptoms'].push(slotVal);
	//console.log("SLOT_VALUE: " + slotVal);
    this.emit(':ask', Messages.HELLO_WORLD, Messages.HELP);
};

var cancelIntentHandler = function () {
	this.attributes['session_symptoms'] = []
	this.emit(":tell", Messages.GOODBYE);
};

var stopIntentHandler = function () {
	this.attributes['session_symptoms'] = []
	this.emit(":tell", Messages.GOODBYE);
};

var handlers = {};
handlers['LaunchRequest'] = launchRequestHandler;
//handlers['WelcomeIntent'] = welcomeIntentHandler;
handlers['SymptomIntent'] = symptomIntentHandler;
handlers['AMAZON.CancelIntent'] = cancelIntentHandler;
handlers['AMAZON.StopIntent'] = stopIntentHandler;

module.exports = handlers;