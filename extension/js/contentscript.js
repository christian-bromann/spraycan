var canvas  = document.getElementById('drawCanvas');

function getGeoLocation(lat,lng,cb) {

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (this.readyState == 4) {
            var response = JSON.parse(xhr.response);
            if (response.error) {
                console.log('Error: ' + response.error.message);
                return;
            } else {
                console.log('got geolocation from google maps', response);
                cb(response.results[0]);
            }
        }
    };

    xhr.open('GET', 'http://maps.googleapis.com/maps/api/geocode/json?latlng='+lat+','+lng+'&sensor=false', true);
    xhr.setRequestHeader('Cache-Control', 'no-cache');
    xhr.send();
}

window.addEventListener('click', function() {

    console.log('isempty? ',canvas.getAttribute('data-isempty') === 'false');
    console.log('isready? ',canvas.getAttribute('data-isready') === 'true');
    if(canvas !== null && canvas.getAttribute('data-isempty') === 'false' && canvas.getAttribute('data-isready') === 'true') {

        var lat = canvas.getAttribute('data-lat'),
            lng = canvas.getAttribute('data-lng');

        getGeoLocation(lat,lng,function(geoData) {
            console.log('send message to take screenshot ',{action:'takeScreenshot',geoData: geoData});
            chrome.extension.sendMessage({action:'takeScreenshot',geoData: geoData});
        });

    }
});

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    if(request.action === 'cleanup') {
        var evt = document.createEvent("Events");
        evt.initEvent('cleanUp', true, true);
        window.dispatchEvent(evt);
    }
});