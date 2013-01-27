var spraycanApp = function(window,document,$,undefined) {

    // go into strict mode
    "use strict";

    var section = $('section'),
        loadedImages = [],
        img,article,geoData,i,adressbar;

    function getImages() {
        $.ajax('/blog/getImages.php', {
            type: 'POST',
            data: 'loaded='+loadedImages.join(','),
            success: function(data) {
                
                if(data.images && data.images.length) {
                    i = 0;
                    data.images.forEach(function(image) {
                        
                        loadedImages.push(image);

                        geoData = JSON.parse(data.geoData[i].replace(/'/g,'"'));
                        adressbar = $('<div />').html(geoData.formatted_address);

                        article = $('<article />');
                        img = $('<img />').attr('src','/blog/img/uploads/'+image)
                                          .css('display','none');
                        
                        article.append(img);
                        article.append(adressbar);
                        section.append(article);
                        img.fadeIn();
                        
                        ++i;
                    });
                }
            }
        });

        window.setTimeout(getImages,1000);
    }

    // on document load
    (function() {
        getImages();
    })();

    // public vars and functions
    return {};
};

(function(window,document,$) {

    // go into strict mode
    "use strict";
    
    var app = spraycanApp(window,document,$);

})(window,document,jQuery);