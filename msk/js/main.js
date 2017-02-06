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
            iconImageHref: '../img/map_pointer.png',
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
        var form = $('#registrationForm');
        addCustomEmailValidation();
        configP5api('#registrationForm');
        initValidation(form);

        form.submit(function(e){
            e.preventDefault();
            handleSubmit(form);
        });

        $("a[target='_self']").on("click", function(e) {
            e.preventDefault();
            e.stopPropagation();
            $('.active').toggleClass('active');
            $(this).toggleClass('active');
            scrollToAnchor($(this).attr("href").replace("#", ''));
        })

        $("#photoFile").on('change', function(event) {
            /*var reader = new window.FileReader();
            reader.readAsDataURL(event.target.files[0]); 
            reader.onloadend = function() {
                var type = event.target.files[0].type;

                if(type.toLowerCase().indexOf("jpeg") < 0 && type.toLowerCase().indexOf("tiff") < 0){
                    $("<div class='error-block'>ФАЙЛ ИМЕЕТ НЕВЕРНЫЙ ФОРМАТ</div>").insertAfter("#photoPreview")
                } else {
                    var img = document.createElement('img');
                    img.onload = function() {
                        width = img.naturalWidth  || img.width;
                        height = img.naturalHeight || img.height;

                        console.log(width, height);
                    }

                    $(img).css('visibility', 'hidden');
                    $(img).attr('src', reader.result);

                    $('#photoPreview').attr('src', reader.result);
                }
            }*/

            $('#photoPreview').attr('src', event.target.value);
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

        $('select').each(function(){
            var $this = $(this), numberOfOptions = $(this).children('option').length;
        
            $this.addClass('select-hidden'); 
            $this.wrap('<div class="select"></div>');
            $this.after('<div class="select-styled"></div>');

            var $styledSelect = $this.next('div.select-styled');
            $styledSelect.text($this.children('option').eq(0).text());
        
            var $list = $('<ul />', {
                'class': 'select-options'
            }).insertAfter($styledSelect);
        
            for (var i = 0; i < numberOfOptions; i++) {
                $('<li />', {
                    text: $this.children('option').eq(i).text(),
                    rel: $this.children('option').eq(i).val()
                }).appendTo($list);
            }
        
            var $listItems = $list.children('li');
        
            $styledSelect.click(function(e) {
                e.stopPropagation();
                $('div.select-styled.active').not(this).each(function(){
                    $(this).removeClass('active').next('ul.select-options').hide();
                });
                $(this).toggleClass('active').next('ul.select-options').toggle();
            });
        
            $listItems.click(function(e) {
                e.stopPropagation();
                $styledSelect.text($(this).text()).removeClass('active');
                $this.val($(this).attr('rel'));
                $list.hide();
                $this.trigger('blur')
                //console.log($this.val());
            });
        
            $(document).click(function() {
                $styledSelect.removeClass('active');
                $list.hide();
            });

        });
    });

    function initValidation(form){
        form.validate({
            rules: {
                firstName: {
                    required: true
                },
                lastName: {
                    required: true
                },
                middleName: {
                    required: true
                },
                positionru: {
                    required: true,
                    cyrillic: true
                },
                companyru: {
                    required: true,
                    cyrillic: true
                },
                phone: {
                    required: true,
                    customephone: true
                },
                email: {
                    required: true,
                    customemail: true
                },
                partType: {
                    customRequired: true
                },
                Region: {
                    customRequired: true
                }
            },
            messages: {
                lastName: "Введите вашу фамилию",
                firstName: "Введите ваше имя",
                middleName: "Введите ваше отчество",
                positionru: "Введите вашу должность на русском языке",
                companyru: "Введите название компании на русском языке",
                phone: {
                    required: "Введите свой контактный номер телефона",
                    customephone: "Допускаются только цифры"
                },
                email: {
                    required: "Введите свой email",
                    customemail: "Неверный формат email'а"
                },
                partType: { customRequired: "Укажите тип участия"},
                Region: { customRequired: "Укажите регион"}
            },
            highlight: function(element) {
                $(element).closest('.form-group').addClass('has-error');
            },
            unhighlight: function(element) {
                $(element).closest('.form-group').removeClass('has-error');
            },
            errorElement: 'div',
            errorClass: 'error-block',
            errorPlacement: function(error, element) {
                if(error[0].id === "photo-error"){
                    $("#photoPreviewContainer").append(error)
                } else {
                    error.insertAfter(element)
                }
            }
        });

        $(D).scroll(function(e){
            var scrollingElement = $(e.target.scrollingElement);
            var anchors = $.makeArray(e.target.anchors);
            anchors.reverse();

            if(scrollingElement.height() - scrollingElement.scrollTop() - 62 < $(window).height()){
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
    }

    function handleSubmit(form) {
        if(form.valid() && !submitDisable){
            submitDisable = true;
            $("#submitBtn").prop("disabled",true);
            p5api.sendRequest(function(json){
                console.log("success");
                $("#registrationSuccess").show();
                $("#registrationForm").hide();
                var aTag = $("a[name='registration']");
                $('html,body').animate({scrollTop: aTag.offset().top},'slow');
            }, function(json) {
                console.log("fail");
                $("#registrationFailure").show();
                $("#registrationForm").hide();
                var aTag = $("a[name='registration']");
                $('html,body').animate({scrollTop: aTag.offset().top},'slow');
            });
        }
    }

    function configP5api(formSelector){
    p5api.init(
            p5api.config("ItsExportTime", "http://193.124.184.171:8082/endpoint", false, formSelector)
        );
    }

    function scrollToAnchor(aid){
        var aTag = $("a[name='"+ aid +"']");
        $('html,body').animate({scrollTop: aTag.offset().top - (menuOpen ? 192 : 62)},'slow');
    }

    function addCustomEmailValidation(){
        $.validator.addMethod("customemail", 
            function(value, element) {
                return /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(value);
            }, 
            "Неверный формат email'а"
        );

        $.validator.addMethod("customephone", 
            function(value, element) {
                return /[0-9]+$/.test(value);
            }, 
            "Допускаются только цифры"
        );

        $.validator.addMethod("customRequired", 
            function(value, element) {
                console.log(value)
                return value != "hide" && value;
            }, 
            "Допускаются только цифры"
        );

        $.validator.addMethod("cyrillic", 
            function(value, element) {
                return /[^a-zA-Z]+$/.test(value);
            }, 
            "Значение должно быть на русском языке"
        );

        $.validator.addMethod("latin", 
            function(value, element) {
                return /[^а-яА-Я]+$/.test(value);
            }, 
            "Значение должно быть на английском языке"
        );

        $.validator.addMethod("photoSize", 
            function(value, element) {
                if(element.files) {
                    var photofile = element.files[0];

                    if(photofile.size > 5242880){
                        return false;
                    } else {
                        return true;
                    }
                }
            }, 
            "Размер файла превышает 5 Мб"
        );
    }

})(jQuery, document, this.p5api);