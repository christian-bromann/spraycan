"use strict";


(function(Spraycan,StreetView,google) {
    var videoElement = document.querySelector('video'),
        mapCanvas    = document.querySelector('div'),
        dataCanvas   = document.getElementById('dataCanvas'),
        drawCanvas   = document.getElementById('drawCanvas');
    
    window.spraycan   = new Spraycan(videoElement,dataCanvas,drawCanvas);
    window.streetView = new StreetView(mapCanvas,40.6983188,-73.9884594);

    window.spraycan.start();
    window.streetView.init({
        zoom: 10,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        streetViewControl: false,
        disableDefaultUI: true,
        mapTypeControl: true
    });
    window.addEventListener('click', window.spraycan.setupCan.bind(window.spraycan),false);
    
}(Spraycan,StreetView,google));