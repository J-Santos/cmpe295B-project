var natural = require('natural');

var TF_IDF = natural.TfIdf;
var porterStemer = natural.PorterStemmer.attach();

var HISTORY_1 = "Type 1 diabetes mellitus with moderate nonproliferative diabetic retinopathy without macular edema";
var HISTORY_2 = "Influenza due to unidentified influenza virus with pneumonia";
var HISTORY_3 = "Alcohol abuse with alcohol-induced psychotic disorder with hallucinations";
var HISTORY_4 = "Sleep disorders not due to a substance or known physiological condition";

exports.processResultCosineSimilarityHistory = function(results){
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
		//console.log("Disease History: " + disease + " Similarity: " + cosine_similarity);
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
	console.log("---------------------------------------------------------------------------------------");
	console.log("Predicted Disease History: " + disease);
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

exports.processResultCosineSimilarityQuery = function(inputStr, results){
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
		//console.log("Disease Query: " + disease + " Similarity: " + cosine_similarity);
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
	console.log("---------------------------------------------------------------------------------------");
	console.log("Predicted Disease Query: " + disease);
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







// function calculateTfIdf(){
// 	var tfidf = new TF_IDF();
// 	tfidf.addDocument('this document is about nodes.');
// 	tfidf.addDocument('this document is about ruby.');
// 	tfidf.addDocument('this document is about ruby and node.');
// 	tfidf.addDocument('this document is about node. it has node examples');

// 	console.log('node --------------------------------');
// 	tfidf.tfidfs('node', function(i, measure) {
// 	    console.log('document #' + i + ' is ' + measure);
// 	});

// 	console.log('ruby --------------------------------');
// 	tfidf.tfidfs('ruby', function(i, measure) {
// 	    console.log('document #' + i + ' is ' + measure);
// 	});

// 	var tfidfTEST = new TF_IDF();
// 	tfidfTEST.addDocument('life learning');
// 	//console.log(tokenizeStem(HISTORY_1));
// 	console.log('life --------------------------------');
// 	tfidfTEST.tfidfs('life', function(i, measure) {
// 	    console.log('document #' + i + ' is ' + measure);
// 	});
// 	console.log('learning --------------------------------');
// 	var test_var = 0;
// 	tfidfTEST.tfidfs('learning', function(i, measure) {
// 	    console.log('document #' + i + ' is ' + measure);
// 	    test_var = measure
// 	});
// 	console.log(test_var);
// }