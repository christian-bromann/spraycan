"use strict";


(function(Spraycan,google) {
    var videoElement = document.querySelector('video'),
        streetView   = document.querySelector('div'),
        dataCanvas   = document.getElementById('dataCanvas'),
        drawCanvas   = document.getElementById('drawCanvas');
    
    window.spraycan  = new Spraycan(videoElement,dataCanvas,drawCanvas);

    window.spraycan.start();
    window.addEventListener('click', window.spraycan.clearCanvas.bind(window.spraycan),false);
     
    var panorama,
        astorPlace = new google.maps.LatLng(40.729884, -73.990988),
        mapOptions = {
            center: astorPlace,
            zoom: 10,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            streetViewControl: false,
            disableDefaultUI: true
        },
        map = new google.maps.Map(streetView,mapOptions);

    panorama = map.getStreetView();
    panorama.setPosition(astorPlace);
    panorama.setVisible(true);
    panorama.setPov({
        heading: 265,
        zoom:1,
        pitch:0
    });



}(Spraycan,google));