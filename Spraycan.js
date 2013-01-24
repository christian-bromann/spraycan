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

        that.dataCanvas.width = that.drawCanvas.width = (h*4)/3;
        that.dataCanvas.height = that.drawCanvas.height = h;

        // that.dataCanvas.width = that.drawCanvas.width = w;
        // that.dataCanvas.height = that.drawCanvas.height = (h*3)/4;
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
    if(this.video.paused || this.video.ended) return false;
    // First, draw it into the backing dataCanvas
    this.dataContext.drawImage(this.video,0,0,this.dataCanvas.width,this.dataCanvas.height);
    // Grab the pixel data from the backing dataCanvas
    var idata = this.dataContext.getImageData(0,0,this.dataCanvas.width,this.dataCanvas.height);
    var data = idata.data;
    var pos  = this.findLightPoint(data);
    
    idata.data = data;
    requestAnimationFrame(this.draw.bind(this));
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

Spraycan.prototype.findLightPoint = function(data) {

    var topLeft = [],
        bottomRight = [],
        i = 0,
        x = 0,
        y = 0;

    // top down
    for(i = 0; i < data.length; i+=4) {
        r = data[i];
        if(r > 200) {
            x = Math.ceil(Math.floor(i/4)%this.dataCanvas.width),
            y = Math.floor(Math.floor(i/this.dataCanvas.width)/4);

            topLeft = [x,y];
            break;
        }
    }

    for(i = data.length-1; i > 0; i-=4) {
        r = data[i-3];
        if(r > 220) {
            x = Math.ceil(Math.floor(i/4)%this.dataCanvas.width),
            y = Math.floor(Math.floor(i/this.dataCanvas.width)/4);

            bottomRight = [x,y];
            break;
        }
    }

    var dx = bottomRight[0] - topLeft[0];
    var dy = bottomRight[1] - topLeft[1];
    var d  = Math.sqrt(Math.pow(dx,2) + Math.pow(dy,2));
    x = Math.ceil((topLeft[0] + bottomRight[0]) / 2);
    y = Math.ceil((topLeft[1] + bottomRight[1]) / 2);

    // this.clearCanvas();
    this.spray(x,y,20-d);
};

Spraycan.prototype.spray = function(x,y,d,distance,angle) {

    if(!x || !y) {
        return;
    }

    if (this.emptyCanvas) {
        this.drawContext.beginPath();
        this.drawContext.moveTo(x,y);
        this.lastPoint = [x,y];
        this.drawContext.strokeStyle="#FF0000";
        this.emptyCanvas = false;
    } else {

        // distance = parseInt( this.distanceBetween2Points( this.lastPoint, [x,y] ) ,10);
        // angle    = this.angleBetween2Points( this.lastPoint, [x,y] );
        
        // for ( var z=0; (z<=distance || z===0); z++ ) {
        //     x = this.lastPoint[0] + (Math.sin(angle) * z) - this.halfBrushW;
        //     y = this.lastPoint[1] + (Math.cos(angle) * z) - this.halfBrushH;
        //     this.drawContext.drawImage(this.brush, x, y);
        // }
        
        // this.lastPoint = [x,y];
    

        this.drawContext.lineWidth = d;
        this.drawContext.lineTo(x,y);
        this.drawContext.lineJoin = 'round';
        this.drawContext.stroke();

        // this.drawContext.arc(x,y,10,0,Math.PI*2, false);
        // this.drawContext.fillStyle = 'rgb(255,0,0)';
        // this.drawContext.fill();
    }
};

Spraycan.prototype.clearCanvas = function(e) {
    this.drawContext.beginPath();
    this.drawContext.clearRect( 0, 0, this.dataCanvas.width, this.dataCanvas.height );
    this.drawContext.closePath();
    this.emptyCanvas = true;
};