"use strict";


(function() {
    var videoElement = document.querySelector('video'),
        streetView   = document.querySelector('div'),
        dataCanvas   = document.getElementById('dataCanvas'),
        drawCanvas   = document.getElementById('drawCanvas');
    
    window.spraycan     = new Spraycan(videoElement,dataCanvas,drawCanvas);

    spraycan.start();
     
    // var map;
    // var panorama;
    // var astorPlace = new google.maps.LatLng(40.729884, -73.990988);

    // // Set up the map
    // var mapOptions = {
    //     center: astorPlace,
    //     zoom: 18,
    //     mapTypeId: google.maps.MapTypeId.ROADMAP,
    //     streetViewControl: false
    // };

    // map = new google.maps.Map(streetView,mapOptions);

    // panorama = map.getStreetView();
    // panorama.setPosition(astorPlace);
    // panorama.setVisible(true);
    // panorama.setPov({
    //     heading: 265,
    //     zoom:1,
    //     pitch:0
    // });

}());

// requestAnimationFrame shim
(function() {
    var i = 0,
        lastTime = 0,
        vendors = ['ms', 'moz', 'webkit', 'o'];
    
    while (i < vendors.length && !window.requestAnimationFrame) {
        window.requestAnimationFrame = window[vendors[i] + 'RequestAnimationFrame'];
        i++;
    }
    
    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime(),
                timeToCall = Math.max(0, 1000 / 60 - currTime + lastTime),
                id = setTimeout(function() { callback(currTime + timeToCall); }, timeToCall);
            
            lastTime = currTime + timeToCall;
            return id;
        };
    }
}());