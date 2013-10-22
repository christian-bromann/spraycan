function Spraycan(video,dataCanvas,drawCanvas) {
    // init canvas
    this.video            = video;
    this.dataCanvas       = dataCanvas;
    this.dataContext      = dataCanvas.getContext('2d');
    this.drawCanvas       = drawCanvas;
    this.drawContext      = drawCanvas.getContext('2d');

    // init brushes
    this.brushBlack       = new Image();
    this.brushBlack.src   = 'img/brushBlack.png';
    this.brushWhite       = new Image();
    this.brushWhite.src   = 'img/brushWhite.png';
    this.brushGreen       = new Image();
    this.brushGreen.src   = 'img/brushGreen.png';
    this.brush            = this.brushBlack; // default brush

    // init sounds
    this.spraySound       = new Audio('sounds/spray_can_spray.mp3');
    this.shakeSound       = new Audio('sounds/spray_paint_can_shake.mp3');

    // init default vars
    this.halfBrushW       = 10;
    this.halfBrushH       = 10;
    this.lastPoint        = [0,0];
    this.timestamp        = 0;
    this.color            = 0;
    this.status           = 0;
    this.gyro             = {};
    this.idata            = null;
    this.stopDrawing      = true;
    this.e                = 50; // 50 ohm range
    this.defaultBrushSize = 20;

    // fetch dom elements
    this.ui = {
        mode: document.querySelector('.mode'),
        layer: {
            start: document.querySelector('.start'),
            grabCan: document.querySelector('.grabCanLayer'),
            takePicture: document.querySelector('.takePictureLayer'),
            finish: document.querySelector('.finish')
        }
    };

    // check browser support
    if (!this.getUserMedia()) {
        alert('You are not able to run Spraycan on your browser. Please use the latest Chrome to run this application!');
        return false;
    }

    this.startLocalMediaStream();

    // register application events
    this.video.addEventListener('play',this.initCanvas.bind(this),false);
    window.addEventListener('initApp',       this.initApp.bind(this), false);
    window.addEventListener('start',         this.start.bind(this), false);
    window.addEventListener('setup',         this.setupCan.bind(this), false);
    window.addEventListener('prepareToSave', this.prepareScreenshot.bind(this), false);
    window.addEventListener('cleanUp',       this.cleanUp.bind(this), false);
    window.addEventListener('reset',         this.reset.bind(this), false);

    // connect to arduino socket
    this.socket = io.connect('http://localhost:8000');

    // set gyroscope values
    this.socket.on('gyroscope',function(gyro) {
        this.gyro = gyro;
    }.bind(this));
    
    // set brush color depending on cap resistor
    this.socket.on('resistance', function(resistor) {
        if(Math.abs(resistor.resistorValue - 2200) < this.e) {
            this.brush = this.brushWhite;
        } else if(Math.abs(resistor.resistorValue - 2000) < this.e) {
            this.brush = this.brushGreen;
        } else {
            this.brush = this.brushBlack;
        }
        console.log(this.brush);
    }.bind(this));

    this.socket.on('button', function() {
        switch(this.status++) {
            case 0: this.trigger('initApp');
            break;
            case 1: this.trigger('setup');
            break;
            case 2: this.trigger('prepareToSave');
            break;
            case 3: this.trigger('reset'); this.status = 0;
            break;
        }
    }.bind(this));
}

/**
 * hide startscreen and enable key controls
 * @event initApp
 */
Spraycan.prototype.initApp = function() {

    // hide start screen, and remove node
    this.ui.layer.start.className += ' hide';
    this.ui.layer.grabCan.style.zIndex = 100;

    window.setTimeout(function() {
        this.ui.layer.start.style.zIndex = 0;
    }.bind(this),500);

    // start webcam video and init scanning
    this.video.play();

    // start application and enable key controls
    this.start();

};

/**
 * prepare dom elements to start application in walk mode
 * @event start
 */
Spraycan.prototype.start = function() {
    console.log('go walking!');
    this.ui.mode.className = 'mode';
    this.ui.mode.style.display = 'block';
    this.drawCanvas.style.zIndex = 0;

    // set focus on map
    window.streetView.stopMoving(false);
};

/**
 * set width/height of canvas and video elements to viewport height/width
 * @event play
 */
Spraycan.prototype.initCanvas = function(){

    var w = document.documentElement.clientWidth,
        h = document.documentElement.clientHeight;

    this.video.width = w;
    this.video.height = h;

    if(w > h) {
        this.dataCanvas.width = this.drawCanvas.width = (h*4)/3;
        this.dataCanvas.height = this.drawCanvas.height = h;
    } else {
        this.dataCanvas.width = this.drawCanvas.width = w;
        this.dataCanvas.height = this.drawCanvas.height = (h*3)/4;
    }
};

/**
 * switch into spray mode
 * @event setup
 */
Spraycan.prototype.setupCan = function(e) {

    // go into spray mode
    console.log('go spraying!');
    this.ui.mode.className += ' spray';

    this.ui.layer.grabCan.style.zIndex = 0;
    this.ui.layer.takePicture.style.zIndex = 100;

    this.drawCanvas.style.zIndex = 2;

    window.streetView.stopMoving(true);

    // play shake sound
    this.shakeSound.play();

    this.stopDrawing = false;
    this.draw();

    return true;
};

/**
 * set current lat and lng values as data attributes
 * @event prepareToSave
 */
Spraycan.prototype.prepareScreenshot = function() {
    this.ui.mode.style.display = 'none';
    this.ui.layer.takePicture.style.zIndex = 0;
    this.drawCanvas.setAttribute('data-lat',window.streetView.panorama.getPosition().lat());
    this.drawCanvas.setAttribute('data-lng',window.streetView.panorama.getPosition().lng());

    this.stopDrawing = true;

    var evt = document.createEvent('Events');
    evt.initEvent('saveImage', true, true);
    window.dispatchEvent(evt);
};

/**
 * clear canvas and show finish layer
 * @event cleanUp
 */
Spraycan.prototype.cleanUp = function() {

    // save image, go into walk mode
    console.log('got message to clean up that shit');
    this.drawCanvas.setAttribute('data-isempty','true');
    this.drawCanvas.style.zIndex = 0;

    this.drawContext.beginPath();
    this.drawContext.clearRect( 0, 0, this.dataCanvas.width, this.dataCanvas.height );
    this.drawContext.closePath();

    this.ui.layer.takePicture.style.zIndex = 0;
    this.ui.layer.finish.className = this.ui.layer.finish.className.replace(/hide/,'');

};

/**
 * reset application and show startscreen
 * @event reset
 */
Spraycan.prototype.reset = function() {
    this.ui.layer.start.style.zIndex = 100;
    this.ui.layer.start.className = this.ui.layer.start.className.replace(/hide/,'');
    this.ui.layer.start.style.zIndex = 99;
    window.setTimeout(function() {
        this.ui.layer.finish.className += 'hide';
    }.bind(this),500);
};

Spraycan.prototype.getUserMedia = function() {
    return navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
};

Spraycan.prototype.startLocalMediaStream = function() {

    this.userMediaStream = this.userMediaStream || this.getUserMedia();
    this.userMediaStream.call(navigator, {
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

    if(this.stopDrawing) {
        return;
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
        this.spraySound.pause();
        return;
    }

    // play sound
    if(this.spraySound.paused) {
        this.spraySound.play();
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
            this.drawContext.drawImage(this.brush, this.drawCanvas.width - _x, _y, this.getBrushSize(this.gyro.y), this.getBrushSize(this.gyro.y));
        }
        this.lastPoint = [x,y];
        this.timestamp = currentTime;

    }
};

Spraycan.prototype.getBrushSize = function(angle) {

    if(!angle) {
        return this.defaultBrushSize;
    }

    var size = Math.abs(Math.abs(this.gyro.y) - 180) / 3;

    return size < this.defaultBrushSize ? this.defaultBrushSize : size;

};

Spraycan.prototype.isClear = function() {
    return this.drawCanvas.getAttribute('data-isempty') === 'true';
};

Spraycan.prototype.trigger = function(eventName) {
    console.log('trigger ',eventName);
    var evt = document.createEvent('Events');
    evt.initEvent(eventName, true, true);
    window.dispatchEvent(evt);
};
