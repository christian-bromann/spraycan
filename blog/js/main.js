var spraycanApp = function(window,document,$,undefined) {

    // go into strict mode
    "use strict";

    Object.prototype.keys = function(obj){
        var keys = [];
        for(var key in obj){
            keys.push(key);
        }
        return keys;
    };

    var section = $('section'),
        loadedImages = [],
        imagesToShow = [],
        img,article,geoData,i,loaded,adressbar;

    function getImages() {
        $.ajax('getImages.php', {
            type: 'POST',
            data: 'loaded='+loadedImages.join(','),
            success: function(data) {

                if(!$.isEmptyObject(data)) {
                    loaded = 0;
                    var keyDate,geoData;
                    var i = 0;

                    for(keyDate in data){

                        var image = data[keyDate];
                        loadedImages.push(image.path);

                        if(i < Object.keys(data).length - 15) {
                            imagesToShow.push(image);
                            ++i;
                            continue;
                        }

                        displayImage(image,true);
                        ++i;
                    }
                } else {
                    window.setTimeout(getImages,1000);
                }
            },
            error: function(e) {
                console.error(e);
            }
        });
    }

    function displayImage(image,prepend) {
        var geoData;

        try {
            geoData = JSON.parse(image.geoData.replace(/\\/g,''));
        } catch(e) {
            geoData = {formatted_address:'Adresse nicht bekannt'};
        }
        var adressbar = $('<div />').html(geoData.formatted_address);

        var article = $('<a />')
            .css('display','none')
            .attr('href','/img/uploads/'+image.path)
            .attr('rel','lightbox')
            .attr('title',geoData.formatted_address);

        var img     = $('<img />').attr('src','/img/uploads/'+image.path);
        var objects = {article:article,adressbar:adressbar,img:img};

        (function(img,obj) {
            var objects = obj,
                image   = img;

            image.load(function() {
                objects.article.append(objects.img);
                objects.article.append(objects.adressbar);

                if(prepend) {
                    section.prepend(objects.article);
                } else {
                    section.append(objects.article);
                }

                objects.article.fadeIn();
                objects.article.colorbox({maxWidth: '80%'});
                ++loaded;

                if(loaded === 10) {//Object.keys(data).length
                    getImages();
                }
            });
        })(img,objects);
    }

    // on document load
    (function() {
        getImages();

        var $window = $(window);
        $window.scroll(function() {

            if($window.scrollTop() == $(document).height() - $window.height()) {

                for(var i = 0; i < 6; ++i) {
                    var image = imagesToShow.pop();
                    if(image) displayImage(image,false);
                }

            }
        });
    })();

    // public vars and functions
    return {};
};

(function(window,document,$) {

    // go into strict mode
    "use strict";

    var app = spraycanApp(window,document,$);

})(window,document,jQuery);