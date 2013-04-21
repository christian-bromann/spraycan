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

                        geoData = JSON.parse(data.geoData[i].replace(/'/g,'"').replace(/\//,''));
                        adressbar = $('<div />').html(geoData.formatted_address);

                        article = $('<a />')
                            .css('display','none')
                            .attr('href','/blog/img/uploads/'+image)
                            .attr('rel','lightbox')
                            .attr('title',geoData.formatted_address);
                        img = $('<img />').attr('src','/blog/img/uploads/'+image);

                        var objects = {article:article,adressbar:adressbar,img:img};

                        img.load(function() {
                            objects.article.append(objects.img);
                            objects.article.append(objects.adressbar);
                            section.prepend(objects.article);
                            objects.article.fadeIn();
                            objects.article.colorbox({maxWidth: '80%'});
                        });

                        ++i;
                    });
                }
            },
            error: function(e) {
                console.error(e);
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