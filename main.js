"use strict";


(function(Spraycan,StreetView,google) {
    var videoElement = document.querySelector('video'),
        mapCanvas    = document.querySelector('div'),
        dataCanvas   = document.getElementById('dataCanvas'),
        drawCanvas   = document.getElementById('drawCanvas');
    
    window.spraycan   = new Spraycan(videoElement,dataCanvas,drawCanvas);
    window.streetView = new StreetView(mapCanvas,40.729884,-73.990988);

    window.spraycan.start();
    window.streetView.init({
        zoom: 10,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        streetViewControl: false,
        disableDefaultUI: true
    });
    window.addEventListener('click', window.spraycan.clearCanvas.bind(window.spraycan),false);
    
}(Spraycan,StreetView,google));