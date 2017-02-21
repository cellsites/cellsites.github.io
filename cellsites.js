var map;

function RulerControl(controlDiv, map) {
	// Adapted from https://developers.google.com/maps/documentation/javascript/examples/control-custom
	
	// Set CSS for the control border.
	var controlUI = document.createElement('div');
	controlUI.style.backgroundColor = '#fff';
	controlUI.style.border = '2px solid #fff';
	controlUI.style.borderRadius = '3px';
	controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
	controlUI.style.cursor = 'pointer';
	controlUI.style.marginBottom = '22px';
	controlUI.style.textAlign = 'center';
	controlUI.title = 'Click to add a ruler';
	controlDiv.appendChild(controlUI);
	// Set CSS for the control interior.
	var controlText = document.createElement('div');
	controlText.style.color = 'rgb(25,25,25)';
	controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
	controlText.style.fontSize = '16px';
	controlText.style.lineHeight = '38px';
	controlText.style.paddingLeft = '5px';
	controlText.style.paddingRight = '5px';
	controlText.innerHTML = 'Add Ruler';
	controlUI.appendChild(controlText);
	controlUI.addEventListener('click', function() {
		addruler(map.getCenter());
	});
}

function doShowDescription(kmlEvent) {
	var infowindow = new google.maps.InfoWindow({
		content: kmlEvent.featureData.description,
		position: kmlEvent.latLng,
		pixelOffset: kmlEvent.pixelOffset
	});
	infowindow.open(map);
}

function doShowSectors(kmlEvent) {
	
	// HTML table parsing portion adapted from http://stackoverflow.com/questions/4247838/best-way-to-parse-html-in-javascript

	var azimuths = [];
	var azimuthi = 0;
	
	var $tbl = $('<tbody>').html(kmlEvent.featureData.description);
	var $structure = $tbl.find('tr');
	var structure = $tbl.find('th').map(function(){return $(this).text().toLowerCase();});
	var $datarows = $structure.nextAll('tr');
	$datarows.each(function(i){
		$(this).find('td').each(function(index,element) {
			if (structure[index] == 'azimuth') {
				var numaz = azimuths.length;
				var azexists = -1;
				for (var i2 = 0; i2 < numaz; i2++) {
					if (azimuths[i2] == $(element).text()) {
						azexists = i2;
					}
				}
				if (azexists == -1) {
					azimuths[azimuthi] = $(element).text();
					azimuthi++;
				}
			}
		});
	});
	
	// triangle drawing adapted from https://developers.google.com/maps/documentation/javascript/examples/polygon-simple

	var triangles = [];
    var triangle1p1 = kmlEvent.latLng;

	var numaz = azimuths.length;
	for (var i = 0; i < numaz; i++) {
		triangles[(i * 3)] = triangle1p1;
		triangles[(i * 3) + 1] = destVincenty(triangle1p1.lat(), triangle1p1.lng(),(Number(azimuths[i]) - 15),1500);
		triangles[(i * 3) + 2] = destVincenty(triangle1p1.lat(), triangle1p1.lng(),(Number(azimuths[i]) + 15),1500);
	};
	triangles[(i * 3) + 3] = triangle1p1;
	var sectorspoly = new google.maps.Polygon({
		paths: triangles,
		strokeColor: '#FF0000',
		strokeOpacity: 0.8,
		strokeWeight: 2,
		fillColor: '#FF0000',
		fillOpacity: 0.35
	});
	sectorspoly.setMap(map);
	

}

function initMap() {
	var markers = [];
	map = new google.maps.Map(document.getElementById('map'), {
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		scaleControl: true
	});
	var ctaLayer = new google.maps.KmlLayer({
		url: 'http://cellsites.github.io/sasktel_sites.kmz',
		suppressInfoWindows: true
	});
	ctaLayer.setMap(map);
	ctaLayer.addListener('click', function(kmlEvent) {
		showContextMenu(kmlEvent);
	});
	
/* 
	// Section removed since Add Ruler added to conext menu this button is probably not necessary
	// Create the DIV to hold the control and call the CenterControl()
	// constructor passing in this DIV.
	var rulerControlDiv = document.createElement('div');
	var rulerControl = new RulerControl(rulerControlDiv, map);
	rulerControlDiv.index = 1;
	map.controls[google.maps.ControlPosition.TOP_RIGHT].push(
		rulerControlDiv);
	
*/	
	
	// Search box code adapted from https://developers.google.com/maps/documentation/javascript/examples/places-searchbox?hl=fr
		
	var input = /** @type {HTMLInputElement} */ (document.getElementById(
		'pac-input'));
	map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
	var searchBox = new google.maps.places.SearchBox(
		/** @type {HTMLInputElement} */
		(input));
	// [START region_getplaces]
	// Listen for the event fired when the user selects an item from the
	// pick list. Retrieve the matching places for that item.
	google.maps.event.addListener(searchBox, 'places_changed', function() {
		var places = searchBox.getPlaces();
		if (places.length === 0) {
			return;
		}
		for (var i = 0, marker; marker = markers[i]; i++) {
			marker.setMap(null);
		}
		// For each place, get the icon, place name, and location.
		markers = [];
		var bounds = new google.maps.LatLngBounds();
		for (var i = 0, place; place = places[i]; i++) {
			var image = {
				url: place.icon,
				size: new google.maps.Size(71, 71),
				origin: new google.maps.Point(0, 0),
				anchor: new google.maps.Point(17, 34),
				scaledSize: new google.maps.Size(25, 25)
			};
			// Create a marker for each place.
			var marker = new google.maps.Marker({
				map: map,
				icon: image,
				title: place.name,
				position: place.geometry.location
			});
			markers.push(marker);
			bounds.extend(place.geometry.location);
		}
		map.fitBounds(bounds);
		map.setZoom(14);
	});
	// [END region_getplaces]
	// Bias the SearchBox results towards places that are within the bounds of the
	// current map's viewport.
	google.maps.event.addListener(map, 'bounds_changed', function() {
		var bounds = map.getBounds();
		searchBox.setBounds(bounds);
	});
}
