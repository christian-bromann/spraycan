chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    
    if(request.action === 'takeScreenshot') {
        var geoData = JSON.stringify(request.geoData);
        
        takeScreenshot(function(image) {
            uploadImage(image,geoData);

            chrome.tabs.getSelected(null, function(tab) {
                chrome.tabs.sendMessage(tab.id, {action: "cleanup"});
            });
        });
    }

});

function takeScreenshot(cb) {
    chrome.tabs.captureVisibleTab(null, {format:'png'}, cb);
}

function uploadImage(image,geoData) {
    var xhr = new XMLHttpRequest();
    var formData = new FormData();

    formData.append('screenshot', image);
    formData.append('geodata', geoData);

    xhr.onreadystatechange = function() {
      if (this.readyState == 4) {
          var response = JSON.parse(xhr.response);
          if (response.error) {
              console.log('Error: ' + response.error.message);
              return;
          } else {
              console.log('screenshot was taken');
          }
      }
    };

    xhr.open('POST', 'http://spraycan.christian-bromann.com/blog/upload.php', true);
    xhr.setRequestHeader('Cache-Control', 'no-cache');
    xhr.send(formData);
}