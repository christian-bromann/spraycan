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
        65: { name: 'Guerickestraße 17, Berlin (Veranstaltungsort)', lat:  52.516782, lng:   13.320944, h: 100 },
        66: { name: 'Grunewaldstraße, Berlin (UDK Kleistpark)',      lat:  52.490494, lng:   13.359249, h: 295 },
        67: { name: 'Potsdamer Platz, Berlin',                       lat:  52.509448, lng:   13.374622, h: 280 },
        68: { name: 'Rio de Janeiro, Brazil',                        lat: -22.955627, lng:  -43.189659, h: 245 },
        69: { name: 'Mexico City',                                   lat:  19.424557, lng:  -99.177079, h:   0 },
        70: { name: 'New York City, Times Square',                   lat:  40.758343, lng:  -73.985496, h:  30 },
        71: { name: 'Washington D.C., White House',                  lat:  38.900218, lng:  -77.036498, h: 180 },
        72: { name: 'Los Angeles, Santa Monica',                     lat:  34.007847, lng: -118.490639, h: 320 },
        73: { name: 'Las Vegas',                                     lat:  36.112977, lng: -115.173047, h: 280 },
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

    // set needed vars
    this.lat          = lat;
    this.lng          = lng;
    this.heading      = heading;
    this.mapCanvas    = mapCanvas;
    this.astorPlace   = new google.maps.LatLng(this.lat, this.lng);
}

/**
 * init Google StreetView
 * 
 * @param  {Object} options  map options
 */
StreetView.prototype.init = function(options) {
    this.mapOptions = options;
    this.mapOptions.center = this.astorPlace;

    this.map = new google.maps.Map(this.mapCanvas,this.mapOptions);

    this.panorama = this.map.getStreetView();
    this.panorama.setPosition(this.astorPlace);
    this.panorama.setVisible(true);
    this.panorama.set('navigationControl', false);
    this.panorama.set('enableCloseButton', false);
    this.panorama.setPov({
        heading: 330,
        zoom:1,
        pitch:0
    });

    var that = this;
    google.maps.event.addListenerOnce(this.map, 'idle', function(){

        document.querySelector('svg').addEventListener('click', function(e) {
            e.preventDefault();
        });

        that.focus();
    });

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

    var place = this.places[placeID],
        that  = this;

    if(!place) {
        return;
    }

    this.panorama.setOptions({
        position: new google.maps.LatLng(place.lat,place.lng),
        pov: { heading: place.h, zoom: 1, pitch: 0 }
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