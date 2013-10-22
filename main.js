(function(Spraycan,StreetView,google) {

    'use strict';

    var videoElement = document.querySelector('video'),
        mapCanvas    = document.querySelector('.maps'),
        dataCanvas   = document.getElementById('dataCanvas'),
        drawCanvas   = document.getElementById('drawCanvas');

    window.spraycan   = new Spraycan(videoElement,dataCanvas,drawCanvas);
    window.streetView = new StreetView(mapCanvas,40.6929138,-73.9884594);

    window.streetView.init({
        linksControl: true,
        panControl: false,
        zoomControl: false,
        scaleControl: false,
        scrollwheel: false,
        draggable: false,
        enableCloseButton: false
    });

}(Spraycan,StreetView,google));