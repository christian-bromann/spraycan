var canvas  = document.getElementById('drawCanvas'),
    context = canvas.getContext('2d'),
    cntClicks = 0;


function getGeoLocation(lat,lng,cb) {
    
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (this.readyState == 4) {
            var response = JSON.parse(xhr.response);
            if (response.error) {
                console.log('Error: ' + response.error.message);
                return;
            } else {
                console.log('got geolocation from google maps');
                cb(response.results[0]);
            }
        }
    };

    xhr.open('GET', 'http://maps.googleapis.com/maps/api/geocode/json?latlng='+lat+','+lng+'&sensor=false', true);
    xhr.setRequestHeader('Cache-Control', 'no-cache');
    xhr.send();
}

window.addEventListener('click', function() {

    ++cntClicks;
    if(cntClicks % 3 === 1) {
        return false;
    }

    if(canvas !== null && canvas.getAttribute('data-isempty') === 'false' && canvas.getAttribute('data-isready') === 'true') {
        
        var lat = canvas.getAttribute('data-lat'),
            lng = canvas.getAttribute('data-lng');

        getGeoLocation(lat,lng,function(geoData) {
            chrome.extension.sendMessage({action:'takeScreenshot',geoData: geoData});
        });

    } else {
        canvas.setAttribute('data-isready','true');
        this.drawCanvas.style.zIndex = 1;
    }
});

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    if(request.action === 'cleanup') {
        canvas.setAttribute('data-isempty','true');
        canvas.setAttribute('data-isready','false');
        canvas.style.zIndex = 0;

        context.beginPath();
        context.clearRect( 0, 0, this.dataCanvas.width, this.dataCanvas.height );
        context.closePath();
    }
});