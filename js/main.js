ymaps.ready(function () {
    var myMap = new ymaps.Map('location', {
            center: [55.75589, 37.554575],
            zoom: 16
        }, {
            searchControlProvider: 'yandex#search'
        }),
        myPlacemark = new ymaps.Placemark([55.75589, 37.554575], {
            hintContent: 'Конгресс центр'
        }, {
            // Опции.
            // Необходимо указать данный тип макета.
            iconLayout: 'default#image',
            // Своё изображение иконки метки.
            iconImageHref: 'img/map_pointer.png',
            // Размеры метки.
            iconImageSize: [30, 42],
            // Смещение левого верхнего угла иконки относительно
            // её "ножки" (точки привязки).
            iconImageOffset: [-3, -50]
        });

    myMap.geoObjects.add(myPlacemark);
});

(function($, D, p5api){
    console.log('main');
    var submitDisable = false;
    var menuOpen = false;

    $(D).ready(function(){

        $("a[target='_self']").on("click", function(e) {
            e.preventDefault();
            e.stopPropagation();
            $('.active').toggleClass('active');
            $(this).toggleClass('active');
            scrollToAnchor($(this).attr("href").replace("#", ''));
        })

        $("#toggle-menu").on("click", function(e){
            
            e.preventDefault();
            e.stopPropagation();

            menuOpen = !menuOpen;

            $("#nav-bar").toggleClass("nav-bar-show");
            $("body").toggleClass("small-top-padding");
            $("body").toggleClass("big-top-padding");
            $("#toggle-menu").toggleClass("on");
        });

        $(D).scroll(function(e){
            var scrollingElement = $(e.target.scrollingElement);
            var anchors = $.makeArray(e.target.anchors);
            anchors.reverse();

            if(scrollingElement.height() - scrollingElement.scrollTop() < $(window).height()){
                $('.active').toggleClass('active');
                $("a[href=" + "#" + "contacts" + "]").toggleClass('active');
                return;
            }

            anchors = anchors.filter(function(anchor) {
                var aTag = $(anchor);

                return (aTag.offset().top - 100) < scrollingElement.scrollTop()
            })

            if(anchors.length > 0){
                var aTag = $(anchors[0]);
                $('.active').toggleClass('active');
                $("a[href=" + "#" + aTag.attr('name') + "]").toggleClass('active');
            } else {
                $('.active').toggleClass('active');
            }
        })

        $("#photoBtn").on('click', function(e){
            e.preventDefault();
            e.stopPropagation();

            $("#videoContainer").hide();
            $("#photoContainer").show();
        })

        $("#videoBtn").on('click', function(e){
            e.preventDefault();
            e.stopPropagation();

            $("#videoContainer").show();
            $("#photoContainer").hide();
        })
    });
    function scrollToAnchor(aid){
        var aTag = $("a[name='"+ aid +"']");
        $('html,body').animate({scrollTop: aTag.offset().top - (menuOpen ? 192 : 62)},'slow');
    }

})(jQuery, document, this.p5api);