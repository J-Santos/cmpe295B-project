var mongoose    =   require("mongoose");

var familyMedicalHistorySchema  = new mongoose.Schema({
	"alcoholism": {type: String},
	"cancer": {type: String},
	"epilepsy_seizures": {type: String},
	"high_blood_pressure": {type: String},
	"migraine_headaches": {type: String},
	"stroke": {type: String},
	"psychiatric_problems": {type: String},
	"bleeding_problems": {type: String},
	"diabetes_high_blood_sugar)": {type: String},
	"heart_disease": {type: String},
	"high_cholesterol": {type: String},
	"sickle_cell_disease": {type: String},
	"thyroid_disease": {type: String},
	"tuberculosis": {type: String},
	"arthritis": {type: String},
	"nervous_breakdown": {type: String},
	"other": {type: String},
	"comments": {type: String}
});

exports.FamilyMedicalHistory = mongoose.model('FamilyMedicalHistory', familyMedicalHistorySchema);



//Alcoholism
//Cancer (what kind?)
//Epilepsy (seizures)
//High Blood Pressure
//Migraine Headaches
//Stroke
//Psychiatric Problems
//Bleeding Problems
//Diabetes (high blood sugar)
//Heart Disease
//High Cholesterol
//Sickle Cell Disease
//Thyroid Disease
//Tuberculosis
//Arthritis
//Nervous Breakdown
//Other
//Comments (If yes to any of the above, please indicate which relatives)


//Do you smoke?
//Do you drink alcohol?
//Have you ever felt you should cut down on drinking alcohol?
//Do you use drugs?
//Do you have any sleep problems? 
//Are you often sad or depressed?
//Do you get regular physical exercise?
//Are you sexually active?
//Do you practice safe sex? 
//Have you had any of the of the following?
//					Chlamydia	Gonorrhea	Herpes
//					Genital Warts	Syphilis	Trichomonas




////FOR WOMEN ONLY
//Have you had a history of breast problems (lumps, nipple discharge, cancer) or surgery (including implants, biopsy)?
