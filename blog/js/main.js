function SpraycanBlog() {

    // go into strict mode
    "use strict";

    this.ui = {
        body: $('body'),
        pages: {
            images: $('.images'),
            about: $('.about'),
            imprint: $('.imprint'),
        },
        loader: $('.blogLoader'),
        navLinks: $('nav a')
    };

    this.events =  {
        'click nav>a': 'navigate'
    };

    this.loadedImages = [];
    this.imagesToShow = [];

    this.loaded = 0;
    this.checkNewImages = true;

    this.ui.loader.show();
    this.getImages();
    this.delegateEvents();

    $(window).scroll(this.loadFurtherImages.bind(this));
}

SpraycanBlog.prototype.getImages = function() {

    if(!this.checkNewImages) {
        return;
    }

    $.ajax('getImages.php', {
        type: 'POST',
        data: 'loaded='+this.loadedImages.join(','),
        success: function(data) {

            if(!$.isEmptyObject(data)) {

                this.checkNewImages = false;
                this.loaded = 0;

                var keyDate,
                    geoData,
                    i = 0;

                for(keyDate in data){

                    var image = data[keyDate];
                    this.loadedImages.push(image.path);

                    // console.log(data);
                    if(i < this.getKeys(data).length - 15) {
                        this.imagesToShow.push(image);
                        ++i;
                        continue;
                    }

                    this.displayImage(image,true,data.length);
                    ++i;
                }
            } else {
                window.setTimeout(this.getImages.bind(this),1000);
            }
        }.bind(this),
        error: function(e) {
            console.error(e);
        }
    });

};

SpraycanBlog.prototype.getKeys = function(obj) {
    var keys = [];
    for(var key in obj){
        keys.push(key);
    }
    return keys;
};

SpraycanBlog.prototype.displayImage = function(image,prepend,imageCount) {
    var geoData, i = 0;

    if(!image.path) {
        return;
    }

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

    img.load(function(objects) {
        ++i;

        objects.article.append(objects.img);
        objects.article.append(objects.adressbar);

        if(prepend) {
            this.ui.pages.images.prepend(objects.article);
        } else {
            this.ui.pages.images.append(objects.article);
        }

        objects.article.fadeIn();
        objects.article.colorbox({maxWidth: '80%'});
        ++this.loaded;

        if(this.loaded === 12 || imageCount === i) {
            this.ui.loader.hide();
            this.getImages();
        }

    }.bind(this,objects));
};

/**
 * delegate events to dom objects
 * this was cribbed from backbone, to see the original source take a look here:
 * https://github.com/jashkenas/backbone/blob/master/backbone.js#L1062
 */
SpraycanBlog.prototype.delegateEvents = function() {

    var i = 0;
    for (var key in this.events) {
        var method = this[this.events[key]],
            eventName = key.split(' ')[0],
            selector = key.split(' ')[1];

        eventName += '.delegateEvents' + i;
        if (selector === '') {
            this.ui.body.on(eventName, method.bind(this));
        } else {
            this.ui.body.on(eventName, selector, method.bind(this));
        }

        ++i;
    }
};

SpraycanBlog.prototype.navigate = function(e) {

    var elem = $(e.target),
        url = elem.attr('href').replace('#!/','');

    this.ui.loader.hide();
    $('section:visible').fadeOut(function() {

        this.ui.pages[url].fadeIn();

        if(url === 'images') {
            this.checkNewImages = true;
            this.getImages();
        }

    }.bind(this));

};

SpraycanBlog.prototype.loadFurtherImages = function(e) {

    if($(window).scrollTop() == $(document).height() - $(window).height()) {

        this.ui.loader.show();

        for(var i = 0; i < 6; ++i) {
            var image = this.imagesToShow.pop();
            if(image) this.displayImage(image,false);
        }

    }

};

window.spraycanBlog = new SpraycanBlog();