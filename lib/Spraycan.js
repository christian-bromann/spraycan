function Spraycan(video, dataCanvas, drawCanvas) {
    // init canvas
    this.video = video;
    this.dataCanvas = dataCanvas;
    this.dataContext = dataCanvas.getContext('2d');
    this.drawCanvas = drawCanvas;
    this.drawContext = drawCanvas.getContext('2d');
    this.drawContext.setTransform(-5, 1, 0, 0, 0, 0);

    // init brushes
    this.brushBlack = new Image();
    this.brushBlack.src = 'img/brushBlack.png';
    this.brushWhite = new Image();
    this.brushWhite.src = 'img/brushWhite.png';
    this.brushGreen = new Image();
    this.brushGreen.src = 'img/brushGreen.png';
    this.brush = this.brushBlack; // default brush

    // init sounds
    this.spraySound = new Audio('sounds/spray_can_spray.mp3');
    this.shakeSound = new Audio('sounds/spray_paint_can_shake.mp3');

    // init default vars
    this.halfBrushW = 10;
    this.halfBrushH = 10;
    this.lastPoint = [0, 0];
    this.timestamp = 0;
    this.color = 0;
    this.status = 0;
    this.idata = null;
    this.stopDrawing = true;
    this.e = 50; // 50 ohm range
    this.defaultBrushSize = 20;
    this.calibrateMode = false;
    this.fixPoints = [];

    // fetch dom elements
    this.ui = {
        mode: document.querySelector('.mode'),
        layer: {
            start: document.querySelector('.start'),
            calibrate: document.querySelector('.calibrate'),
            map: document.querySelector('.map'),
            fixPointContainer: document.querySelector('.fixPoints'),
            fixPointButtons: document.querySelectorAll('.fixPoint'),
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
    this.video.addEventListener('play', this.initCanvas.bind(this), false);
    window.addEventListener('calibrate', this.calibrate.bind(this), false);
    window.addEventListener('initApp', this.initApp.bind(this), false);
    window.addEventListener('start', this.start.bind(this), false);
    window.addEventListener('setup', this.setupCan.bind(this), false);
    window.addEventListener('prepareToSave', this.prepareScreenshot.bind(this), false);
    window.addEventListener('cleanUp', this.cleanUp.bind(this), false);
    window.addEventListener('reset', this.reset.bind(this), false);

    // connect to arduino socket
    this.socket = io.connect('http://localhost:8000');

    // set brush color depending on cap resistor
    this.socket.on('resistance', function(resistor) {
        if (Math.abs(resistor.resistorValue - 2200) < this.e) {
            this.brush = this.brushBlack;
        } else if (Math.abs(resistor.resistorValue - 2700) < this.e) {
            this.brush = this.brushWhite;
        } else if (Math.abs(resistor.resistorValue - 2450) < this.e) {
            this.brush = this.brushGreen;
        }
    }.bind(this));

    this.socket.on('button', this.next.bind(this));
    document.body.addEventListener('keyup', this.next.bind(this), true);
}

Spraycan.prototype.next = function(e) {

    if(!e || e === true || e.which === 32) {

        if (this.calibrateMode) {
            return this.setFixPoint();
        }

        switch (this.status++) {
            case 0:
                this.trigger('calibrate');
                break;
            case 1:
                this.trigger('initApp');
                break;
            case 2:
                this.trigger('setup');
                break;
            case 3:
                this.trigger('prepareToSave');
                break;
            case 4:
                this.trigger('reset');
                this.status = 0;
                break;
        }

    }

}

/**
 * hide startscreen and 
 * @event calibrate
 */
Spraycan.prototype.calibrate = function() {
    this.ui.layer.start.className += ' hide';

    // execute calibration just once
    if(this.fixPoints.length) {
        window.streetView.mapCanvas.className = window.streetView.mapCanvas.className.replace(/hide/,'');
        return this.next();
    }

    document.querySelector('video').style.display = 'block';
    document.querySelector('video').style.position = 'absolute';
    this.calibrateMode = true;
    this.ui.layer.calibrate.className = this.ui.layer.calibrate.className.replace(/hide/,'');
    this.video.play();

};

/**
 * set fix points
 */
Spraycan.prototype.setFixPoint = function() {
    this.dataContext.drawImage(this.video, 0, 0, this.dataCanvas.width, this.dataCanvas.height);
    this.idata = this.dataContext.getImageData(0, 0, this.dataCanvas.width, this.dataCanvas.height);

    var pos = this.findLightPoint(this.idata.data);

    this.fixPoints.push(pos);
    console.log('set #',this.fixPoints.length,'fix point at',this.fixPoints[this.fixPoints.length - 1]);

    if(this.fixPoints.length === 4) {
        this.planeDimension = {
            width:  Math.abs(this.fixPoints[3].x - this.fixPoints[1].x),
            height: Math.abs(this.fixPoints[2].y - this.fixPoints[0].y)
        }

        this.transformationMatrix = this.getTransformationMatrix(this.fixPoints,[{
            x: 30,
            y: 30
        }, {
            x: this.drawCanvas.width - 30,
            y: 30
        },{
            x: this.drawCanvas.width - 30,
            y: this.drawCanvas.height - 30
        }, {
            x: 30,
            y: this.drawCanvas.height - 30
        }]);

        console.log(this.planeDimension,{width:this.drawCanvas.width,height:this.drawCanvas.height});
        console.log('transformation matrix',this.transformationMatrix); 
        this.calibrateMode = false;
        this.ui.layer.calibrate.className += ' hide';
        window.streetView.mapCanvas.className = window.streetView.mapCanvas.className.replace(/hide/,'');
        return this.next();
    }

    this.ui.layer.fixPointButtons[this.fixPoints.length - 1].className += ' hide';
    this.ui.layer.fixPointButtons[this.fixPoints.length].className = this.ui.layer.fixPointButtons[this.fixPoints.length].className.replace(/hide/,'');
}

/**
 * generate transformation matrix
 */
Spraycan.prototype.getTransformationMatrix = function(pa,pb) {
    var matrix = [], A = [];
    for(var i = 0; i < pa.length; ++i) {
        var p1 = pa[i];
        var p2 = pb[i];

        matrix.push([p1.x, p1.y, 1, 0, 0, 0, -1*p2.x*p1.x, -1*p2.x*p1.y]);
        matrix.push([0, 0, 0, p1.x, p1.y, 1, -1*p2.y*p1.x, -1*p2.y*p1.y]);
        A.push(p2.x);
        A.push(p2.y);
    }

    console.log(matrix);
    console.log(A);

    matrix = $M(matrix);
    A = $M(A);

    var res = (matrix.transpose().multiply(matrix)).inverse().multiply(matrix.transpose());
    return res.multiply(A);
};

/**
 * enable key controls
 * @event initApp
 */
Spraycan.prototype.initApp = function() {

    // hide start screen, and remove node
    this.ui.layer.grabCan.className = this.ui.layer.grabCan.className.replace(/hide/g,'');

    window.setTimeout(function() {
        this.ui.layer.start.style.zIndex = 0;
    }.bind(this), 500);

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
Spraycan.prototype.initCanvas = function() {

    var w = document.documentElement.clientWidth,
        h = document.documentElement.clientHeight;

    this.video.width = w;
    this.video.height = h;

    if (w > h) {
        this.dataCanvas.width = this.drawCanvas.width = (h * 4) / 3;
        this.dataCanvas.height = this.drawCanvas.height = h;
    } else {
        this.dataCanvas.width = this.drawCanvas.width = w;
        this.dataCanvas.height = this.drawCanvas.height = (h * 3) / 4;
    }

    this.ui.layer.fixPointContainer.style.width = this.dataCanvas.width + 'px';
    this.ui.layer.fixPointContainer.style.height = this.dataCanvas.height + 'px';
    this.ui.layer.fixPointContainer.style.left = (w - this.ui.layer.fixPointContainer.style.width.slice(0,-2)) / 2 + 'px';
};

/**
 * switch into spray mode
 * @event setup
 */
Spraycan.prototype.setupCan = function(e) {

    // go into spray mode
    console.log('go spraying!');
    this.ui.mode.className += ' spray';

    this.ui.layer.grabCan.className += 'hide';
    this.ui.layer.takePicture.className = this.ui.layer.takePicture.className.replace(/hide/g,'');

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
    this.ui.layer.takePicture.className += 'hide';
    this.drawCanvas.setAttribute('data-lat', window.streetView.panorama.getPosition().lat());
    this.drawCanvas.setAttribute('data-lng', window.streetView.panorama.getPosition().lng());

    if (window.streetView.currentPlace && window.streetView.currentPlace.hotspot) {
        this.drawCanvas.setAttribute('data-hotspot', window.streetView.currentPlace.hotspot);
    };

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
    this.drawCanvas.setAttribute('data-isempty', 'true');
    this.drawCanvas.style.zIndex = 0;

    this.drawContext.beginPath();
    this.drawContext.clearRect(0, 0, this.dataCanvas.width, this.dataCanvas.height);
    this.drawContext.closePath();

    this.ui.layer.takePicture.style.zIndex = 0;
    this.ui.layer.finish.className = this.ui.layer.finish.className.replace(/hide/, '');

};

/**
 * reset application and show startscreen
 * @event reset
 */
Spraycan.prototype.reset = function() {
    this.ui.layer.start.style.zIndex = 100;
    this.ui.layer.start.className = this.ui.layer.start.className.replace(/hide/, '');
    this.ui.layer.start.style.zIndex = 99;
    window.setTimeout(function() {
        this.ui.layer.finish.className += 'hide';
    }.bind(this), 500);
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

    if (this.stopDrawing) {
        return;
    }

    if (this.video.paused || this.video.ended) return false;
    // First, draw it into the backing dataCanvas
    this.dataContext.drawImage(this.video, 0, 0, this.dataCanvas.width, this.dataCanvas.height);
    // Grab the pixel data from the backing dataCanvas
    if (this.foundX && this.foundY) {
        this.idata = this.dataContext.getImageData(this.minLeft(), this.minTop(), 100, 100);
        // this.drawStrokeHelper(this.foundX, this.foundY,'rgb(255,0,0)',50);
    } else {
        this.idata = this.dataContext.getImageData(0, 0, this.dataCanvas.width, this.dataCanvas.height);
    }

    var pos = this.findLightPoint(this.idata.data);
    this.idata = null;

    this.spray(pos.x, pos.y);
    requestAnimationFrame(this.draw.bind(this));
};

Spraycan.prototype.distanceBetween2Points = function(point1, point2) {

    var dx = point2[0] - point1[0];
    var dy = point2[1] - point1[1];

    return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));

};

Spraycan.prototype.angleBetween2Points = function(point1, point2) {

    var dx = point2[0] - point1[0];
    var dy = point2[1] - point1[1];

    return Math.atan2(dx, dy);
};

Spraycan.prototype.drawStrokeHelper = function(x, y, color, width) {

    width = width || 25;
    color = color || 'rgb(255,0,0)';

    this.drawContext.beginPath();
    this.drawContext.strokeStyle = color;
    this.drawContext.lineTo(x - width, y - width);
    this.drawContext.lineTo(x + width, y - width);
    this.drawContext.lineTo(x + width, y + width);
    this.drawContext.lineTo(x - width, y + width);
    this.drawContext.lineTo(x - width, y - width);
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
        Math.floor(i / paneWidth)
    ];
};

Spraycan.prototype.xy2Ptr = function(x, y) {
    x *= 4;
    y *= 4;

    var paneWidth = (this.foundX && this.foundY) ? 100 : this.drawCanvas.width;
    return (y * paneWidth) + x;
};

Spraycan.prototype.minLeft = function() {
    return this.foundX > 50 ? this.foundX - 50 : 0;
};
Spraycan.prototype.maxLeft = function() {
    return this.foundX + 50 > this.drawCanvas.width ? this.drawCanvas.width : this.foundX + 50;
};
Spraycan.prototype.minTop = function() {
    return this.foundY > 50 ? this.foundY - 50 : 0;
};
Spraycan.prototype.maxTop = function() {
    return this.foundY + 50 > this.drawCanvas.height ? this.drawCanvas.height : this.foundY + 50;
};

Spraycan.prototype.findLightPoint = function(data) {

    var i = 0,
        x = 0,
        y = 0,
        r = 0,
        // g = 0,
        // b = 0,
        foundSth = false,
        colors = ['rgb(255,255,255)', 'rgb(89,23,244)', 'rgb(111,2,33)', 'rgb(233,200,2)', 'rgb(111,111,111)', 'rgb(32,122,1)', 'rgb(44,66,88)'];

    // top down
    for (i = 0; i < data.length; i += 4 * 5) {
        r = data[i];
        if (r > 75) {
            x = this.ptr2XY(i)[0];
            y = this.ptr2XY(i)[1];

            if (this.foundX && this.foundY && !this.calibrateMode) {
                console.log('he');
                x = this.minLeft() + x;
                y = this.minTop() + y;
            }

            this.foundX = x;
            this.foundY = y;

            foundSth = true;
            break;
        }
    }

    if (!foundSth || this.calibrateMode) {
        this.foundX = null;
        this.foundY = null;
    }

    if(!this.calibrateMode) {
        x = ((this.transformationMatrix.elements[0][0]*x) + (this.transformationMatrix.elements[1][0]*y) + this.transformationMatrix.elements[2][0]) / ((this.transformationMatrix.elements[6][0]*x) + (this.transformationMatrix.elements[7][0]*y) + 1);
        y = ((this.transformationMatrix.elements[3][0]*x) + (this.transformationMatrix.elements[4][0]*y) + this.transformationMatrix.elements[5][0]) / ((this.transformationMatrix.elements[6][0]*x) + (this.transformationMatrix.elements[7][0]*y) + 1);
    }

    return {
        x: x,
        y: y
    };
};

Spraycan.prototype.spray = function(x, y, distance, angle) {

    if (!x || !y || x < 0 || y < 0 || x > this.drawCanvas.width || y > this.drawCanvas.height) {
        this.spraySound.pause();
        return;
    }

    // play sound
    if (this.spraySound.paused) {
        this.spraySound.play();
    }

    var currentTime = new Date().getTime();

    if (this.isClear() || (currentTime - this.timestamp > 500)) {

        this.drawContext.closePath();
        this.drawContext.beginPath();
        this.drawContext.moveTo(x, y);
        this.lastPoint = [x, y];
        this.drawContext.strokeStyle = "#FF0000";
        this.drawCanvas.setAttribute('data-isempty', 'false');
        this.timestamp = currentTime;
    } else {

        distance = parseInt(this.distanceBetween2Points(this.lastPoint, [x, y]), 10);
        angle = this.angleBetween2Points(this.lastPoint, [x, y]);
        for (var z = 0;
            (z <= distance || z === 0); z++) {
            var _x = this.lastPoint[0] + (Math.sin(angle) * z) - this.halfBrushW;
            var _y = this.lastPoint[1] + (Math.cos(angle) * z) - this.halfBrushH;
            this.drawContext.drawImage(this.brush, _x + 15, _y, this.defaultBrushSize, this.defaultBrushSize);
        }
        this.lastPoint = [x, y];
        this.timestamp = currentTime;

    }
};

Spraycan.prototype.isClear = function() {
    return this.drawCanvas.getAttribute('data-isempty') === 'true';
};

Spraycan.prototype.trigger = function(eventName) {
    console.log('trigger ', eventName);
    var evt = document.createEvent('Events');
    evt.initEvent(eventName, true, true);
    window.dispatchEvent(evt);
};
