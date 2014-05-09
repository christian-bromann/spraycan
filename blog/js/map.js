
function SpraycanMap() {

    this.geoData = {};

    this.ui = {
        map: document.querySelector('.map')
    };

    // initialize Google map
    this.map = new google.maps.Map(this.ui.map,{
        zoom: 4,
        center: new google.maps.LatLng(50.363882,10),
        mapTypeId: google.maps.MapTypeId.ROADMAP
    });
    
    // initialize eye marker
    this.eyemarker = new google.maps.Marker({
        map: this.map,
        icon: 'img/eyemarker.png'
    });

    // establish socket connection to update user position
    this.socket = io.connect('http://93.188.109.81:8001/');
    this.socket.on('position', this.setPosition.bind(this));
    this.hotspot = document.location.pathname;

    // load images and initalize image markers
    this.loadedImages = [];
    this.loadImages();
}

SpraycanMap.prototype.setPosition = function(pos, noEyemarker) {

    pos = new google.maps.LatLng(pos.lat,pos.lng);

    this.map.setCenter(pos);
    this.map.setZoom(17);

    if(!noEyemarker) {
        this.eyemarker.setPosition(pos);
    }

}

SpraycanMap.prototype.loadImages = function() {

    var self = this;

    $.ajax('/getImages.php', {
        type: 'POST',
        data: 'loaded='+this.loadedImages.join(',') + '&hotspot='+this.hotspot.substr(1),
        success: function(data) {

            if(!$.isEmptyObject(data)) {
                for(var keyDate in data) {

                    this.loadedImages.push(data[keyDate].id);

                    try {
                        this.geoData[keyDate] = JSON.parse(data[keyDate].geoData.replace(/\\/g,''));
                        this.addMarker(this.geoData[keyDate].geometry.location.lat,this.geoData[keyDate].geometry.location.lng,this.geoData[keyDate].formatted_address,data[keyDate].path);

                        if(Object.keys(this.geoData).length === 1 && this.hotspot !== '/') {
                            this.setPosition(this.geoData[keyDate].geometry.location, true);
                        }
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
        icon: 'img/marker.png',
        imgPath: path + '.png'
    });

    var content = $('<div />').addClass('markerContainer').html(
                      $('<div />').addClass('address').height(100).width(700).html(address).append(
                          $('<img />').attr('src','/img/loader.gif').addClass('loader')
                      )
                  );

    var infoWindow = new google.maps.InfoWindow({
        content: content.html()
    });

    var self = this;

    google.maps.event.addListener(marker, 'click', function(a,b,c) {
        var img = $('<img />').attr('src','/' + this.imgPath).addClass('image');

        // after image loaded, show it
        img.load(function(a,b,c) {
            var content = $('<div />').addClass('markerContainer').html(
                              $('<div />').addClass('address').html(address).append(img)
                          );

            infoWindow.setContent(content.html());
        });

        infoWindow.open(this.map,marker);
    });

    return marker;
    
};

google.maps.event.addDomListener(window, 'load', new SpraycanMap());