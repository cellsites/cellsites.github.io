/*
	javascript ruler for google maps V3

	by Giulio Pons. http://www.barattalo.it
	this function uses the label class from Marc Ridley Blog

*/
function addruler() {

	var ruler1 = new google.maps.Marker({
		position: map.getCenter() ,
		map: map,
		draggable: true
	});

	var ruler2 = new google.maps.Marker({
		position: map.getCenter() ,
		map: map,
		draggable: true
	});
	var ruler1label = new Label({ map: map });
	var ruler2label = new Label({ map: map });
	ruler1label.bindTo('position', ruler1, 'position');
	ruler2label.bindTo('position', ruler2, 'position');

	var rulerpoly = new google.maps.Polyline({
		path: [ruler1.position, ruler2.position] ,
		strokeColor: "#FFFF00",
		strokeOpacity: .7,
		strokeWeight: 7
	});
	rulerpoly.setMap(map);

	ruler1label.set('text',google.maps.geometry.spherical.computeDistanceBetween(ruler1.getPosition(),ruler2.getPosition()));
	ruler2label.set('text',google.maps.geometry.spherical.computeDistanceBetween(ruler1.getPosition(),ruler2.getPosition()));


	google.maps.event.addListener(ruler1, 'drag', function() {
		rulerpoly.setPath([ruler1.getPosition(), ruler2.getPosition()]);
		ruler1label.set('text',google.maps.geometry.spherical.computeDistanceBetween(ruler1.getPosition(),ruler2.getPosition()));
		ruler2label.set('text',google.maps.geometry.spherical.computeDistanceBetween(ruler1.getPosition(),ruler2.getPosition()));
	});

	google.maps.event.addListener(ruler2, 'drag', function() {
		rulerpoly.setPath([ruler1.getPosition(), ruler2.getPosition()]);
		ruler1label.set('text',google.maps.geometry.spherical.computeDistanceBetween(ruler1.getPosition(),ruler2.getPosition()));
		ruler2label.set('text',google.maps.geometry.spherical.computeDistanceBetween(ruler1.getPosition(),ruler2.getPosition()));
	});

}


function distance(pos1,pos2) {
	var lat1 = pos1.lat();
	var lon1 = pos1.lng();
	var lat2 = pos2.lat();
	var lon2 = pos2.lng();
	var R = 6371; // km (change this constant to get miles)
	var dLat = (lat2-lat1) * Math.PI / 180;
	var dLon = (lon2-lon1) * Math.PI / 180; 
	var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
		Math.cos(lat1 * Math.PI / 180 ) * Math.cos(lat2 * Math.PI / 180 ) * 
		Math.sin(dLon/2) * Math.sin(dLon/2); 
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
	var d = R * c;
	if (d>1) return Math.round(d)+"km / 310deg";
	else if (d<=1) return Math.round(d*1000)+"m / 21deg";
	return d;
}