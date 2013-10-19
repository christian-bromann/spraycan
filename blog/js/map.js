
function SpraycanMap() {

    this.markers = [];
    this.geoData = {};

    this.ui = {
        map: document.querySelector('.map')
    };

    // initialize Google map
    this.map = new google.maps.Map(this.ui.map,{
        zoom: 4,
        center: new google.maps.LatLng(0.363882,35.044922),
        mapTypeId: google.maps.MapTypeId.ROADMAP
    });
    
    // initialize eye marker
    this.eyemarker = new google.maps.Marker({
        map: this.map,
        icon: 'img/eyemarker.png'
    });

    // establish socket connection to update user position
    this.socket = io.connect('http://localhost:8000');
    this.socket.on('position',function(pos) {

        pos = new google.maps.LatLng(pos.lat,pos.lng);

        this.map.setCenter(pos);
        this.map.setZoom(17);

        this.eyemarker.setPosition(pos);
    }.bind(this));

    // load images and initalize image markers
    this.loadedImages = [];
    this.loadImages();
}

SpraycanMap.prototype.loadImages = function() {

    var self = this;

    $.ajax('getImages.php', {
        type: 'POST',
        data: 'loaded='+this.loadedImages.join(','),
        success: function(data) {

            if(!$.isEmptyObject(data)) {
                for(var keyDate in data) {

                    this.loadedImages.push(data[keyDate].path);

                    try {
                        this.geoData[keyDate] = JSON.parse(data[keyDate].geoData.replace(/\\/g,''));
                        this.markers.push(this.addMarker(this.geoData[keyDate].geometry.location.lat,this.geoData[keyDate].geometry.location.lng,this.geoData[keyDate].formatted_address,data[keyDate].path));
                    } catch(e) {}
                }
            }
            
            // check on new images every second
            window.setTimeout(this.loadImages.bind(this),1000);

        }.bind(this),
        error: function(e) {
            console.error(e);
        }
    });
};

SpraycanMap.prototype.addMarker = function(lat,lng,address,path) {

    console.log('add marker',lat,lng);

    var marker = new google.maps.Marker({
        position: new google.maps.LatLng(lat,lng),
        map: this.map,
        title: address,
        icon: 'img/marker.png'
    });

    var content = $('<div />').addClass('markerContainer');
    var img = $('<img />').attr('src','/img/uploads/'+path);

    content.html(img);

    var infowindow = new google.maps.InfoWindow({
        content: content.html()
    });

    google.maps.event.addListener(marker, 'click', function() {
        infowindow.open(this.map,marker);
    });

    return marker;
    
};

google.maps.event.addDomListener(window, 'load', new SpraycanMap());