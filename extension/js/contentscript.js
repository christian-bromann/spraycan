window.addEventListener('click', function() {
    chrome.extension.sendMessage({action:'takeScreenshot'});
});