/**
 * constructor
 * 
 * @param {DOM Element} mapCanvas  element for Google Maps
 * @param {Integer}     lat        start latitude
 * @param {Integer}     lng        start longitude
 */
function StreetView(mapCanvas,lat,lng, heading) {

    // object with predefined places to spray
    this.places = {
        // indoor places 0-9
        49: { name: 'Yeongdeungpo-gu, Seoul, Südkorea',              lat:  37.52245 , lng:  126.890797, h: 110 },
        50: { name: 'Mäster Samuelsgatan 4, Stockholm, Schweden',    lat:  59.334415, lng:   18.07351 , h:  50 },
        51: { name: 'Railway Street, Wolverhampton, UK',             lat:  52.586903, lng:   -2.12299 , h:  20 },
        52: { name: 'Skiffervägen, Lund, Schweden',                  lat:  55.693873, lng:   13.21902 , h:  35 },
        53: { name: 'The Lee Gardens Hong Kong',                     lat:  22.278352, lng:  114.184939, h:  55 },
        54: { name: 'Hotel A Isabel, Caleta (la), Spain',            lat:  28.091518, lng:  -16.733923, h: 140 },
        55: { name: 'Toms Skateshop, Amsterdam, NH, Netherlands',    lat:  52.372056, lng:    4.895148, h: 290 },
        56: { name: 'Republikken, København V, Denmark',             lat:  55.672892, lng:   12.557877, h:  35 },
        57: { name: 'Werkplek 9, Groningen, GR, Netherlands',        lat:  45.745453, lng:    7.386271, h: 100 },
        48: { name: 'So Ouest, Levallois-Perret, France',            lat:  48.892447, lng:    2.296918, h:  10 },
        // outdoor places a-z
        65: { name: 'Fasanenstraße 88, Berlin (Veranstaltungsort)',  lat:  52.51024 , lng:   13.329817, h: 100 },
        66: { name: 'Scheidemannstraße 1, Berlin',                   lat:  52.517766, lng:   13.376247, h: 343.32, hotspot: 'rg' },
        67: { name: 'Ehrenbergstraße 32, Berlin',                    lat:  52.447133, lng:   13.287908, h: 332.61, hotspot: 'ae' },
        68: { name: 'Dorotheenstraße 27, Berlin',                    lat:  52.519133, lng:   13.391911, h: 353.49, hotspot: 'sb' },
        69: { name: 'Nordufer 28, Berlin',                           lat:  52.539716, lng:   13.340476, h: 353.86, hotspot: 'hz' },
        70: { name: 'Weydingerstraße 2, Berlin',                     lat:  52.526091, lng:   13.411283, h: 288.83, hotspot: 'rl' },
        71: { name: 'Rosa-Luxemburg-Platz 3, Berlin',                lat:  52.526679, lng:   13.411384, h: 42.62 , hotspot: 'vb' },
        72: { name: 'Charlottenstraße 85, Berlin',                   lat:  52.506469, lng:   13.392522, h: 79.83 , hotspot: 'zv' },
        73: { name: 'Unter den Linden, Berlin',                      lat:  52.517179, lng:   13.393105, h: 297.35, hotspot: 'ul' },
        74: { name: 'Barcelona, La Rambla',                          lat:  41.381747, lng:    2.172664, h: 150 },
        75: { name: 'Paris, Champs-Élysées',                         lat:  48.872139, lng:    2.300155, h: 300 },
        76: { name: 'London',                                        lat:  51.506659, lng:   -0.127373, h: 345 },
        77: { name: 'Manchester',                                    lat:  53.479772, lng:   -2.245417, h: 180 },
        78: { name: 'Dublin',                                        lat:  53.348912, lng:   -6.256714, h: 250 },
        79: { name: 'Rom, Vatikan Stadt',                            lat:  41.902341, lng:   12.460856, h: 270 },
        80: { name: 'Warschau, Polen',                               lat:  52.249349, lng:   21.055298, h:  90 },
        81: { name: 'Moskau, Roter Platz',                           lat:  55.753021, lng:   37.621629, h:   0 },
        82: { name: 'Jerusalem',                                     lat:  31.776403, lng:   35.233991, h:  40 },
        83: { name: 'Kapstadt',                                      lat: -33.986641, lng:   18.481752, h: 290 },
        84: { name: 'Bangkok',                                       lat:  13.745752, lng:  100.530765, h:  10 },
        85: { name: 'Tokyo, Shibuya',                                lat:  35.661881, lng:  139.699697, h: 130 },
        86: { name: 'Sydney',                                        lat: -33.854415, lng:  151.209812, h: 130 },
        87: { name: 'Great Barrier Reef, Queensland, Australia',     lat: -23.442931, lng:  151.906586, h:   0 },
        88: { name: 'Okubo Shaft, Japan',                            lat:  35.096764, lng:  132.446537, h:   0 },
        89: { name: 'Tenryu-ji, Japan',                              lat:  35.015893, lng:  135.674106, h: 270 },
        90: { name: 'NagasakiSaseboHuis Ten Bosch Machi, Japan',     lat:  33.083977, lng:  129.788772, h: 110 }
    };

    // set default and max values
    this.maxPitch     = 45;
    this.defaultZoom  = 1;
    this.defaultPitch = 0;
    this.inRunMode    = true;
    this.currentPlace = {};

    // set needed vars
    this.lat          = lat;
    this.lng          = lng;
    this.heading      = heading;
    this.mapCanvas    = mapCanvas;
    this.astorPlace   = new google.maps.LatLng(this.lat, this.lng);

    // socket
    this.socket = io.connect('http://93.188.109.81:8001');
}

/**
 * init Google StreetView
 * 
 * @param  {Object} options  map options
 */
StreetView.prototype.init = function(options) {
    this.mapOptions = options;
    this.mapOptions.position = this.astorPlace;
    this.mapOptions.pov = {
        heading: 330,
        zoom:1,
        pitch:0
    };

    this.panorama = new google.maps.StreetViewPanorama(this.mapCanvas,this.mapOptions);
    this.panorama.setVisible(true);

    google.maps.event.addListener(this.panorama, 'position_changed', function(pos){

        if(!document.querySelector('svg')) {
            return false;
        }

        document.querySelector('svg').addEventListener('click', function(e) {
            e.preventDefault();
        });

        // send current position to map application
        this.socket.emit('position',{
            lat: this.panorama.getPosition().lat(),
            lng: this.panorama.getPosition().lng()
        });

    }.bind(this));

    window.addEventListener('keypress', this.keyHandler.bind(this),false);
    window.addEventListener('keyup',    this.keyHandler.bind(this),false);

};

/**
 * trigger a virtual click on the map to get focus and keyboard accessibility
 */
StreetView.prototype.focus = function() {
    // click on map
    console.log('focus map');
    var evt = document.createEvent("MouseEvents");
    evt.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, true, true, true, true, 0, null);
    evt.setFocus = true;
    document.querySelector('svg').dispatchEvent(evt);
};

/**
 * map keyhandler
 * 
 * @param  {Event Object} e  event object
 */
StreetView.prototype.keyHandler = function(e) {

    e.preventDefault();
    e.stopPropagation();

    if(!this.inRunMode) {
        return;
    }

    if(e.type === 'keypress') {
        switch(e.which) {
            case 46: this.changePitch(false);
            break;
            case 44: this.changePitch(true);
            break;
        }
    } else if(e.type === 'keyup') {
        this.jump(e.which);
    }

};

/**
 * jump to a new position
 * 
 * @param  {Integer} placeID  ID of desired place
 */
StreetView.prototype.jump = function(placeID) {

    this.currentPlace = this.places[placeID]
    if(!this.currentPlace || window.spraycan.video.paused) {
        return;
    }

    this.panorama.setOptions({
        position: new google.maps.LatLng(this.currentPlace.lat,this.currentPlace.lng),
        pov: { heading: this.currentPlace.h, zoom: 1, pitch: 0 }
    });

};

/**
 * change pov pitch position
 * 
 * @param  {Boolean} isUp  direction of move (true if up, false if down)
 */
StreetView.prototype.changePitch = function(isUp) {
    var currentPov     = this.panorama.getPov(),
        currentHeading = currentPov.heading,
        currentPitch   = currentPov.pitch;

    if(Math.abs(currentPitch) >= this.maxPitch) {
        currentPitch = currentPitch < 0 ? -this.maxPitch : this.maxPitch;
    }

    this.panorama.setPov({heading: currentHeading, pitch: currentPitch + (isUp ? 1 : -1) });
};

/**
 * handles move ability with arrow keys
 *
 * @param  {Boolean} hasToStop  defines if user is allowed to walk
 */
StreetView.prototype.stopMoving = function(hasToStop) {

    if(hasToStop) {
        this.inRunMode = false;

        var evt = document.createEvent("MouseEvents");
        evt.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, true, true, true, true, 0, null);
        evt.stopMoving = true;
        document.querySelector('.mode').dispatchEvent(evt);

        this.panorama.setOptions({ linksControl: this.inRunMode });
    } else {
        this.inRunMode = true;

        this.panorama.setOptions({ linksControl: this.inRunMode });
        this.focus();
    }

};