function Spraycan(video,dataCanvas,drawCanvas) {
    this.video           = video;
    this.dataCanvas      = dataCanvas;
    this.dataContext     = dataCanvas.getContext('2d');
    this.drawCanvas      = drawCanvas;
    this.drawContext     = drawCanvas.getContext('2d');
    this.userMediaObject = null;
    this.stream          = null;

    var that = this;
    this.video.addEventListener('play', function(){
        that.draw();

        var w = document.documentElement.clientWidth,
            h = document.documentElement.clientHeight;

        that.video.width       = w;
        that.video.height      = h;
        that.dataCanvas.width  = that.video.clientWidth;
        that.dataCanvas.height = that.video.clientHeight;
        that.drawCanvas.width  = that.video.clientWidth;
        that.drawCanvas.height = that.video.clientHeight;
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
    var that = this;
    this.userMediaObject.call(navigator, {
        video: true,
        audio: true
    }, function(localMediaStream) {
        this.stream = localMediaStream;
        console.log(that.userMediaObject);
        // should be separated from this class?
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

        if(r < 60 && g < 60 && b > 130) {
            var x = Math.ceil(Math.floor(i / 4) % spraycan.dataCanvas.width);
            var y = Math.floor(Math.floor(i/spraycan.dataCanvas.width)/4);
            spraycan.spray(x,y);
        }
    }
    idata.data = data;

    requestAnimationFrame(spraycan.draw);
};

Spraycan.prototype.spray = function(x,y) {

    if(!x || !y) {
        return;
    }

    this.drawContext.beginPath();
    this.drawContext.moveTo(x,y);
    this.drawContext.arc(x,y,5,0,Math.PI*2, false);
    this.drawContext.fillStyle = 'rgb(15,15,150)';
    this.drawContext.fill();
    this.drawContext.closePath();
};