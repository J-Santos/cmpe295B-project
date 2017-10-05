var request = require("request");
//var ajaxRequest = require("ajax-request");
var elasticsearch = require("elasticsearch");
var natural = require('natural');


var TF_IDF = natural.TfIdf;
var porterStemer = natural.PorterStemmer.attach();
//var TF_IDF = new TfIdf();

var ELASTICSEARCH_HOSTNAME = "https://search-diseases-symptoms-pyhhcjkict7d5ksiazurzo4m2a.us-west-2.es.amazonaws.com";
var ELASTICSEARCH_API = "/diseases/api/_search";
//var ELASTICSEARCH_QUERY_PARAMS = "?pretty=true&q=symptoms:headache";
const NUM_OF_SYMPTOMS = 2895;
const NUM_OF_DISEASES = 1174;
const LAPLACE_SMOTHING_ALPHA = 2;

function makeElasticSearchRequest(query, inputStr, callback){
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
		var disease = processResult(hits);
		processResultHistory(hits);
		processResultQuery(inputStr, hits);
		callback(null, disease);
	}, function (err) {
		console.error(err.message);
	});
}

function processResult(results){
	var disease = "";
	var description = "";
	var probability = 0;
	for(var i =0; i < results.length; i++){
		var num_of_symptoms = results[i]._source.symptoms.length;
		var conditional_p = calculateProbabilitySymptomGivenDisease(1, num_of_symptoms, NUM_OF_SYMPTOMS);
		var p = calculateProbabilityDisease(results[i]._source.disease);
		var prob = p * conditional_p;
		if(prob > probability){
			probability = prob;
			disease = results[i]._source.disease;
			description = results[i]._source.description;
		}
		// console.log("PROBABILITY: " + prob);
		// console.log("DISEASE: " +  results[i]._source.disease);
	}
	// console.log("P " + probability);
	var outputDisease = {"disease" : disease, "description" : description};
	console.log("Predicted Disease: " + disease);
	//console.log("---------------------------------------------------------------------------------------");
	return outputDisease;
}

function calculateProbabilitySymptomGivenDisease(diseaseFrequecy, numSymptoms, totalSymptoms ){
	// diseaseFrequecy: Frequency of same disease in the dataset
	// numSymptoms: Total symptoms of the particular disease
	// totalSymptoms: total symptoms in the dataset
	// alpha = LAPLACE_SMOTHING_ALPHA: known as Laplace Smoothing
	// P(symptom_i | Disease) = diseaseFrequecy + alpha
	//				   		   ___________________________________				
	//						   numSymptoms + alpha * totalSymptoms 
	//	
	var numerator = diseaseFrequecy + LAPLACE_SMOTHING_ALPHA;
	var denominator = numSymptoms + (LAPLACE_SMOTHING_ALPHA * totalSymptoms);
	return numerator/denominator;
}

function calculateProbabilityDisease(disease) {
	// Using Laplace Law of Succession
	// P(Disease) = N(Disease) + 1
	//				______________
	//					N + 2
	// N(Disease): number of times the disease appears in the dataset
	// N: total number of diseases
	var num_of_times_in_dataset = 1;
	var probability = (num_of_times_in_dataset + 1) / (NUM_OF_DISEASES + 2)
	return probability;
}

function buildQueryParameter(symptoms, matchType){
	var match_phrases_array = [];
	for(var i=0; i < symptoms.length; i++){
		var phrase = {};
		phrase[matchType] = {"symptoms" : symptoms[i]};
		match_phrases_array.push(phrase);
	}
	var query = {
		"size" : 2000,
		"query" : {
			"bool" : {
				"should" : match_phrases_array,
				"minimum_should_match" : match_phrases_array.length
			}
		}
	}
	return query;
}

function makePrediction(symptoms, matchType, inputStr, callback){
	var query = buildQueryParameter(symptoms, matchType);
	//console.log("-- Request Query: " + JSON.stringify(query, undefined, 2));
	console.log("Request Query: " + JSON.stringify(query));
	makeElasticSearchRequest(query, inputStr, callback);
	return;
}

exports.predictDisease = function (req, callback){
	//calculateTfIdf();

	var symptomsStr = req.query.symptoms;
	var symptoms = symptomsStr.split(",");
	var matchType = req.query.match;
	if(matchType == "exact"){
		makePrediction(symptoms, "match_phrase", symptomsStr,callback);
	}else if(matchType == "proximity"){
		makePrediction(symptoms, "match", symptomsStr ,callback);
	}else{
		var outputDisease = {"disease" : "", "description" : ""};
		callback(null, outputDisease);
	}
}
var HISTORY_1 = "Type 1 diabetes mellitus with moderate nonproliferative diabetic retinopathy without macular edema";
var HISTORY_2 = "Influenza due to unidentified influenza virus with pneumonia";
var HISTORY_3 = "Alcohol abuse with alcohol-induced psychotic disorder with hallucinations";
var HISTORY_4 = "Sleep disorders not due to a substance or known physiological condition";

function calculateTfIdf(){
	var tfidf = new TF_IDF();
	tfidf.addDocument('this document is about nodes.');
	tfidf.addDocument('this document is about ruby.');
	tfidf.addDocument('this document is about ruby and node.');
	tfidf.addDocument('this document is about node. it has node examples');

	console.log('node --------------------------------');
	tfidf.tfidfs('node', function(i, measure) {
	    console.log('document #' + i + ' is ' + measure);
	});

	console.log('ruby --------------------------------');
	tfidf.tfidfs('ruby', function(i, measure) {
	    console.log('document #' + i + ' is ' + measure);
	});

	var tfidfTEST = new TF_IDF();
	tfidfTEST.addDocument('life learning');
	//console.log(tokenizeStem(HISTORY_1));
	console.log('life --------------------------------');
	tfidfTEST.tfidfs('life', function(i, measure) {
	    console.log('document #' + i + ' is ' + measure);
	});
	console.log('learning --------------------------------');
	var test_var = 0;
	tfidfTEST.tfidfs('learning', function(i, measure) {
	    console.log('document #' + i + ' is ' + measure);
	    test_var = measure
	});
	console.log(test_var);
}

function processResultHistory(results){
	//console.log(results);
	var disease = "";
	var description = "";
	var probability = 0;

	//Based on user history results
	var history_tokenize = tokenizeStem(HISTORY_3);
	var history_vector = processDocTFIDF(history_tokenize, history_tokenize);

	for(var i =0; i < results.length; i++){
		var num_of_symptoms = results[i]._source.symptoms.length;
		var symptoms_str = results[i]._source.symptoms.join(" ");
		var cur_disease = results[i]._source.disease;
		var cur_description = results[i]._source.description;
		var document_text = cur_disease + " " + symptoms_str + " " + cur_description;
		var stemTerms = tokenizeStem(document_text);


		var disease_tokenize = tokenizeStem(document_text);
		var disease_vector = processDocTFIDF(history_tokenize, disease_tokenize)

		var cosine_similarity = calculateCosineSimilarity(history_vector, disease_vector);
		console.log("Disease History: " + disease + " Similarity: " + cosine_similarity);
		//SAMPLE_TEXT = document_text
		//console.log(stemTerms);
		//console.log(symptoms_str);
		// var conditional_p = calculateProbabilitySymptomGivenDisease(1, num_of_symptoms, NUM_OF_SYMPTOMS);
		// var p = calculateProbabilityDisease(results[i]._source.disease);
		// var prob = p * conditional_p;
		if(cosine_similarity > probability){
			probability = cosine_similarity;
			disease = cur_disease;
			description = cur_description;
		}
		// console.log("PROBABILITY: " + prob);
		// console.log("DISEASE: " +  results[i]._source.disease);
	}
	// console.log("P " + probability);
	var outputDisease = {"disease" : disease, "description" : description};
	console.log("Predicted Disease History: " + disease);
	console.log("---------------------------------------------------------------------------------------");
	return outputDisease;
	// var history_tokenize = tokenizeStem(HISTORY_1);
	// var disease_tokenize = tokenizeStem(SAMPLE_TEXT);

	// var history_vector = processDocTFIDF(history_tokenize, history_tokenize);
	// var disease_vector = processDocTFIDF(history_tokenize, disease_tokenize)


	// var history_vector = [];
	// for (var i = 0; i < history_tokenize.length; i++) {
	// 	var val = calculateTFIDF(history_tokenize[i], history_tokenize)
	// 	history_vector.push(val);
	// 	console.log("Ret val: " + val);
	// }
	// var disease_tokenize = tokenizeStem(SAMPLE_TEXT);
	// var disease_vector = [];
	// for (var i = 0; i < history_tokenize.length; i++) {
	// 	var val = calculateTFIDF(history_tokenize[i], SAMPLE_TEXT)
	// 	disease_vector.push(val);
	// 	console.log("Ret val: " + val);
	// }

	// console.log(history_vector);
	// console.log(history_vector.length);
	// console.log(calculateVectorMagnitude(history_vector));
	// console.log(disease_vector);
	// console.log(history_vector.length);
	// var dot_product = calculateDotProduct(history_vector,disease_vector);
	// console.log(dot_product);
	// var cosine_similarity = calculateCosineSimilarity(history_vector, disease_vector);
	// console.log(cosine_similarity);
}

function processResultQuery(inputStr, results){
	//console.log(results);
	var disease = "";
	var description = "";
	var probability = 0;

	//Based on user history results
	var input_tokenize = tokenizeStem(inputStr);
	var input_vector = processDocTFIDF(input_tokenize, input_tokenize);

	for(var i =0; i < results.length; i++){
		var num_of_symptoms = results[i]._source.symptoms.length;
		var symptoms_str = results[i]._source.symptoms.join(" ");
		var cur_disease = results[i]._source.disease;
		var cur_description = results[i]._source.description;
		var document_text = cur_disease + " " + symptoms_str + " " + cur_description;
		var stemTerms = tokenizeStem(document_text);


		var disease_tokenize = tokenizeStem(document_text);
		var disease_vector = processDocTFIDF(input_tokenize, disease_tokenize)

		var cosine_similarity = calculateCosineSimilarity(input_vector, disease_vector);
		console.log("Disease Query: " + disease + " Similarity: " + cosine_similarity);
		//SAMPLE_TEXT = document_text
		//console.log(stemTerms);
		//console.log(symptoms_str);
		// var conditional_p = calculateProbabilitySymptomGivenDisease(1, num_of_symptoms, NUM_OF_SYMPTOMS);
		// var p = calculateProbabilityDisease(results[i]._source.disease);
		// var prob = p * conditional_p;
		if(cosine_similarity > probability){
			probability = cosine_similarity;
			disease = cur_disease;
			description = cur_description;
		}
		// console.log("PROBABILITY: " + prob);
		// console.log("DISEASE: " +  results[i]._source.disease);
	}
	// console.log("P " + probability);
	var outputDisease = {"disease" : disease, "description" : description};
	console.log("Predicted Disease Query: " + disease);
	console.log("---------------------------------------------------------------------------------------");
	return outputDisease;
}

function processDocTFIDF(words, doc) {
	//var tokenize = tokenizeStem(doc);
	var vector = [];
	for (var i = 0; i < words.length; i++) {
		var val = calculateTFIDF(words[i], doc)
		vector.push(val);
		//console.log("Ret val: " + val);
	}
	return vector;
}

function calculateTFIDF(term, tokenizeDoc){
	var tf_idf = new TF_IDF();
	tf_idf.addDocument(tokenizeDoc)
	var val = 0;
	tf_idf.tfidfs(term, function(i, measure) {
	    //console.log('IN CALCULATE: document #' + i + ' is ' + measure);
	    val = measure
	});
	return val;
}

function calculateCosineSimilarity(doc1Vector, doc2Vector) {
	var dot_product = calculateDotProduct(doc1Vector, doc2Vector);
	var doc1VectorMag = calculateVectorMagnitude(doc1Vector);
	var doc2VectorMag = calculateVectorMagnitude(doc2Vector);
	if(doc1VectorMag != 0 && doc2VectorMag != 0){
		return dot_product / (doc1VectorMag * doc2VectorMag);
	}
	return 0;
}

function calculateDotProduct(vector1, vector2) {
	//both vectors are the same size
	var dot_product = 0;
	for (var i = 0; i < vector1.length; i++) {
		dot_product += (vector1[i] * vector2[i]);
	}
	return dot_product;
}

function calculateVectorMagnitude(vector) {
	var temp = 0;
	for (var i = 0; i < vector.length; i++) {
		temp += Math.pow(vector[i], 2);
	}
	return Math.sqrt(temp);
}

function tokenizeStem(str){
	return str.tokenizeAndStem();
}


// # Using Naive Bayes for independent events (http://scikit-learn.org/stable/modules/naive_bayes.html)
// #						n
// # Y = arg max_y(P(y) * TT P(x_i | y))
// #					   i=1	
// #
// #file:///Users/jelson/Downloads/1789_Anil_DiseasePredictor.pdf
// #							  n
// # Y = arg max_y(P(Disease) * TT P(symptom_i | Disease))
// #					   		 i=1
// # P(symptom_i | Disease) = N_yi + alpha			N_yi: Frequency of same disease in the dataset
// #						   ____________			N_y: Total symptoms of the particular disease
// #						   N_y + alpha * n 		n: total symptoms in the dataset
// #												alpha: known as Laplace Smoothing
// #
// # We can apply Laplace Smoothing to P(symptom_i | Disease) to prevent instances where 
// # it's not found and probability is 0
// # Laplace Smoothing(http://www.cs.toronto.edu/~bonner/courses/2007s/csc411/lectures/03bayes.zemel.pdf)
// # P(A_i = v_j|c_k) = n_ijk + 1			n_ijk = number of examples where A_i = v_j
// #					 ---------	
// #					 n_k + s_i 			n_k = number of examples in c_k
// #									    s_i = number of possible values of A_i
// #
// # Laplace source 2: https://inst.eecs.berkeley.edu/~cs188/sp12/slides/cs188%20lecture%2020%20--%20naive%20bayes%206PP.pdf
// # P(x|y) = c(x,y) + k
// # 		   __________
// #		   c(y) + k*|X|
// #
// #
// #
// ##############################################################################################

