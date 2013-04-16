(function(Spraycan,StreetView,google) {

    'use strict';

    var videoElement = document.querySelector('video'),
        mapCanvas    = document.querySelector('.maps'),
        dataCanvas   = document.getElementById('dataCanvas'),
        drawCanvas   = document.getElementById('drawCanvas');

    window.spraycan   = new Spraycan(videoElement,dataCanvas,drawCanvas);
    window.streetView = new StreetView(mapCanvas,40.6929138,-73.9884594);

    window.spraycan.start();
    window.streetView.init({
        zoom: 0,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        streetViewControl: false,
        disableDefaultUI: true,
        mapTypeControl: false
    });

}(Spraycan,StreetView,google));