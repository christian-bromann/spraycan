function StreetView(mapCanvas,lat,lng) {
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
    this.panorama.setPov({
        heading: 265,
        zoom:1,
        pitch:0
    });

};