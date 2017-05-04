(function ($) {
    'use strict';

    $.widget('ubcmsComponent.slideGallery', {

        // These options will be used as defaults
        options: {
            flippable: true, // 1 or 0
            startView: 'gallery' // 'gallery' or 'slideshow'
        },

        // Set up the widget
        // call this like $('#widget').titlewidget(); or $('#widget').titlewidget({ color: 'green' });
        _create: function () {
            var $element = this.element;
            var $flipContainer = $element;
            var $slideView = $element.find('.slide-view');
            var $galleryView = $element.find('.gallery-view');
            var numLineFill = 5;
            var rowProportions = {};
            var descriptionArr = [];
            var elThis = this;

            //provide a stage for the fullscreen view
            if ($('#imagegallery2-overlay').size() == 0) {
                $('body').prepend('<div id="imagegallery2-overlay" style="display:none">');
                $('#imagegallery2-overlay').click(function(event) {
                    if ($(event.target).attr('id') == 'imagegallery2-overlay') {
                        $('#imagegallery2-overlay .view-close').click();
                        return false;
                    }
                });
            }

            if ($flipContainer.width() < 450) {
                $slideView.find('.view-panel').addClass('full-width');
                numLineFill = 3;
            }
            else if ($flipContainer.width() > 690) {
                $slideView.addClass('wide-page');

            }
            if (window.innerWidth > 450 && $flipContainer.width() < 450) {
                $slideView.find('.view-panel').addClass('full-width');
                numLineFill = 3;
            }
            else if (window.innerWidth > 450) {
                $slideView.find('.view-panel').removeClass('full-width');
                numLineFill = 5;
            }

            $(window).resize(function () {
                if ($flipContainer.width() < 450) {
                    $slideView.find('.view-panel').addClass('full-width');
                    numLineFill = 3;
                }
                else if ($flipContainer.width() > 690) {
                    $slideView.addClass('wide-page');

                }
                if (window.innerWidth > 450 && $flipContainer.width() < 450) {
                    $slideView.find('.view-panel').addClass('full-width');
                    numLineFill = 3;
                }
                else if (window.innerWidth > 450 && $flipContainer.width() > 450) {
                    $slideView.find('.view-panel').removeClass('full-width');
                }
                else if (window.innerWidth > 450) {
                    //$slideView.find('.view-panel').removeClass('full-width');
                    numLineFill = 5;
                }

                totExcess = 0;
                resetCount = 1;
                $galleryView.find('.thumb-wrap img').removeClass('exp');
                loopImgLoad(resizeArr);

                var tempHeight = $element.hasClass('hover') ? $slideView.height() : $galleryView.height();
                $element.height(tempHeight);

            });


            var numGalleryLines = Math.ceil($element.find('.thumb-wrap').length / numLineFill);

            for (var iLines = 1; iLines < numGalleryLines + 1; iLines++) {
                rowProportions[iLines] = 0;
            }

            $element.find('.slide-count .slide-total').text($element.find('.thumb-wrap').length);

            // start: populate  thumbnail images in gallery view
            var totExcess = 0;
            var resetCount = 1;
            var containerWidth = $galleryView.width();
            var resizeArr = {};
            var trImg = 0;

            //function to calculate size of thumbnails to fit into allocated width
            function loopImgLoad(arr) {

                containerWidth = $galleryView.width();

                $.each(arr, function (j, val) {
                    var i = parseInt(j);

                    totExcess += parseInt(val);

                    if (totExcess > containerWidth) {
                        var endCount = i;

                        if (resetCount == 1) {
                            endCount = i + 1;
                        }
                        else {
                            endCount = i + 1;
                        }

                        var indExcess = (totExcess - containerWidth) / ((endCount - resetCount));

                        for (var initCt = resetCount; initCt < endCount; initCt++) {
                            var indImgWidth = $galleryView.find('.thumb-wrap.set' + initCt + ' img').width();
                            $galleryView.find('.thumb-wrap.set' + initCt).css('width', indImgWidth - indExcess);
                            $galleryView.find('.thumb-wrap ref' + initCt).addClass('exp');
                        }

                        totExcess = 0;
                        resetCount = parseInt(i) + 1;
                    }

                    if (j == Object.keys(arr).length) {
                        $galleryView.find('.thumb-wrap img').each(function (r, v) {
                            if (!$(this).hasClass('exp')) {
                                $(this).addClass('exp');
                                if ($galleryView.find('.thumb-wrap.set' + parseInt(r + 1) + '[style*=width]').length == 0) {
                                    $(this).addClass('rela');
                                }
                            }
                        });

                        switch (elThis.options.startView) {
                            case 'slideshow':
                                $element.height($slideView.height());
                                break;
                            case 'gallery':
                                $element.height($galleryView.height());
                                $galleryView.addClass("front");
                                break;
                        }

                    }

                });

            }

            $element.find('.thumb-wrap').each(function (i, val) {
                i = i + 1;

                var baseImgUrl = $(this).find('a').attr('href');
                descriptionArr.push($(this).find('img').attr('data-description'));

                $(this).addClass('set' + parseInt(i));

                var newImgthumb = $(this).find('img').addClass('ref' + parseInt(i));

                //zoom in to fullscreen on click
                newImgthumb.on('click', descriptionArr, $.proxy(elThis._zoomClick, elThis));

                //Collect images to calculate width of each indvidual thumbnail image
                $(window).load(function () {

                    resizeArr[i] = $galleryView.find('.thumb-wrap.set' + i).width() + parseInt($galleryView.find('.thumb-wrap.set' + i).css('margin-right')) + parseInt($galleryView.find('.thumb-wrap.set' + i).css('margin-left'));

                    if (Object.keys(resizeArr).length == $galleryView.find('.thumb-wrap').length && trImg == 0) {
                        loopImgLoad(resizeArr);
                        trImg = 1;
                    }

                });

                // get alt text
                var altText = $(this).find('img').attr('alt');

                //add image to slide view
                $('<img>').attr('src', baseImgUrl).attr('alt', altText).appendTo($slideView.find('.view-stage'));

            });

            //adds click events to icon controls: Full screen view and gallery/slideshow view
            $element.find('.full-icon').on('click', descriptionArr, $.proxy(this.fullScreen, this));
            $element.find('.flip-icon').on('click', descriptionArr, $.proxy(this.flipDeck, this));

            //adds click event to left and right navigational arrows
            $element.find('.nav-right').on('click', descriptionArr, $.proxy(this.advanceSlide, this));
            $element.find('.nav-left').on('click', descriptionArr, $.proxy(this.previousSlide, this));


            this._updateTheme(descriptionArr);
        },

        // private method set component's initial state
        // Sets option to allow user to flip between view states
        // sets initial view state
        _setOption: function (key, value) {
            switch (key) {
                case 'flippable':
                    this.options.flippable = value;
                    this._updateTheme();
                    break;
                case 'startView':
                    this.options.startView = value;
                    this._updateTheme();
                    break;
            }
        },

        // private method update component view state: slideshow or photogallery?
        _updateTheme: function (descriptionArr) {
            var $element = this.element;
            var $galleryView = $element.find('.gallery-view');
            var e = {};
            e.data = descriptionArr;

            $element.addClass('flippable-' + (this.options.flippable ? 1 : 0));

            switch (this.options.startView) {
                case 'slideshow':
                    this.flipDeck(e);
                    break;
                case 'gallery':
                    $galleryView.removeClass("front");
                    break;
            }
        },

        // private method to show full screen images
        _zoomClick: function (e) {
            e.preventDefault();
            var $element = this.element;
            var $galleryView = $element.find('.gallery-view');
            var overlayClassId = $element.attr("id");

            $(e.currentTarget).addClass('active');
            var baseImgUrl = $(e.currentTarget).attr('src').replace('.thumb.100.140.jpg', '');
            var altText = $(e.currentTarget).attr('alt');
            var viewImgs = $galleryView.find('img');
            var thisTarget = $(e.currentTarget);
            var i = viewImgs.index(thisTarget);
            var viewContainer = $('<div>').addClass('view-container');
            var descContainer = $('<div>').addClass('content-container');
            var imgContainer = $('<div>').addClass('img-wrap').appendTo(viewContainer);

            $galleryView.find('img').eq(i).addClass('active');

            var containerControls = $('<div>').addClass('view-container-controls').prependTo(imgContainer);
            $('<img>').attr('src', baseImgUrl).attr('alt', altText).appendTo(imgContainer);
            var slideCount = parseInt(i) + parseInt(1);
            $('<div>').addClass('icon-rack').appendTo(containerControls);
            $element.find('.social-icon').appendTo(containerControls.find('.icon-rack'));
            $('<div>').addClass('view-close ub-icons').bind('click', function () {
                $('#imagegallery2-overlay').fadeOut(400);
                $('#imagegallery2-overlay').find('.social-icon').insertAfter($element.find('.slide-count .flip-icon'));
                $('#imagegallery2-overlay').removeClass('imagegallery-zoom').removeClass(overlayClassId);
                viewContainer.remove();
                containerControls.remove();
                descContainer.remove();
                $galleryView.find('img').removeClass('active');
            }).appendTo(containerControls.find('.icon-rack'));
            $('<div>').addClass('view-count').html('<span class="curr-count">' + slideCount + '</span> of ' + $galleryView.find('a').length).prependTo(containerControls);

            viewContainer.appendTo('#imagegallery2-overlay');
            descContainer.appendTo('#imagegallery2-overlay');
            descContainer.text(e.data[i]);

            $('<div class="nav-left"></div><div class="nav-right"></div>').appendTo(viewContainer);
            $('#imagegallery2-overlay').find('.nav-right').on('click', e.data, $.proxy(this.advanceSlide, this));
            $('#imagegallery2-overlay').find('.nav-left').on('click', e.data, $.proxy(this.previousSlide, this));

            $('#imagegallery2-overlay').addClass('imagegallery-zoom ' + overlayClassId).removeAttr('style');
        },

        //public method to take images and make them full screen
        //retains continuity of images when going to full screen and back
        fullScreen: function (e) {
            var $element = this.element;
            var $slideView = $element.find('.slide-view');
            var $galleryView = $element.find('.gallery-view');
            var activeSlide = $slideView.find('.view-stage .active');
            var i = $slideView.find('.view-stage img').index(activeSlide);
            var baseImgUrl = $slideView.find('.view-stage .active').attr('src');
            var altText = $slideView.find('.view-stage .active').attr('alt');
            var viewContainer = $('<div>').addClass('view-container');
            var descContainer = $('<div>').addClass('content-container');
            var imgContainer = $('<div>').addClass('img-wrap').appendTo(viewContainer);
            var overlayClassId = $element.attr("id");

            var containerControls = $('<div>').addClass('view-container-controls').prependTo(imgContainer);

            $galleryView.find('img').eq(i).addClass('active');

            $('<img>').attr('src', baseImgUrl).attr('alt', altText).appendTo(imgContainer);
            $('<div>').addClass('icon-rack').appendTo(containerControls);
            $element.find('.social-icon').appendTo(containerControls.find('.icon-rack'));
            var slideCount = parseInt(i) + parseInt(1);
            $('<div />').addClass('view-close ub-icons').bind('click', function () {
                $('#imagegallery2-overlay').fadeOut(400);
                $('#imagegallery2-overlay').find('.social-icon').insertAfter($element.find('.slide-count .flip-icon'));
                $('#imagegallery2-overlay').removeClass('imagegallery-zoom').removeClass(overlayClassId);
                viewContainer.remove();
                containerControls.remove();
                descContainer.remove();
                $galleryView.find('img').removeClass('active');
            }).appendTo(containerControls.find('.icon-rack'));
            $('<div>').addClass('view-count').html('<span class="curr-count">' + slideCount + '</span> of ' + $galleryView.find('a').length).prependTo(containerControls);

            viewContainer.appendTo('#imagegallery2-overlay');
            descContainer.appendTo('#imagegallery2-overlay');
            descContainer.text(e.data[i]);

            $('<div class="nav-left"></div><div class="nav-right"></div>').appendTo(viewContainer);
            $('#imagegallery2-overlay').find('.nav-right').on('click', e.data, $.proxy(this.advanceSlide, this));
            $('#imagegallery2-overlay').find('.nav-left').on('click', e.data, $.proxy(this.previousSlide, this));

            $('#imagegallery2-overlay').removeAttr('style').addClass('imagegallery-zoom ' + overlayClassId);

        },

        //public method to flip between gallery and slideshow views
        flipDeck: function (e) {
            var $element = this.element;
            var $slideView = $element.find('.slide-view');
            var $galleryView = $element.find('.gallery-view');

            if ($element.hasClass('hover')) {
                $element.removeClass('hover');
                $slideView.find('img').removeClass('active').hide();
                $element.height($galleryView.height());
            } else {
                $element.addClass('hover');
                $galleryView.find('img').eq(0).addClass('active');
                $slideView.find('img').eq(0).css({'display': 'block'}).addClass('active');
                $element.find('.view-panel .slide-curr-count').text('1');
                $element.find('.nav-left').hide();
                $element.find('.view-panel .teaser-text').text(e.data[0]);
                $element.height($slideView.height());
            }
        },

        //public method to advance to the next image in a slideshow view
        advanceSlide: function (e) {
            var $element = this.element;
            var $slideView = $element.find('.slide-view');
            var $galleryView = $element.find('.gallery-view');
            var classId = $element.attr('id');
            var currSlide, nextSlide, nextIndex;

            if ($(e.currentTarget).parent().hasClass('view-stage')) {
                currSlide = $slideView.find('img.active');
                nextSlide = $slideView.find('img.active').next();
                nextIndex = $slideView.find('img').index(nextSlide);
                if (nextSlide.length > 0) {
                    currSlide.css({'position': 'absolute'}).removeClass('active').hide();
                    currSlide.next().css({'display': 'block', 'opacity': 0}).animate({opacity: 1}, 400, function () {
                        currSlide.next().addClass('active');
                        currSlide.removeAttr('style');
                        $galleryView.find('img').removeClass('active');
                        $galleryView.find('img').eq(nextIndex).addClass('active');
                    });
                    $element.find('.view-panel .slide-curr-count').text(nextIndex + 1);
                }
                $element.find('.view-panel .teaser-text').text(e.data[nextIndex]);

                if (nextIndex == $element.find('.slide-total').text() - 1) {
                    $element.find('.nav-right').hide();
                } else if (nextIndex > 0) {
                    $element.find('.nav-left').show();
                }
            } else if ($(e.currentTarget).parent().hasClass('view-container')) {
                currSlide = $galleryView.find('img.active');
                nextIndex = $galleryView.find('img').index(currSlide);
                nextSlide = $galleryView.find('img').eq(nextIndex + 1);
                if (nextSlide.length > 0) {
                    var nextURL = nextSlide.attr('src').replace('.thumb.100.140.jpg', '');
                    nextSlide.addClass('active');
                    currSlide.removeClass('active');
                    $('#imagegallery2-overlay').find('.view-container img').attr('src', nextURL);
                    $('#imagegallery2-overlay').find('.content-container').text(e.data[nextIndex + 1]);
                    $('#imagegallery2-overlay').find('.view-count .curr-count').text(nextIndex + 2);
                }

                if (nextIndex == $element.find('.slide-total').text() - 2) {
                    $('#imagegallery2-overlay.' + classId).find('.nav-right').hide();
                } else if (nextIndex > -1) {
                    $('#imagegallery2-overlay.' + classId).find('.nav-left').show();
                }
            }
        },

        //public method to go back an image image in a slideshow view
        previousSlide: function (e) {
            var $element = this.element;
            var $slideView = $element.find('.slide-view');
            var $galleryView = $element.find('.gallery-view');
            var classId = $element.attr('id');
            var currSlide, nextSlide, nextIndex;

            if ($(e.currentTarget).parent().hasClass('view-stage')) {
                currSlide = $slideView.find('img.active');
                nextSlide = $slideView.find('img.active').prev();
                nextIndex = $slideView.find('img').index(nextSlide);
                if (nextSlide.length > 0 && !nextSlide.hasClass('nav-right')) {
                    currSlide.css({'position': 'absolute'}).removeClass('active').hide();
                    nextSlide.css({'display': 'block', 'opacity': 0}).animate({opacity: 1}, 400, function () {
                        nextSlide.addClass('active');
                        currSlide.removeAttr('style');
                        $galleryView.find('img').removeClass('active');
                        $galleryView.find('img').eq(nextIndex).addClass('active');
                    });
                    $element.find('.view-panel .slide-curr-count').text(nextIndex + 1);
                }

                $element.find('.view-panel .teaser-text').text(e.data[nextIndex]);

                if (nextIndex == 0) {
                    $element.find('.nav-left').hide();
                } else if (nextIndex < $element.find('.slide-total').text()) {
                    $element.find('.nav-right').show();
                }
            } else if ($(e.currentTarget).parent().hasClass('view-container')) {
                currSlide = $galleryView.find('img.active');
                nextIndex = $galleryView.find('img').index(currSlide);
                nextSlide = $galleryView.find('img').eq(nextIndex - 1);
                if (nextIndex != 0) {
                    var nextURL = nextSlide.attr('src').replace('.thumb.100.140.jpg', '');
                    nextSlide.addClass('active');
                    currSlide.removeClass('active');
                    $('#imagegallery2-overlay').find('.view-container img').attr('src', nextURL);
                    $('#imagegallery2-overlay').find('.content-container').text(e.data[nextIndex - 1]);
                    $('#imagegallery2-overlay').find('.view-count .curr-count').text(nextIndex);
                }

                if (nextIndex == 1) {
                    $('#imagegallery2-overlay.' + classId).find('.nav-left').hide();
                } else if (nextIndex < $element.find('.slide-total').text()) {
                    $('#imagegallery2-overlay.' + classId).find('.nav-right').show();
                }
            }

        },

        // Use the destroy method to clean up any modifications your widget has made to the DOM
        destroy: function () {
            $.Widget.prototype.destroy.call(this);
        }

    });
}(jQuery));
