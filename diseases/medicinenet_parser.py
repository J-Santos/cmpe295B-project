import csv
import urllib2
from bs4 import BeautifulSoup
import re
import json


diseases_dict = {}

#html page name is the disease and the symptom
def getSymptomsFileTypeOne(htmlElements, diseaseName):
	symptoms = []
	for divHtmlElem in htmlElements:
		check_title = divHtmlElem.previous_sibling.previous_sibling.get_text()
		# if(check_title == diseaseName):
		# 	for li_tag in divHtmlElem.findAll("li"):
		# 		text = li_tag.get_text()
		# 		clean_text = str(text).replace("\n","").lower()
		# 		clean_text = clean_text.replace('\r', '')
		# 		symptoms.append(clean_text)
		# 		print clean_text
		# 	break
		for li_tag in divHtmlElem.findAll("li"):
			text = li_tag.get_text()
			#print "Text is " + text
			clean_text = str(text.encode('utf-8')).replace("\n","").lower()
			clean_text = clean_text.replace('\r', '')
			symptoms.append(clean_text)
			#print clean_text
		#only the first div tags contain the symptoms
		break
	return symptoms

#html page name is the disease only
def getSymptomsFileTypeTwo():

	return 1

def createJsonFile(outputObj):
	with open("symptoms.json", "w") as outfile:
		#json.dump(jsonObject, outfile, indent=4)
		json.dump(outputObj, outfile)

f = open('medicinet_urls.csv')
csv_f = csv.reader(f)

url = ""
disease_name = ""
html = ""

counter = 0
diseases = {}
diseases['diseases'] = []

for row in csv_f:
	#if(row[1].endswith("Symptoms and Signs")):
	if("_symptoms_and_signs" in row[0]):
		print "URL: "+ row[0]
		print "Disease title: " + row[1]
		disease_name = row[1]
		response = urllib2.urlopen(row[0])
		html = response.read()
		soup = BeautifulSoup(html, 'html.parser')
		divTags = soup.findAll("div", { "class" : "Tab_Items" })
		symptoms = getSymptomsFileTypeOne(divTags, disease_name)
		disease_name = row[1].replace(" Symptoms and Signs", "").lower()
		#print symptoms
		diseases_dict[disease_name] = symptoms
		jsonObject = {
			'symptoms': symptoms,
			'disease' : disease_name
		}
		diseases['diseases'].append(jsonObject)


		# diseases = {}
		# jsonObject = {
		# 	'symptoms': symptoms,
		# 	'disease' : disease_name
		# }

		# diseases['diseases'] = []
		# diseases['diseases'].append(jsonObject)
		# diseases['diseases'].append(jsonObject)
		# createJsonFile(diseases)

		#print html

		# if(counter == 10):
		# 	break
		counter = counter + 1
	else:
		print "URL: "+ row[0]
		print "Disease title: " + row[1]
		disease_name = row[1]
		response = urllib2.urlopen(row[0])
		html = response.read()
		soup = BeautifulSoup(html, 'html.parser')
		divTags = soup.findAll("div", { "class" : "relCondImageQuiz" })

		for divTag in divTags:
			check_section_title = divTag.previous_sibling.previous_sibling.get_text()
			if(check_section_title.startswith("Causes of")):
				print check_section_title
				ltcTitles = divTag.findAll("span", { "class" : "ltcTitle" })
				print len(ltcTitles)
				for ltcTitle in ltcTitles:
					print ltcTitle.get_text().encode('utf-8')
		break


#createJsonFile(diseases)
#print counter














def writeOutput():
	with open('output.csv', 'wb') as csvfile:
	    filewriter = csv.writer(csvfile, delimiter=',',
	                            quotechar='|', quoting=csv.QUOTE_MINIMAL)
	    for mydiv in mydivs:
			#print mydiv.findAll("li")
			for li in mydiv.findAll("li"):
				text = li.get_text()
				clean_text = str(text).replace("\n","").lower()
				print clean_text
				#filewriter.writerow(['Symptom', clean_text])
				#if(len(text) != 0):
					#print text.replace
			break
	return

#response = urllib2.urlopen('http://www.medicinenet.com/throat_cancer_symptoms_and_signs/symptoms.htm')
#symptoms_header = '<i></i>Throat Cancer Symptoms and Signs'
#html = response.read()
#soup = BeautifulSoup(html, 'html.parser')
#divTags = soup.findAll("div", { "class" : "Tab_Items" })
#testing = soup.findAll("h5", string = re.compile('Throat Cancer Symptoms and Signs'))
#testing = soup.findAll("h5")

#print testing
#print(soup.prettify())
#print mydivs

# try:
#      data = urllib2.urlopen('http://www.medicinenet.com/throat_cancer_symptoms_and_signs/symptoms.htm').read()
# except urllib2.HTTPError, err:
# 	print('HTTPError = ' + str(err.code))
# except urllib2.URLError, e:
# 	print('URLError = ' + str(e.reason))


