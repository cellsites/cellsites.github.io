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

	ruler1label.set('text',distandbear(ruler1.getPosition(),ruler2.getPosition()));
	ruler2label.set('text',distandbear(ruler2.getPosition(),ruler1.getPosition()));


	google.maps.event.addListener(ruler1, 'drag', function() {
		rulerpoly.setPath([ruler1.getPosition(), ruler2.getPosition()]);
		ruler1label.set('text',distandbear(ruler1.getPosition(),ruler2.getPosition()));
		ruler2label.set('text',distandbear(ruler2.getPosition(),ruler1.getPosition()));
	});

	google.maps.event.addListener(ruler2, 'drag', function() {
		rulerpoly.setPath([ruler1.getPosition(), ruler2.getPosition()]);
		ruler1label.set('text',distandbear(ruler1.getPosition(),ruler2.getPosition()));
		ruler2label.set('text',distandbear(ruler2.getPosition(),ruler1.getPosition()));
	});

}


function distandbear(pos1,pos2) {
	var d = google.maps.geometry.spherical.computeDistanceBetween(pos1,pos2);
	var h = google.maps.geometry.spherical.computeHeading(pos1,pos2);
	if (h<0) h = 360+h;
	if (d>1000) return Math.round(d/1000)+"km / "+Math.round(h)+"deg";
	else if (d<=1000) return Math.round(d)+"m / "+Math.round(h)+"deg";
	return d;
}