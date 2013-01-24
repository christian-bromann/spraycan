function Spraycan(video,dataCanvas,drawCanvas) {
    this.video           = video;
    this.dataCanvas      = dataCanvas;
    this.dataContext     = dataCanvas.getContext('2d');
    this.drawCanvas      = drawCanvas;
    this.drawContext     = drawCanvas.getContext('2d');
    this.userMediaObject = null;
    this.stream          = null;
    this.emptyCanvas     = true;
    this.brush           = new Image();
    this.brush.src       = 'brush2.png';
    this.halfBrushW      = 10;
    this.halfBrushH      = 10;
    this.lastPoint       = [0,0];

    var that = this;
    this.video.addEventListener('play', function(){
        that.draw();

        var w = document.documentElement.clientWidth,
            h = document.documentElement.clientHeight;

        that.video.width = w;
        that.video.height = h;

        that.dataCanvas.width = that.drawCanvas.width = w;
        that.dataCanvas.height = that.drawCanvas.height = (w*3)/4;
    },false);

    this.initialize();
}

Spraycan.prototype.initialize = function() {
    if (!this.isSupported()) {
        console.log('Your browser doesn\'t support Spraycan.');
        return;
    }

    this.setUserMediaObject();
};

Spraycan.prototype.isSupported = function() {
    return !!(navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
};

Spraycan.prototype.setUserMediaObject = function() {
    this.userMediaObject = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
};

Spraycan.prototype.start = function() {
    
    this.userMediaObject.call(navigator, {
        video: true,
        audio: true
    }, function(localMediaStream) {

        this.stream = localMediaStream;
        this.video.src = window.URL.createObjectURL(localMediaStream);

    }.bind(this), function(e) {
        if (e.code === 1) {
          console.log('User declined permissions.');
        }
    });
};

Spraycan.prototype.draw = function() {
    if(spraycan.video.paused || spraycan.video.ended) return false;
    // First, draw it into the backing dataCanvas
    spraycan.dataContext.drawImage(spraycan.video,0,0,spraycan.dataCanvas.width,spraycan.dataCanvas.height);
    // Grab the pixel data from the backing dataCanvas
    var idata = spraycan.dataContext.getImageData(0,0,spraycan.dataCanvas.width,spraycan.dataCanvas.height);
    
    var data = idata.data;
    for(var i = 0; i < data.length; i+=4) {
        var r = data[i];
        var g = data[i+1];
        var b = data[i+2];

        if((r > 180 && r < 200) && (g > 110 && g < 130) && (b > 210 & b > 230)) {
            var x = Math.ceil(Math.floor(i / 4) % spraycan.dataCanvas.width);
            var y = Math.floor(Math.floor(i/spraycan.dataCanvas.width)/4);
            spraycan.spray(x,y,[r,g,b]);
            break;
        }
    }
    idata.data = data;

    requestAnimationFrame(spraycan.draw);
};

Spraycan.prototype.distanceBetween2Points = function ( point1, point2 ) {
 
    var dx = point2[0] - point1[0];
    var dy = point2[1] - point1[1];
    return Math.sqrt( Math.pow( dx, 2 ) + Math.pow( dy, 2 ) );
};

Spraycan.prototype.angleBetween2Points = function ( point1, point2 ) {

    var dx = point2[0] - point1[0];
    var dy = point2[1] - point1[1];

    return Math.atan2( dx, dy );
};

Spraycan.prototype.spray = function(x,y,rgb,distance,angle) {

    if(!x || !y) {
        return;
    }

    if (this.emptyCanvas) {
        this.drawContext.beginPath();
        this.drawContext.moveTo(x,y);
        this.lastPoint = [x,y];
        this.emptyCanvas = false;
    } else {

        distance = parseInt( this.distanceBetween2Points( this.lastPoint, [x,y] ) ,10);
        angle    = this.angleBetween2Points( this.lastPoint, [x,y] );
        
        for ( var z=0; (z<=distance || z===0); z++ ) {
            x = this.lastPoint[0] + (Math.sin(angle) * z) - this.halfBrushW;
            y = this.lastPoint[1] + (Math.cos(angle) * z) - this.halfBrushH;
            this.drawContext.drawImage(this.brush, x, y);
        }
        
        this.lastPoint = [x,y];
    }
};