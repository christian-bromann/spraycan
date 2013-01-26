chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    
    chrome.tabs.captureVisibleTab(null, {format:'png'}, function (image) {

        var xhr = new XMLHttpRequest();
        var formData = new FormData();

        formData.append('screenshot', image);

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

        xhr.open('POST', 'http://spraycan.dev/blog/image.php', true);
        xhr.setRequestHeader('Cache-Control', 'no-cache');
        xhr.send(formData);

    });

});