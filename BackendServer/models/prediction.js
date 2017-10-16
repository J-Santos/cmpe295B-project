var request = require("request");
//var ajaxRequest = require("ajax-request");
var elasticsearch = require("elasticsearch");
// var natural = require('natural');
var naiveBayesModel = require('./naiveBayes.js');
var cosineSimilarityModel = require('./cosineSimilarity.js');

// var TF_IDF = natural.TfIdf;
// var porterStemer = natural.PorterStemmer.attach();
//var TF_IDF = new TfIdf();

var ELASTICSEARCH_HOSTNAME = "https://search-diseases-symptoms-pyhhcjkict7d5ksiazurzo4m2a.us-west-2.es.amazonaws.com";
var ELASTICSEARCH_API = "/diseases/api/_search";
//var ELASTICSEARCH_QUERY_PARAMS = "?pretty=true&q=symptoms:headache";
// const NUM_OF_SYMPTOMS = 2895;
// const NUM_OF_DISEASES = 1174;
// const LAPLACE_SMOTHING_ALPHA = 2;


exports.predictDisease = function (req, callback){
	var email = req.query.email;
	var symptomsStr = req.query.symptoms;
	var symptoms = symptomsStr.split(",");
	makePrediction(email, symptoms, symptomsStr ,callback);
}

// exports.predictDisease = function (req, callback){
// 	//calculateTfIdf();
// 	var email = req.query.email;
// 	var symptomsStr = req.query.symptoms;
// 	var symptoms = symptomsStr.split(",");
// 	var matchType = req.query.match;
// 	if(matchType == "exact"){
// 		makePrediction(email, symptoms, "match_phrase", symptomsStr,callback);
// 	}else if(matchType == "proximity"){
// 		makePrediction(email, symptoms, "match", symptomsStr ,callback);
// 	}else{
// 		var outputDisease = {"disease" : "", "description" : ""};
// 		callback(null, outputDisease);
// 	}
// }

function makePrediction(email, symptoms, inputStr, callback){
	var query = buildQueryParameter(symptoms);
	//console.log("-- Request Query: " + JSON.stringify(query, undefined, 2));
	console.log("Request Query: " + JSON.stringify(query));
	makeElasticSearchRequest(email, query, inputStr, callback);
	return;
}

// function makePrediction(email, symptoms, matchType, inputStr, callback){
// 	var query = buildQueryParameter(symptoms, matchType);
// 	//console.log("-- Request Query: " + JSON.stringify(query, undefined, 2));
// 	console.log("Request Query: " + JSON.stringify(query));
// 	makeElasticSearchRequest(email, query, inputStr, callback);
// 	return;
// }

function makeElasticSearchRequest(email, query, inputStr, callback){
	//var user_email = email;
	var client = new elasticsearch.Client({
	  host: ELASTICSEARCH_HOSTNAME,
	  log: 'error'
	}); 
	var headers = {
	    //'User-Agent':       'Super Agent/0.0.1',
	    'Content-Type': 'application/json'
	}

	var url = ELASTICSEARCH_HOSTNAME + ELASTICSEARCH_API;// + ELASTICSEARCH_QUERY_PARAMS;
	var options = {
	    url: url,
	    headers: headers,
	    method: 'GET',
	    data: query
	}

	client.search({
		index: 'diseases',
		type: 'api',
		body: query
	}).then(function (res) {
		//console.log(JSON.stringify(res, undefined, 2));
		var hits = res.hits.hits;
		//var disease = naiveBayesModel.processResultNaiveBayes(hits);
		cosineSimilarityModel.predictDiseaseBasedOnCosineSimilarity(email, hits, callback);
		//cosineSimilarityModel.processResultCosineSimilarityQuery(inputStr, hits);
		//callback(null, disease);
	}, function (err) {
		console.error(err.message);
	});
}

function buildQueryParameter(symptoms){
	var match_phrases_array = [];
	for(var i=0; i < symptoms.length; i++){
		var phrase = {};
		phrase["match"] = {"symptoms" : symptoms[i]};
		match_phrases_array.push(phrase);
	}
	var query = {
		"size" : 10,
		"query" : {
			"bool" : {
				"should" : match_phrases_array,
				"minimum_should_match" : match_phrases_array.length
			}
		}
	}
	return query;
}

// function buildQueryParameter(symptoms, matchType){
// 	var match_phrases_array = [];
// 	for(var i=0; i < symptoms.length; i++){
// 		var phrase = {};
// 		phrase[matchType] = {"symptoms" : symptoms[i]};
// 		match_phrases_array.push(phrase);
// 	}
// 	var query = {
// 		"size" : 2000,
// 		"query" : {
// 			"bool" : {
// 				"should" : match_phrases_array,
// 				"minimum_should_match" : match_phrases_array.length
// 			}
// 		}
// 	}
// 	return query;
// }





