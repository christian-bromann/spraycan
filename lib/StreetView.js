function StreetView(mapCanvas,lat,lng) {
    this.setFocus = false;

    this.lat = lat;
    this.lng = lng;
    this.mapCanvas = mapCanvas;
    this.astorPlace = new google.maps.LatLng(this.lat, this.lng);
}

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
        heading: 100,
        zoom:1,
        pitch:0
    });

    var that = this;
    google.maps.event.addListenerOnce(this.map, 'idle', function(){

        document.querySelector('svg').addEventListener('click', function(e) {
            if(that.setFocus) {
                e.preventDefault();
                that.setFocus = false;
            }
        });

        that.focus();
    });

};

StreetView.prototype.focus = function() {
    // click on map
    this.setFocus = true;
    window.spraycan.setFocus = true;
    var evt = document.createEvent("MouseEvents");
    evt.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, true, true, true, true, 0, null);
    document.querySelector('svg').dispatchEvent(evt);
};