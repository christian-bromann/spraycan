chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {

    console.log('got message: ', request);
    if (request.action === 'takeScreenshot') {
        console.log('got request to take screenshot');
        var geoData = JSON.stringify(request.geoData),
            hotspot = request.hotspot;

        takeScreenshot(function(image) {
            console.log('got screenshot');

            chrome.tabs.getSelected(null, function(tab) {
                console.log('clean up that shit');
                chrome.tabs.sendMessage(tab.id, {
                    action: 'cleanup'
                });
            });

            uploadImage(image, geoData, hotspot);
        });
    }

});

function takeScreenshot(cb) {
    chrome.tabs.captureVisibleTab(null, {
        format: 'png'
    }, cb);
}

function uploadImage(image, geoData, hotspot) {
    var xhr = new XMLHttpRequest();
    var formData = new FormData();

    formData.append('screenshot', image);
    formData.append('geodata', geoData);
    formData.append('hotspot', hotspot);

    xhr.onreadystatechange = function() {
        console.log('state change ', this.readyState);
        if (this.readyState == 4) {

            var response = JSON.parse(xhr.response);
            if (response.error) {
                console.log('Error: ' + response.error.message);
                return;
            }

            console.log('screenshot was taken');

        }
    };

    xhr.open('POST', 'http://spraycan.de/upload.php', true);
    xhr.setRequestHeader('Cache-Control', 'no-cache');
    xhr.send(formData);
    console.log('send request to server');
}