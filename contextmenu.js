// Code adapted from http://googleapitips.blogspot.ca/2010/06/how-to-add-context-menu-to-google-maps.html

function showContextMenu(kmlEvent,map) {
	var projection;
	var contextmenuDir;
	projection = map.getProjection();
	$('.contextmenu').remove();
	contextmenuDir = document.createElement("div");
	contextmenuDir.className = 'contextmenu';
	contextmenuDir.innerHTML = '<a id="menu1" href="#"><div class="context">Show Description</div></a>'
								+ '<a id="menu2" href="#"><div class="context">Show Sectors</div></a>'
	$(map.getDiv()).append(contextmenuDir);
	var a = document.getElementById("menu1");
	a.addEventListener("click",function() {
		doShowDescription(kmlEvent);
	});
	var b = document.getElementById("menu2");
	b.addEventListener("click",function() {
		doShowSectors(kmlEvent,map);
	});
	
	setMenuXY(kmlEvent.latLng);
	contextmenuDir.style.visibility = "visible";
//	console.log(kmlEvent.latLng.lat() + ' - ' + kmlEvent.latLng.lng());
}

function getCanvasXY(currentLatLng) {
	var scale = Math.pow(2, map.getZoom());
	var nw = new google.maps.LatLng(
		map.getBounds().getNorthEast().lat(),
		map.getBounds().getSouthWest().lng()
	);
	var worldCoordinateNW = map.getProjection().fromLatLngToPoint(nw);
	var worldCoordinate = map.getProjection().fromLatLngToPoint(currentLatLng);
	var currentLatLngOffset = new google.maps.Point(
		Math.floor((worldCoordinate.x - worldCoordinateNW.x) * scale),
		Math.floor((worldCoordinate.y - worldCoordinateNW.y) * scale)
	);
	return currentLatLngOffset;
}

function setMenuXY(currentLatLng) {
	var mapWidth = $('#map_canvas').width();
	var mapHeight = $('#map_canvas').height();
	var menuWidth = $('.contextmenu').width();
	var menuHeight = $('.contextmenu').height();
	var clickedPosition = getCanvasXY(currentLatLng);
	var x = clickedPosition.x;
	var y = clickedPosition.y;
	
	if((mapWidth - x) < menuWidth)
		x = x - menuWidth;
	if((mapHeight - y) < menuHeight)
		y = y - menuHeight;

//	console.log(x + ' - ' + y);
	
	$('.contextmenu').css('left',x );
	$('.contextmenu').css('top',y );
}
