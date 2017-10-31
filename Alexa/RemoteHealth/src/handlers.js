'use strict';

var Messages = require('./messages');
var Alexa = require("alexa-sdk");
var request = require("request");
var Requests = require('./requests');

var SessionStates = require('./handlers/sessionStates');

var GOOGLE_USER_INFO = "https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=";
// var launchRequestHandler = function () {
//     this.emit(welcomeIntentHandler);
// };

// var STATES = {
// 	NEWSESSION : "_NEWSESSION",
// 	REGULAR_SESSION : "REGULAR_SESSION",
// 	SYMPTOMS_SESSION: "SYMPTOMS_SESSION"
// };

var newSessionHandler =  function(){
	console.log("NEWSESSION HANDLER");
	this.handler.state = SessionStates.states.REGULAR_SESSION;
	var speechOutput = Messages.WELCOME + " " + Messages.HELP;
    var repromptSpeech =  Messages.HELP;
    this.attributes['session_symptoms'] = []
    this.emit(':ask', speechOutput, repromptSpeech);
};


////////////////////////////////////////////////////////////////////////
//// REGULAR SESSION
////////////////////////////////////////////////////////////////////////

var launchRequestHandler = function () {
	this.handler.state = SessionStates.states.REGULAR_SESSION;
	console.log("LAUNCH_REQUEST");
	var accessToken = this.event.session.user.accessToken;
	console.log("ACCESS_TOKEN: "+ accessToken);
	var url = GOOGLE_USER_INFO + accessToken;
	// var test = this;
	// request.get(url, function(error, response, body) {
 //        var d = JSON.parse(body);
 //        console.log("REQUEST BODY: " + body);
 //        console.log("REQUEST RESPONSE: " + response);
 //        console.log("REQUEST ERROR: " + error);
        
 //        test.attributes['session_symptoms'] = []
	//     var speechOutput = Messages.WELCOME + " " + Messages.HELP;
	//     var repromptSpeech =  Messages.HELP;
	//     test.emit(':ask', speechOutput, repromptSpeech);
 //        // if (result.length > 0) {
 //        //     callback(result[0].book_details[0].title)
 //        // } else {
 //        //     callback("ERROR")
 //        // }
 //    });

 	var thisSession = this;
 	if(accessToken === null || accessToken === undefined) { 
       	this.emit(':tellWithLinkAccountCard', Messages.LINK_ACCOUNT);
    } else { 
   	    request(url, function(error, response, body) {
			if(error){
				return console.log('Error:', error);
			}
			if (response.statusCode == 200) {
				console.log("body=", body);
				var profile = JSON.parse(body);
				//speechOutput += 'Hello ' + profile.name.split(" ")[0];
				//thisSession.event.session.user['userEmail'] = profile.email;
				thisSession.attributes['user_email'] = profile.email;
				thisSession.attributes['session_symptoms'] = [];
			    var speechOutput = Messages.WELCOME + " " + Messages.HELP;
			    var repromptSpeech =  Messages.HELP;
			    thisSession.emit(':ask', speechOutput, repromptSpeech);
			} else {
				//speechOutput += 'I was unable to get your profile info from Amazon.';
				thisSession.emit(":tell", Messages.ERROR);
			}
	   	});
        //speechOutput += 'What can I do for you?';
        //var reprompt = textHelper.helpText + ' What can I do for you?';
        //response.ask(speechOutput, reprompt);
    }


    // this.attributes['session_symptoms'] = []
    // var speechOutput = Messages.WELCOME + " " + Messages.HELP;
    // var repromptSpeech =  Messages.HELP;
    // this.emit(':ask', speechOutput, repromptSpeech);
};

var symptomIntentHandler = function () {
	var slotVal = this.event.request.intent.slots.Symptom.value;
	this.handler.state = SessionStates.states.SYMPTOMS_SESSION;
	console.log("SLOT_VALUE: " + slotVal);
	//var url = "https://remote-health-api.herokuapp.com/api/prediction?symptoms=dehydration,headache&email=jesantos0527@gmail.com";
	//Requests.makeRequest(url);
	if(slotVal == null){
		this.emit(':ask', Messages.ERROR, Messages.HELP);
	}else{
		console.log("SESSION_ATTRIBUTES: " + this.attributes['session_symptoms']);
		this.attributes['session_symptoms'].push(slotVal);
		console.log("SLOT_VALUE_REGULAR_SESSION: " + slotVal);
	    this.emit(':ask', Messages.SYMPTOM_ASK, Messages.HELP);
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

////////////////////////////////////////////////////////////////////////
//// SYMPTOM SESSION
////////////////////////////////////////////////////////////////////////
// var symptomIntentHandler = function () {
// 	var slotVal = this.event.request.intent.slots.Symptom.value;
// 	this.handler.state = STATES.SYMPTOMS_SESSION;
// 	console.log("SLOT_VALUE: " + slotVal);
// 	var url = "https://remote-health-api.herokuapp.com/api/prediction?symptoms=dehydration,headache&email=jesantos0527@gmail.com";
// 	Requests.makeRequest(url);
// 	if(slotVal == null){
// 		this.emit(':ask', Messages.ERROR, Messages.HELP);
// 	}else{
// 		console.log("SESSION_ATTRIBUTES: " + this.attributes['session_symptoms']);
// 		this.attributes['session_symptoms'].push(slotVal);
// 		//console.log("SLOT_VALUE: " + slotVal);
// 	    this.emit(':ask', Messages.HELLO_WORLD, Messages.HELP);
// 	}
// };

// var yesIntentHandler = function () {
// 	//this.attributes['session_symptoms'] = []
// 	this.emit(':ask', Messages.YES + " " + Messages.HELP, Messages.HELP);
// };

// var noIntentHandler = function () {
// 	this.attributes['session_symptoms'] = []
// 	this.emit(":tell", Messages.GOODBYE);
// };







//var newSessionHandlers = {};
//newSessionHandlers['NewSession'] = newSessionHandler;

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

//var sessionHandlers = Alexa.CreateStateHandler(SessionStates.states.REGULAR_SESSION, newSessionHandlers);

var regularSessionHandlers = Alexa.CreateStateHandler(SessionStates.states.REGULAR_SESSION, handlers);


var handlersNoSession = {};
handlersNoSession['Unhandled'] = unhandledIntentHandler;
handlersNoSession['LaunchRequest'] = launchRequestHandler;
//module.exports = {sessionHandlers, handlers};
module.exports = {handlersNoSession, regularSessionHandlers};


