var tmpBBOX = 0;
var featureGroup;
var mapsGroup;

function init() {


    L.mapbox.accessToken = 'pk.eyJ1Ijoiamltam9uZXMiLCJhIjoib2R0ZUVmTSJ9.9fXpF8LWx9bm2WSW6hg4PQ';	

	LMap = L.mapbox.map('map', 'examples.map-i86nkdio', {attributionControl: true}).setView([40, 5], 3);
	mapsGroup = new L.featureGroup();
	mapsGroup.addTo(LMap);
	 
    featureGroup = new L.featureGroup().addTo(LMap);

	var drawControl = new L.Control.Draw({
	    edit: {
	      featureGroup: featureGroup
	    },
  		draw: {
		    polygon: true,
		    polyline: false,
		    rectangle: true,
		    circle: false,
		    marker: false

  		}
  	}).addTo(LMap);


	//** Event triggered when a geometry is created.
	LMap.on('draw:created', function(e) {
   
	  featureGroup.clearLayers();
	  mapsGroup.clearLayers();

      featureGroup.addLayer(e.layer);
      console.log(toWKT(e.layer));
      
      wktBBOX=toWKT(e.layer);
      
	  executeQuery(0);

	  //** Removing (if applicable) spatial filter to current view.
	  LMap.removeLayer(tmpBBOX);

	  $("#selectArea").addClass('').removeClass('active');
	  $("#selectArea").attr('value', 'remove');
	  $("#selectArea").html('Remove Spatial Filter');

  	});

}

function plotGeometry(wkt) {


	mapsGroup.clearLayers();
	mapsGroup.addLayer(omnivore.wkt.parse(unescape(wkt)));

	if($("#imgZoom").attr("value")=="on") 
	{
	  LMap.fitBounds(mapsGroup.getBounds());
	}
	
}

function setSpatiatConstraint(){
	
	//** Disabling Set Spatial Constraint Button
	$('#btnSpatialConstraint').prop('disabled', true);
	$('#btnRemoveSpatialConstraint').prop('disabled', false);

	//** Removes any previously drawn filter geometry.
	featureGroup.clearLayers();

	//** Creates a rectangle based on the current BBOX
	var bounds = [[LMap.getBounds().getNorth(), LMap.getBounds().getEast()], [LMap.getBounds().getSouth(), LMap.getBounds().getWest()]];
	tmpBBOX = L.rectangle(bounds, {color: "#ff7800", weight: 1});

	tmpBBOX.addTo(LMap);

	//** Setting spatial constraint and executing query to filter out records outside the given BBOX.
	wktBBOX=toWKT(tmpBBOX);
	executeQuery(0);
}

function removeSpatiatConstraint(){
	
	//** Enabling Set Spatial Constraint Button
	$('#btnSpatialConstraint').prop('disabled', false);
	$('#btnRemoveSpatialConstraint').prop('disabled', true);

	//** Removing spatial constraint.
	LMap.removeLayer(tmpBBOX);
	wktBBOX="";
	
	//** Removing (if applicable) filter geometry.
	featureGroup.clearLayers();

	//** Removing spatial constraint from the result panel.
	executeQuery(0);


}



function toWKT(layer) {
	var lng, lat, coords = [];
	if (layer instanceof L.Polygon || layer instanceof L.Polyline) {

		var latlngs = layer.getLatLngs();

		for (var i = 0; i < latlngs.length; i++) {
			latlngs[i]
			coords.push(latlngs[i].lat + " " + latlngs[i].lng);

			if (i === 0) {
				lng = latlngs[i].lng;
				lat = latlngs[i].lat;
			}
		};

	if (layer instanceof L.Polygon) {
		return "POLYGON((" + coords.join(",") + "," + lat + " " + lng + "))";
	} else if (layer instanceof L.Polyline) {
	return "LINESTRING(" + coords.join(",") + ")";
	}
	} else if (layer instanceof L.Marker) {
	return "POINT(" + layer.getLatLng().lat + " " + layer.getLatLng().lng + ")";
	}
} 
