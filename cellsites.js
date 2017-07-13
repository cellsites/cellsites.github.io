var map;

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
	var azimuthsi = [0,0,0,0,0,0,0];
	var azcolours = ['#770000','#AA0000','#FF0000','#FFFF00','#0000FF','#00FF00','#000000' ]; 
	var thistype = 99;
	
	var $tbl = $('<tbody>').html(kmlEvent.featureData.description);
	var $structure = $tbl.find('tr');
	var structure = $tbl.find('th').map(function(){return $(this).text().toLowerCase();});
	var $datarows = $structure.nextAll('tr');
	$datarows.each(function(i){
		$(this).find('td').each(function(index,element) {
			if (structure[index] == 'type') {
				switch($(element).text()) {
					case "CELL - 5M00F9W":
						thistype = 0;
						break;
					case "PCS - 5M00F9W":
						thistype = 1;
						break;
					case "AWS - 5M00F9W":
						thistype = 2;
						break;
					case "CELL - 1M25F9W":
						thistype = 3;
						break;
					case "AWS - 10M0F9W":
						thistype = 4;
						break;
					case "BRS - 10M0F9W":
						thistype = 5;
						break;
					default:
						thistype = 6;
						break;
				}
			}
			if (structure[index] == 'azimuth') {
				var azexists = -1;
				for (var i2 = 0; i2 < azimuthsi[thistype]; i2++) {
					if (azimuths[thistype][i2] == $(element).text()) {
						azexists = i2;
					}
				}
				if (azexists == -1) {
					if(azimuthsi[thistype] == 0) {
						azimuths[thistype] = [];
					}
					azimuths[thistype][azimuthsi[thistype]] = $(element).text();
					azimuthsi[thistype]++;
				}
			}
		});
	});
	
	// triangle drawing adapted from https://developers.google.com/maps/documentation/javascript/examples/polygon-simple

    var triangle1p1 = kmlEvent.latLng;
    var firstpoly = new google.maps.Polygon();
    var numpoly = 0;
    
    var numtypes = azimuths.length;
	for (var typesi = 0; typesi < numtypes; typesi++) {
		if (azimuthsi[typesi] > 0) {
			var triangles = [];
			for (var i = 0; i < azimuthsi[typesi]; i++) {
				triangles[(i * 3)] = triangle1p1;
				triangles[(i * 3) + 1] = destVincenty(triangle1p1.lat(), triangle1p1.lng(),(Number(azimuths[typesi][i]) - 15),1500);
				triangles[(i * 3) + 2] = destVincenty(triangle1p1.lat(), triangle1p1.lng(),(Number(azimuths[typesi][i]) + 15),1500);
			};
			triangles[(i * 3)] = triangle1p1;
			var sectorspoly = new google.maps.Polygon({
				paths: triangles,
				strokeColor: azcolours[typesi],
				strokeOpacity: 0.8,
				strokeWeight: 2,
				fillColor: azcolours[typesi],
				fillOpacity: 0.35
			});
			sectorspoly.setMap(map);
			if (numpoly == 0) {
				firstpoly = sectorspoly;
			} else {
				sectorspoly.bindTo('map',firstpoly);
			}
			google.maps.event.addListener(sectorspoly,'click', function(event) {
				var menudetails = [
					["Remove", function(themap) {
							sectorspoly.setMap(themap);
						}, null]
				];
				showContextMenu(event,menudetails);
			});
			numpoly++;
		}
	}
}

function initMap() {
	var markers = [];
	map = new google.maps.Map(document.getElementById('map'), {
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		scaleControl: true
	});
	var ctaLayer = new google.maps.KmlLayer({
		url: 'http://cellsites.github.io/sasktel_sites.kmz?ver=1',
		suppressInfoWindows: true
	});
	ctaLayer.setMap(map);
	ctaLayer.addListener('click', function(kmlEvent) {
		var menudetails = [
			["Show Description", doShowDescription, kmlEvent],
			["Show Sectors", doShowSectors, kmlEvent],
			["Add Ruler", addruler, kmlEvent.latLng]
		];
		showContextMenu(kmlEvent,menudetails);
	});
	
/* 
	// Section removed since Add Ruler added to conext menu this button is probably not necessary
	// Create the DIV to hold the control and call the CenterControl()
	// constructor passing in this DIV.
	var rulerControlDiv = document.createElement('div');
	var rulerControl = new RulerControl(rulerControlDiv);
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

/*

// Button removed because not needed with add ruler in context menu

function RulerControl(controlDiv) {
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

*/
