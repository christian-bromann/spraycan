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

    // JUST FOR DEVELOPMENT
    var status = 0,
        trigger = function(eventName) {
            var evt = document.createEvent('Events');
            evt.initEvent(eventName, true, true);
            window.dispatchEvent(evt);
        };

    window.addEventListener('keydown', function(e) {

        if(e.which !== 32) {
            return;
        }

        switch(status++) {
            case 0: trigger('initApp');
            break;
            case 1: trigger('setup');
            break;
            case 2: trigger('prepareToSave');
            break;
            case 3: trigger('reset');
            break;
            default: status = 0;
        }

    });

}(Spraycan,StreetView,google));