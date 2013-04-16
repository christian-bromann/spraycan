function Spraycan(video,dataCanvas,drawCanvas) {
    this.video           = video;
    this.dataCanvas      = dataCanvas;
    this.dataContext     = dataCanvas.getContext('2d');
    this.drawCanvas      = drawCanvas;
    this.drawContext     = drawCanvas.getContext('2d');
    this.userMediaObject = null;
    this.stream          = null;
    this.brush           = new Image();
    this.brush.src       = 'img/brush2.png';
    this.halfBrushW      = 10;
    this.halfBrushH      = 10;
    this.lastPoint       = [0,0];
    this.timestamp       = 0,
    this.setFocus        = false;

    this.mode            = document.querySelector('.mode');

    var that = this;
    this.video.addEventListener('play', function(){
        that.draw();

        var w = document.documentElement.clientWidth,
            h = document.documentElement.clientHeight;

        that.video.width = w;
        that.video.height = h;

        if(w > h) {
            that.dataCanvas.width = that.drawCanvas.width = (h*4)/3;
            that.dataCanvas.height = that.drawCanvas.height = h;
        } else {
            that.dataCanvas.width = that.drawCanvas.width = w;
            that.dataCanvas.height = that.drawCanvas.height = (h*3)/4;
        }
    },false);

    window.addEventListener('cleanUp', function() {
        this.cleanUp();
    }.bind(this),false);

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

    if(!this.isReady()) {
        requestAnimationFrame(this.draw.bind(this));
        return false;
    }

    if(this.video.paused || this.video.ended) return false;
    // First, draw it into the backing dataCanvas
    this.dataContext.drawImage(this.video,0,0,this.dataCanvas.width,this.dataCanvas.height);
    // Grab the pixel data from the backing dataCanvas
    var idata = this.dataContext.getImageData(0,0,this.dataCanvas.width,this.dataCanvas.height);
    var data = idata.data;
    var pos  = this.findLightPoint(data);
    
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
            x = this.drawCanvas.width - Math.ceil(Math.floor(i/4)%this.dataCanvas.width),
            y = Math.floor(Math.floor(i/this.dataCanvas.width)/4);

            topLeft = [x,y];
            break;
        }
    }

    for(i = data.length-1; i > 0; i-=4) {
        r = data[i-3];
        if(r > 200) {
            x = this.drawCanvas.width - Math.ceil(Math.floor(i/4)%this.dataCanvas.width),
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

    var currentTime = new Date().getTime();

    if (this.isClear() || (currentTime - this.timestamp > 500)) {

        this.drawContext.closePath();
        this.drawContext.beginPath();
        this.drawContext.moveTo(x,y);
        this.lastPoint = [x,y];
        this.drawContext.strokeStyle="#FF0000";
        this.drawCanvas.setAttribute('data-isempty','false');
        this.timestamp = currentTime;
    } else {

        distance = parseInt( this.distanceBetween2Points( this.lastPoint, [x,y] ) ,10);
        angle    = this.angleBetween2Points( this.lastPoint, [x,y] );
        for ( var z=0; (z<=distance || z===0); z++ ) {
            var _x = this.lastPoint[0] + (Math.sin(angle) * z) - this.halfBrushW;
            var _y = this.lastPoint[1] + (Math.cos(angle) * z) - this.halfBrushH;
            this.drawContext.drawImage(this.brush, _x, _y);
        }
        this.lastPoint = [x,y];
        this.timestamp = currentTime;

        // this.drawContext.lineTo(x,y);
        // this.drawContext.lineJoin = 'round';
        // this.drawContext.stroke();

        // this.drawContext.arc(x,y,10,0,Math.PI*2, false);
        // this.drawContext.fillStyle = 'rgb(255,0,0)';
        // this.drawContext.fill();
    }
};

Spraycan.prototype.isClear = function() {
    return this.drawCanvas.getAttribute('data-isempty') === 'true';
};

Spraycan.prototype.isReady = function() {
    return this.drawCanvas.getAttribute('data-isready') === 'true';
};

Spraycan.prototype.prepareScreenshot = function() {
    this.mode.style.display = 'none';
    this.drawCanvas.setAttribute('data-lat',window.streetView.panorama.getPosition().lat());
    this.drawCanvas.setAttribute('data-lng',window.streetView.panorama.getPosition().lng());
};

Spraycan.prototype.setupCan = function(e) {

    if(this.setFocus) {
        this.setFocus = false;
        return;
    }

    e.preventDefault();

    if(!this.isReady()) {
        // go into spray mode
        console.log('go spraying!');
        this.drawCanvas.setAttribute('data-isready','true');
        this.mode.className += ' spray';
        this.drawCanvas.style.zIndex = 2;
    } else {
        // set lng/lat of current position
        this.prepareScreenshot();
    }
};

Spraycan.prototype.cleanUp = function() {
    // save image, go into walk mode
    console.log('got message to clean up that shit');
    this.drawCanvas.setAttribute('data-isempty','true');
    this.drawCanvas.setAttribute('data-isready','false');
    this.drawCanvas.style.zIndex = 0;

    this.drawContext.beginPath();
    this.drawContext.clearRect( 0, 0, this.dataCanvas.width, this.dataCanvas.height );
    this.drawContext.closePath();

    console.log('go walking!');
    this.mode.className += 'mode';
    this.mode.style.display = 'block';
    this.drawCanvas.style.zIndex = 0;

    // set focus on map
    window.streetView.focus();

};