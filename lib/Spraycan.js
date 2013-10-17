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
    this.timestamp       = 0;
    this.idata           = null;

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

    window.addEventListener('cleanUp', this.cleanUp.bind(this), false);
    window.addEventListener('click',   this.setupCan.bind(this), false);

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
        audio: false
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
    if(this.foundX && this.foundY) {
        this.idata = this.dataContext.getImageData( this.minLeft() , this.minTop() , 100 , 100 );
        // this.drawStrokeHelper(this.foundX, this.foundY,'rgb(255,0,0)',50);
    } else {
        this.idata = this.dataContext.getImageData(0,0,this.dataCanvas.width,this.dataCanvas.height);
    }

    var pos = this.findLightPoint(this.idata.data);
    this.idata = null;

    this.spray(pos.x,pos.y);
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

Spraycan.prototype.drawStrokeHelper = function(x,y,color,width) {

    width = width || 25;
    color = color || 'rgb(255,0,0)';

    this.drawContext.beginPath();
    this.drawContext.strokeStyle = color;
    this.drawContext.lineTo(x-width,y-width);
    this.drawContext.lineTo(x+width,y-width);
    this.drawContext.lineTo(x+width,y+width);
    this.drawContext.lineTo(x-width,y+width);
    this.drawContext.lineTo(x-width,y-width);
    this.drawContext.closePath();
    this.drawContext.stroke();
};

Spraycan.prototype.ptr2XY = function(i) {
    i /= 4;

    var paneWidth = (this.foundX && this.foundY) ? 100 : this.drawCanvas.width;
    return [
        // x
        i % paneWidth,
        // y
        Math.floor(i/paneWidth)
    ];
};

Spraycan.prototype.xy2Ptr = function(x,y) {
    x *= 4;
    y *= 4;

    var paneWidth = (this.foundX && this.foundY) ? 100 : this.drawCanvas.width;
    return (y * paneWidth) + x;
};

Spraycan.prototype.minLeft = function() { return this.foundX > 50 ? this.foundX - 50 : 0; };
Spraycan.prototype.maxLeft = function() { return this.foundX + 50 > this.drawCanvas.width ? this.drawCanvas.width : this.foundX + 50; };
Spraycan.prototype.minTop  = function() { return this.foundY > 50 ? this.foundY - 50 : 0; };
Spraycan.prototype.maxTop  = function() { return this.foundY + 50 > this.drawCanvas.height ? this.drawCanvas.height : this.foundY + 50; };

Spraycan.prototype.findLightPoint = function(data) {

    var i = 0,
        x = 0,
        y = 0,
        r = 0,
        // g = 0,
        // b = 0,
        foundSth = false,
        colors = ['rgb(255,255,255)','rgb(89,23,244)','rgb(111,2,33)','rgb(233,200,2)','rgb(111,111,111)','rgb(32,122,1)','rgb(44,66,88)'];

    // top down 
    for(i = 0; i < data.length; i+=4*5) {
        r = data[i];
        if(r > 155) {
            x = this.ptr2XY(i)[0];
            y = this.ptr2XY(i)[1];

            if(this.foundX && this.foundY) {
                x = this.minLeft() + x;
                y = this.minTop() + y;
            }

            this.foundX = x;
            this.foundY = y;

            foundSth = true;

            topLeft = [x,y];
            break;
        }
    }

    if(!foundSth) {
        this.foundX = null;
        this.foundY = null;
    }

    return {x: x, y: y};
};

Spraycan.prototype.spray = function(x,y,distance,angle) {

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
            this.drawContext.drawImage(this.brush, this.drawCanvas.width - _x, _y);
        }
        this.lastPoint = [x,y];
        this.timestamp = currentTime;

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

    if(e.setFocus || e.stopMoving) {
        return;
    }

    e.preventDefault();
    e.stopPropagation();

    if(!this.isReady()) {
        // go into spray mode
        console.log('go spraying!');
        this.drawCanvas.setAttribute('data-isready','true');
        this.mode.className += ' spray';
        this.drawCanvas.style.zIndex = 2;

        window.streetView.stopMoving(true);
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
    this.drawCanvas.setAttribute('data-saveImage','false');
    this.drawCanvas.style.zIndex = 0;

    this.drawContext.beginPath();
    this.drawContext.clearRect( 0, 0, this.dataCanvas.width, this.dataCanvas.height );
    this.drawContext.closePath();

    console.log('go walking!');
    this.mode.className = 'mode';
    this.mode.style.display = 'block';
    this.drawCanvas.style.zIndex = 0;

    // set focus on map
    window.streetView.stopMoving(false);

};