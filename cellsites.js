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
}