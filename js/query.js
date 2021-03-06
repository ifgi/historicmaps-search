

var endpoint = "http://giv-lodum.uni-muenster.de:8081/parliament/sparql";
endpoint = "http://linkeddata.uni-muenster.de:8081/parliament/sparql";

namedGraph = "<http://ulb.uni-muenster.de/context/karten/"+getQueryVariable("source")+">";

var arrayCheckboxes = [];
var maxVal=0;
var minVal=0;
var loadedMaps=0;
var totalMaps=0;
var wktBBOX="";
var target;
var spinner;

//var resultsetLimt;


function getResultSetSize(){

	showSpin();
	var sparqlQuery = $.sparql("http://data.uni-muenster.de/historicmaps/sparql")
			  .prefix("maps","http://www.geographicknowledge.de/vocab/maps#")
			  .prefix("geo","http://www.opengis.net/ont/geosparql/1.0#")
			  .prefix("xsd","http://www.w3.org/2001/XMLSchema#")
			  .prefix("dct","http://purl.org/dc/terms/")
			  .prefix("geof","http://www.opengis.net/def/function/geosparql/")
			  .prefix("sf","http://www.opengis.net/ont/sf#")
			  .select(["(COUNT(?map) as ?QT_MAPS)"])
			  .graph(namedGraph)
			  	.where("?map","a","maps:Map")
			  	.where("?map","maps:digitalImageVersion","?picture")
			  	.where("?map","maps:title","?title")
			  	.where("?map","maps:presentation","?presentation")
			  	.where("?map","maps:hasScale","?scale")
			  	.where("?map","maps:mapsArea","?area")
			  	.where("?map","maps:mapsTime","?time")
			  	.where("?time","xsd:gYear","?year")
			  	.where("?area","geo:asWKT","?wkt")
					.optional().where("?map","maps:mapSize","?size").end()
			  	.optional().where("?map","dct:description","?description").end()
			  .end().distinct();
			  //.orderby("?year").distinct();

	for(var i = 0; i<  arrayCheckboxes.length; i++) {

		sparqlQuery.graph("?graph").where("?map","maps:mapsPhenomenon","?phenomenon"+i);
		sparqlQuery.graph("?graph").where("?phenomenon"+i,"a","<"+ arrayCheckboxes[i]+">");

	}

	//** - Deactivated due tests using Parliament (No full text search available)
	//** sparqlQuery.where("?string","luc:mapsLiteralIndex",'"*'+document.getElementById("searchField").value+'*~0.9 "');
	//** sparqlQuery.where("?map","?predicate","?string");
	//**

	//** Filtering key words in title and description.
	sparqlQuery.filter("REGEX(STR(?title), '"+document.getElementById("searchField").value+"', 'i') || REGEX(STR(?description), '"+document.getElementById("searchField").value+"', 'i')");

	//** Applying spatial filter
	if(wktBBOX != ""){
		sparqlQuery.filter("geof:sfWithin(?wkt,'"+wktBBOX+"'^^sf:wktLiteral)");
	}

	sparqlQuery.filter("xsd:integer(?year) >= " + minVal + " && xsd:integer(?year) <= " + maxVal);

	console.log("SPARQL Resultset Size -> "+sparqlQuery.serialiseQuery());

	sparqlQueryJson(encode_utf8(sparqlQuery.serialiseQuery()), endpoint, callBackResultsetSize, false);

}

function setTemporalLimit(){

	showSpin();

	var sparqlQuery = $.sparql("http://data.uni-muenster.de/historicmaps/sparql")
			  .prefix("maps","http://www.geographicknowledge.de/vocab/maps#")
			  .prefix("geo","http://www.opengis.net/ont/geosparql/1.0#")
			  .prefix("xsd","http://www.w3.org/2001/XMLSchema#")
			  .select(["(min(?year) as ?mindate)","(max(?year) as ?maxdate)"])
				  .graph(namedGraph)
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
			  //.orderby("?year").distinct();

	sparqlQueryJson(sparqlQuery.serialiseQuery(), endpoint, myCallbackTemporalConstraint, false);

}

//** Main Query

function executeQuery(offset) {

	showSpin();

 	queryOffset = offset


	if (offset==null){

		if(getQueryVariable("source")=="goettingen"){
				totalMaps = 85000;
		} else {
				getResultSetSize();
		}


	}

	if (offset==0){

		getResultSetSize();
		totalMaps = "[laden...]";

	};

	var sparqlQuery = $.sparql("http://data.uni-muenster.de/historicmaps/sparql")
			  .prefix("maps","http://www.geographicknowledge.de/vocab/maps#")
			  .prefix("geo","http://www.opengis.net/ont/geosparql/1.0#")
			  .prefix("xsd","http://www.w3.org/2001/XMLSchema#")
			  .prefix("dct","http://purl.org/dc/terms/")
			  .prefix("geof","http://www.opengis.net/def/function/geosparql/")
			  .prefix("sf","http://www.opengis.net/ont/sf#")
			  .select(["?map", "?title", "?scale", "?wkt", "?picture", "?year", "?description", "?presentation", "?size"])
			  	.graph(namedGraph)
				  	.where("?map","a","maps:Map")
				  	.where("?map","maps:digitalImageVersion","?picture")
				  	.where("?map","maps:title","?title")
				  	.where("?map","maps:presentation","?presentation")
				  	.where("?map","maps:hasScale","?scale")
				  	.where("?map","maps:mapsArea","?area")
				  	.where("?map","maps:mapsTime","?time")
				  	.where("?time","xsd:gYear","?year")
				  	.where("?area","geo:asWKT","?wkt")

						.optional().where("?map","maps:mapSize","?size").end()
					.optional().where("?map","dct:description","?description").end()
			  	.end()//.distinct()
			  		//.orderby("?year").distinct()

			  .limit(queryLimit)
			  .offset(queryOffset);

	for(var i = 0; i<  arrayCheckboxes.length; i++) {

		sparqlQuery.graph("?graph").where("?map","maps:mapsPhenomenon","?phenomenon"+i);
		sparqlQuery.graph("?graph").where("?phenomenon"+i,"a","<"+ arrayCheckboxes[i]+">");

	}

	//sparqlQuery.optional().where("?map","dct:description","?description").end();

	//** Deactivated due tests using Parliament (No full text search available)
	//** sparqlQuery.where("?string","luc:mapsLiteralIndex",'"*'+document.getElementById("searchField").value+'*~0.9 "');
	//** sparqlQuery.where("?map","?predicate","?string");
	//**

	//** Filtering key words in title and description.
	sparqlQuery.filter("REGEX(STR(?title), '"+document.getElementById("searchField").value+"', 'i') || REGEX(STR(?description), '"+document.getElementById("searchField").value+"', 'i')");

	//** Applying spatial filter
	if(wktBBOX != ""){
		sparqlQuery.filter("geof:sfWithin(?wkt,'"+wktBBOX+"'^^sf:wktLiteral)");
	}


	sparqlQuery.filter("xsd:integer(?year) >= " + minVal + " && xsd:integer(?year) <= " + maxVal);


	console.log("SPARQL Encoded -> "+ sparqlQuery.serialiseQuery());


	console.log("Sending SPARQL...");
	sparqlQueryJson(encode_utf8(sparqlQuery.serialiseQuery()), endpoint, myCallback, false);

console.log("SPARQL executed");
	//target.removeChild(spinner.el);

}

function getQueryVariable(variable) {
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
    if (pair[0] == variable) {
      return pair[1];
    }
  }
  alert('Query variable for Named Graph ' + variable + ' not found');
}


function encode_utf8(rohtext) {
     // dient der Normalisierung des Zeilenumbruchs
     rohtext = rohtext.replace(/\r\n/g,"\n");
     var utftext = "";
     for(var n=0; n<rohtext.length; n++)
         {
         // ermitteln des Unicodes des  aktuellen Zeichens
         var c=rohtext.charCodeAt(n);
         // alle Zeichen von 0-127 => 1byte
         if (c<128)
             utftext += String.fromCharCode(c);
         // alle Zeichen von 127 bis 2047 => 2byte
         else if((c>127) && (c<2048)) {
             utftext += String.fromCharCode((c>>6)|192);
             utftext += String.fromCharCode((c&63)|128);}
         // alle Zeichen von 2048 bis 66536 => 3byte
         else {
             utftext += String.fromCharCode((c>>12)|224);
             utftext += String.fromCharCode(((c>>6)&63)|128);
             utftext += String.fromCharCode((c&63)|128);}
         }
     return utftext;
 }

function sparqlQueryJson(queryStr, endpoint, callback, isDebug) {

	var querypart = "query=" + escape(queryStr);

	//** Get our HTTP request object.
	var xmlhttp = null;

	if(window.XMLHttpRequest) {
		xmlhttp = new XMLHttpRequest();
	} else if(window.ActiveXObject) {
		//** Code for older versions of IE, like IE6 and before.
		xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
	} else {
		alert('Perhaps your browser does not support XMLHttpRequests?');
}


	//** Set up a POST with JSON result format.
	xmlhttp.open('POST', endpoint, true); // GET can have caching probs, so POST
	xmlhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
	xmlhttp.setRequestHeader("Accept", "application/sparql-results+json");


	//** Set up callback to get the response asynchronously.
	xmlhttp.onreadystatechange = function() {

	if(xmlhttp.readyState == 4) {
		if(xmlhttp.status == 200) {
			   //** Do something with the results
			   if(isDebug) alert(xmlhttp.responseText);
				   callback(xmlhttp.responseText);
			 } else {
				   //** Some kind of error occurred.
				   alert("Sparql query error: " + xmlhttp.status + " " + xmlhttp.responseText);
	 	}
	}
};

//** Send the query to the endpoint.
xmlhttp.send(querypart);

};


//** Define a callback function to receive the SPARQL JSON result.
function myCallback(str) {

	console.log("#DEBUG query.js -> main query executed.");

	//** Convert result to JSON
	var jsonObj = eval('(' + str + ')');

	console.log(jsonObj);

	if (queryOffset == 0 || queryOffset == null){

		$("#result").html("");
		$("#result").append('<ul id="itemsContainer" style="list-style-type:none"></ul>');

	}


	for(var i = 0; i<  jsonObj.results.bindings.length; i++) {

		//** Creates list item.
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
			var size = '';

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

			if (typeof jsonObj.results.bindings[i].size !== 'undefined') {
				size = jsonObj.results.bindings[i].size.value;
			}


			$("#result ul").append('<li onmousemove=plotGeometry("'+escape(wkt)+'");><a target="_blank" href=' + picture +'><img src="' +
			picture.replace("/0/","/300/").replace("/6000/","/300/") + '" alt="'+ title +'" width="90" height="90" ></a><p><a target="_blank" href=' + presentation +'>' + title + '</a><br><br>Scale: ' +
			scale + '<br>Year: ' + year + '<br> Size: ' + size +'</p><p>'+ description +'</p></li>');

	}


	}

	hideSpin();

	loadedMaps = $("#itemsContainer li").size();

	$('#status').text('Karten ' + '('+parseInt(minVal)+'-'+parseInt(maxVal)+')' + ': '+ loadedMaps + ' von ' + totalMaps);

	console.log('#DEBUG query.js -> Loaded Maps (Update): '+ loadedMaps + ' from ' + totalMaps);

	if(loadedMaps != totalMaps && loadedMaps < totalMaps ){

		if(loadedMaps != 0){

			$("#status").append(' <a onclick="executeQuery('+$("#itemsContainer li").size()+')" href="#">[weiter]</a>');

		}

	}

}







function myCallbackTemporalConstraint(str) {


	console.log("#DEBUG query.js -> temporal limit query executed.");

	// Convert result to JSON
	var jsonObj = eval('(' + str + ')');


	for(var i = 0; i<  jsonObj.results.bindings.length; i++) {

		minVal = parseInt(jsonObj.results.bindings[i].mindate.value);
		maxVal = parseInt(jsonObj.results.bindings[i].maxdate.value);


		setSliderRange(parseInt(jsonObj.results.bindings[i].mindate.value), parseInt(jsonObj.results.bindings[i].maxdate.value), parseInt(jsonObj.results.bindings[i].mindate.value), parseInt(jsonObj.results.bindings[i].maxdate.value));

	}

	executeQuery(0);

}




function callBackResultsetSize(str) {

	console.log("#DEBUG query.js -> result set size query executed.");

	//** Convert result to JSON
	var jsonObj = eval('(' + str + ')');

	totalMaps=jsonObj.results.bindings[0].QT_MAPS.value;

	$('#status').text('Karten (' + parseInt(minVal)+'-'+parseInt(maxVal)+'): ' + loadedMaps + ' von ' + totalMaps);
	$("#status").append(' <a onclick="executeQuery('+$("li").size()+')" href="#">[weiter]</a>');

	console.log('#DEBUG query.js -> Loaded Maps (Query): '+ loadedMaps + ' from ' + totalMaps);

}
