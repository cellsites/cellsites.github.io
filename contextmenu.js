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
			var menunum = Number(this.id.substring(this.id.length - 1));
			menudetails[menunum][1](menudetails[menunum][2]); //execute function specified in menudetails with parameter specified in menudetails
			$('.contextmenu').remove();
			return false; // return false is supposed to prevent following the link but doesn't seem to work in all browsers
		});
	}
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
