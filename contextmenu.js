// Code adapted from http://googleapitips.blogspot.ca/2010/06/how-to-add-context-menu-to-google-maps.html

function showContextMenu(kmlEvent, menudetails) {
	var projection;
	var contextmenuDir;
	projection = map.getProjection();
	$('.contextmenu').remove();
	contextmenuDir = document.createElement("div");
	contextmenuDir.className = 'contextmenu';
	contextmenuDir.innerHTML = '';
	nummenus = menudetails.length;
	for (var i = 0; i < nummenus; i++) {
		contextmenuDir.innerHTML += '<a id="menu' + i + '" href="#"><div class="context">' + menudetails[i][0] + '</div></a>';
	}
	$(map.getDiv()).append(contextmenuDir);
	for (var i = 0; i < nummenus; i++) {
		var a = document.getElementById("menu" + i);
		a.addEventListener("click",function() {
			console.log(menudetails[i][2]);
			console.log(menudetails[i][1]);
			Function.prototype.call.call(menudetails[i][1],this,menudetails[i][2]);
			$('.contextmenu').remove();
			return false; // return false is supposed to prevent following the link but doesn't seem to work in all browsers
		});
	}
	setMenuXY(kmlEvent.latLng);
	contextmenuDir.style.visibility = "visible";
//	console.log(kmlEvent.latLng.lat() + ' - ' + kmlEvent.latLng.lng());
}

function showPolyRemoveMenu(thisEvent,sectorspoly) {
	var projection;
	var contextmenuDir;
	projection = map.getProjection();
	$('.contextmenu').remove();
	contextmenuDir = document.createElement("div");
	contextmenuDir.className = 'contextmenu';
	contextmenuDir.innerHTML = '<a id="menu1" href="#"><div class="context">Remove</div></a>';
	$(map.getDiv()).append(contextmenuDir);

	var a = document.getElementById("menu1");
	a.addEventListener("click",function() {
		sectorspoly.setMap(null);
		$('.contextmenu').remove();
		return false;
	});

	setMenuXY(thisEvent.latLng);
	contextmenuDir.style.visibility = "visible";
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
