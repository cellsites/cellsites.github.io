var map;

function RulerControl(controlDiv, map) {
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
addruler();
});
}

function initMap() {
	var markers = [];
	map = new google.maps.Map(document.getElementById('map'), {
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		scaleControl: true
	});
	var ctaLayer = new google.maps.KmlLayer({
		url: 'http://cellsites.github.io/sasktel_sites.kmz'
	});
	ctaLayer.setMap(map);
	// Create the DIV to hold the control and call the CenterControl()
	// constructor passing in this DIV.
	var rulerControlDiv = document.createElement('div');
	var rulerControl = new RulerControl(rulerControlDiv, map);
	rulerControlDiv.index = 1;
	map.controls[google.maps.ControlPosition.TOP_RIGHT].push(
		rulerControlDiv);
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
