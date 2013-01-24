(function() {
    var i = 0,
        lastTime = 0,
        vendors = ['ms', 'moz', 'webkit', 'o'];
    
    while (i < vendors.length && !window.requestAnimationFrame) {
        window.requestAnimationFrame = window[vendors[i] + 'RequestAnimationFrame'];
        i++;
    }
    
    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime(),
                timeToCall = Math.max(0, 1000 / 60 - currTime + lastTime),
                id = setTimeout(function() { callback(currTime + timeToCall); }, timeToCall);
            
            lastTime = currTime + timeToCall;
            return id;
        };
    }
}());