

var endpoint = "http://data.uni-muenster.de/oldmaps/sparql";

endpoint = "http://recife:8020/parliament/sparql";
endpoint = "http://giv-lodum.uni-muenster.de:8081/parliament/sparql";

var arrayCheckboxes = [];
var maxVal=0;
var minVal=0;
var loadedMaps=0;
var totalMaps=0;
var wktBBOX="";

//var resultsetLimt;	

function getResultSetSize(){

	var sparqlQuery = $.sparql("http://data.uni-muenster.de/historicmaps/sparql")
			  .prefix("maps","http://www.geographicknowledge.de/vocab/maps#")
			  .prefix("geo","http://www.opengis.net/ont/geosparql/1.0#")
			  .prefix("xsd","http://www.w3.org/2001/XMLSchema#")
			  .prefix("luc","http://www.ontotext.com/owlim/lucene#")
			  .prefix("dct","http://purl.org/dc/terms/")
			  .prefix("geof","http://www.opengis.net/def/function/geosparql/")
			  .prefix("sf","http://www.opengis.net/ont/sf#")
			  .select(["(COUNT(distinct ?map) as ?QT_MAPS)"])
			  .graph("?graph")
			  	.where("?map","a","maps:Map")
			  	.where("?map","maps:digitalImageVersion","?picture")
			  	.where("?map","maps:title","?title")			  
			  	.where("?map","maps:presentation","?presentation")		
			  	.where("?map","maps:hasScale","?scale")
			  	.where("?map","maps:mapsArea","?area")
			  	.where("?map","maps:mapsTime","?time")
			  	.where("?time","xsd:gYear","?year")
			  	.where("?area","geo:asWKT","?wkt")
			  .end();

	for(var i = 0; i<  arrayCheckboxes.length; i++) {
		
		sparqlQuery.where("?map","maps:mapsPhenomenon","?phenomenon"+i);			
		sparqlQuery.where("?phenomenon"+i,"a","<"+ arrayCheckboxes[i]+">");	

	}

	//** Deactivated due tests using Parliament (No full text search available)
	//sparqlQuery.where("?string","luc:mapsLiteralIndex",'"*'+document.getElementById("searchField").value+'*~0.9 "');
	//sparqlQuery.where("?map","?predicate","?string");
	//**

	//** Filtering key words in title and description.
	sparqlQuery.filter("REGEX(STR(?title), '"+document.getElementById("searchField").value+"', 'i') || REGEX(STR(?description), '"+document.getElementById("searchField").value+"', 'i')");

	//** Applying spatial filter
	if(wktBBOX != ""){
		sparqlQuery.filter("geof:sfWithin(?wkt,'"+wktBBOX+"'^^sf:wktLiteral)");
	}

	console.log("SPARQL Resultset Size -> "+sparqlQuery.serialiseQuery());
	
	sparqlQuery.filter("xsd:integer(?year) >= " + minVal + " && xsd:integer(?year) <= " + maxVal);
	
	sparqlQueryJson(sparqlQuery.serialiseQuery(), endpoint, callBackResultsetSize, false);

}

function setTemporalLimit(){

	var sparqlQuery = $.sparql("http://data.uni-muenster.de/historicmaps/sparql")
			  .prefix("maps","http://www.geographicknowledge.de/vocab/maps#")
			  .prefix("geo","http://www.opengis.net/ont/geosparql/1.0#")
			  .prefix("xsd","http://www.w3.org/2001/XMLSchema#")
			  .select(["(min(?year) as ?mindate)","(max(?year) as ?maxdate)"])
				  .graph("?graph")
				  	.where("?map","a","maps:Map")
				  	.where("?map","maps:digitalImageVersion","?picture")
				  	.where("?map","maps:title","?title")
				  	.where("?map","maps:presentation","?presentation")	
				  	.where("?map","maps:hasScale","?scale")
				  	.where("?map","maps:mapsArea","?area")
				  	.where("?map","maps:mapsTime","?time")
				  	.where("?time","xsd:gYear","?year")
				  	.where("?area","geo:asWKT","?wkt")
				  .end()
			  .orderby("?year").distinct();

	sparqlQueryJson(sparqlQuery.serialiseQuery(), endpoint, myCallbackTemporalConstraint, false);

}

//** Main Query

function executeQuery(offset) {

        queryOffset = offset;

	if (queryOffset==null || queryOffset==0){

		getResultSetSize();

	};

	var sparqlQuery = $.sparql("http://data.uni-muenster.de/historicmaps/sparql")
			  .prefix("maps","http://www.geographicknowledge.de/vocab/maps#")
			  .prefix("geo","http://www.opengis.net/ont/geosparql/1.0#")
			  .prefix("xsd","http://www.w3.org/2001/XMLSchema#")
			  .prefix("luc","http://www.ontotext.com/owlim/lucene#")
			  .prefix("dct","http://purl.org/dc/terms/")
			  .prefix("geof","http://www.opengis.net/def/function/geosparql/")
			  .prefix("sf","http://www.opengis.net/ont/sf#")
			  .select(["?map", "?title", "?scale", "?wkt", "?picture", "?year", "?description", "?presentation"])
			  	.graph("?graph")
				  	.where("?map","a","maps:Map")
				  	.where("?map","maps:digitalImageVersion","?picture")
				  	.where("?map","maps:title","?title")
				  	.where("?map","maps:presentation","?presentation")			  	
				  	.where("?map","maps:hasScale","?scale")
				  	.where("?map","maps:mapsArea","?area")
				  	.where("?map","maps:mapsTime","?time")
				  	.where("?time","xsd:gYear","?year")
				  	.where("?area","geo:asWKT","?wkt")
					.optional().where("?map","dct:description","?description").end()					
			  	.end()
			  		.orderby("?year").distinct()

			  .limit(queryLimit)
			  .offset(queryOffset);

	for(var i = 0; i<  arrayCheckboxes.length; i++) {
		
		sparqlQuery.where("?map","maps:mapsPhenomenon","?phenomenon"+i);			
		sparqlQuery.where("?phenomenon"+i,"a","<"+ arrayCheckboxes[i]+">");	

	}

	//** Deactivated due tests using Parliament (No full text search available)
	//sparqlQuery.where("?string","luc:mapsLiteralIndex",'"*'+document.getElementById("searchField").value+'*~0.9 "');
	//sparqlQuery.where("?map","?predicate","?string");
	//**

	//** Filtering key words in title and description.
	sparqlQuery.filter("REGEX(STR(?title), '"+document.getElementById("searchField").value+"', 'i') || REGEX(STR(?description), '"+document.getElementById("searchField").value+"', 'i')");

	//** Applying spatial filter
	if(wktBBOX != ""){
		sparqlQuery.filter("geof:sfWithin(?wkt,'"+wktBBOX+"'^^sf:wktLiteral)");
	}	

	console.log("SPARQL -> "+sparqlQuery.serialiseQuery());
	
	sparqlQuery.filter("xsd:integer(?year) >= " + minVal + " && xsd:integer(?year) <= " + maxVal);
	
	sparqlQueryJson(sparqlQuery.serialiseQuery(), endpoint, myCallback, false);

	//setInterval($('#status').text('Loaded Maps: '+ loadedMaps + ' from ' + totalMaps),1000);
	//$('#status').text('Loaded Maps: '+ loadedMaps + ' from ' + totalMaps);	

}

function sparqlQueryJson(queryStr, endpoint, callback, isDebug) {

	var querypart = "query=" + escape(queryStr);

	// Get our HTTP request object.
	var xmlhttp = null;

	if(window.XMLHttpRequest) {
		xmlhttp = new XMLHttpRequest();
	} else if(window.ActiveXObject) {
		// Code for older versions of IE, like IE6 and before.
		xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
	} else {
		alert('Perhaps your browser does not support XMLHttpRequests?');
}


	// Set up a POST with JSON result format.
	xmlhttp.open('POST', endpoint, true); // GET can have caching probs, so POST
	xmlhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
	xmlhttp.setRequestHeader("Accept", "application/sparql-results+json");


	// Set up callback to get the response asynchronously.
	xmlhttp.onreadystatechange = function() {

	if(xmlhttp.readyState == 4) {
		if(xmlhttp.status == 200) {
			   // Do something with the results
			   if(isDebug) alert(xmlhttp.responseText);
				   callback(xmlhttp.responseText);
			 } else {
				   // Some kind of error occurred.
				   alert("Sparql query error: " + xmlhttp.status + " " + xmlhttp.responseText);
	 	}
	}
};

// Send the query to the endpoint.
xmlhttp.send(querypart);

};


// Define a callback function to receive the SPARQL JSON result.
function myCallback(str) {

	// Convert result to JSON
	var jsonObj = eval('(' + str + ')');
	
	console.log(jsonObj);	

	

	if (queryOffset == 0){ 

		$("#result").html(""); 
		$("#result").append('<ul id="itemsContainer" style="list-style-type:none"></ul>');

	}


	for(var i = 0; i<  jsonObj.results.bindings.length; i++) {

		//Creates list item.
		if (typeof jsonObj.results.bindings[i].map !== 'undefined') {

			var index = jsonObj.results.bindings[i].wkt.value.indexOf(">");
			var wkt = jsonObj.results.bindings[i].wkt.value.substring(index+1);
			var description = '';
			var title = '';
			var picture = '';
			var mapVar = '';
			var scale = '';
			var year = '';
			var presentation = '';

			if (typeof jsonObj.results.bindings[i].description !== 'undefined') {
				description = jsonObj.results.bindings[i].description.value;
			}

			if (typeof jsonObj.results.bindings[i].title !== 'undefined') {
				title = jsonObj.results.bindings[i].title.value;
			}

			if (typeof jsonObj.results.bindings[i].presentation !== 'undefined') {
				presentation = jsonObj.results.bindings[i].presentation.value;
			}

			if (typeof jsonObj.results.bindings[i].picture !== 'undefined') {
				picture = jsonObj.results.bindings[i].picture.value;
			}

			if (typeof jsonObj.results.bindings[i].map !== 'undefined') {
				mapVar = jsonObj.results.bindings[i].map.value;
			}

			if (typeof jsonObj.results.bindings[i].scale !== 'undefined') {
				scale = jsonObj.results.bindings[i].scale.value;
			}

			if (typeof jsonObj.results.bindings[i].year !== 'undefined') {
				year = jsonObj.results.bindings[i].year.value;
			}


			$("#result ul").append('<li onmousemove=plotGeometry("'+escape(wkt)+'");><a target="_blank" href=' + picture +'><img src="' +
			picture + '" alt="'+ title +'" width="90" height="90" ></a><p><a target="_blank" href=' + presentation +'>' + title + '</a><br>' + 
			scale + '<br>' + year + '</p><p>'+ description +'</p></li>');

	}
	  
	
	}

	    


	loadedMaps = $("li").size();


	$('#status').text('Loaded Maps: '+ loadedMaps + ' from ' + totalMaps);
	console.log('Loaded Maps: '+ loadedMaps + ' from ' + totalMaps);
	//window.setTimeout(console.log("test"), 1000);


	if(loadedMaps != totalMaps){

		if(loadedMaps != 0){
			$("#next").html("");
			$("#next").append('<a onclick="executeQuery('+$("li").size()+')" href="#">More</a>'); 
		}

	} else {

		$("#next").html("");
	}
	
}







function myCallbackTemporalConstraint(str) {

	// Convert result to JSON
	var jsonObj = eval('(' + str + ')');
	
	
	for(var i = 0; i<  jsonObj.results.bindings.length; i++) {
		
		minVal = parseInt(jsonObj.results.bindings[i].mindate.value);
		maxVal = parseInt(jsonObj.results.bindings[i].maxdate.value);


		setSliderRange(parseInt(jsonObj.results.bindings[i].mindate.value), parseInt(jsonObj.results.bindings[i].maxdate.value), parseInt(jsonObj.results.bindings[i].mindate.value), parseInt(jsonObj.results.bindings[i].maxdate.value));

	}
	
	executeQuery();

}




function callBackResultsetSize(str) {

	// Convert result to JSON
	var jsonObj = eval('(' + str + ')');
	
	totalMaps=jsonObj.results.bindings[0].QT_MAPS.value;
	
	//$('#status').append(' from ' + totalMaps);
	$('#status').text('Loaded Maps: '+ loadedMaps + ' from ' + totalMaps);
	console.log('Loaded Maps: '+ loadedMaps + ' from ' + totalMaps);

}
