ymaps.ready(function () {
    var myMap = new ymaps.Map('location', {
            center: [55.756318, 37.557306],
            zoom: 17
        }, {
            searchControlProvider: 'yandex#search'
        }),
        myPlacemark = new ymaps.Placemark([55.755470, 37.557266], {
            hintContent: 'Собственный значок метки',
            balloonContent: 'Это красивая метка'
        }, {
            // Опции.
            // Необходимо указать данный тип макета.
            iconLayout: 'default#image',
            // Своё изображение иконки метки.
            iconImageHref: '../img/map_mark.png',
            // Размеры метки.
            iconImageSize: [30, 42],
            // Смещение левого верхнего угла иконки относительно
            // её "ножки" (точки привязки).
            iconImageOffset: [-3, -42]
        });

    myMap.geoObjects.add(myPlacemark);
});

(function($, D, p5api){
    console.log('main');
    var submitDisable = false;

    $(D).ready(function(){
        var form = $('#registrationForm');
        addCustomEmailValidation();
        configP5api('#registrationForm');
        initValidation(form);

        form.submit(function(e){
            e.preventDefault();
            handleSubmit(form);
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

        $('#remain-time').countdown('2016/11/08 09:00:00', function(event) {
            $("#remain-time-days").html(event.offset.days + event.offset.weeks * 7);
            $("#remain-time-hours").html(event.offset.hours);
            $("#remain-time-minutes").html(event.offset.minutes);
            $("#remain-time-seconds").html(event.offset.seconds);
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
                positioneng: {
                    required: true,
                    latin: true
                },
                companyeng: {
                    required: true,
                    latin: true
                },
                phone: {
                    required: true,
                    customephone: true
                },
                email: {
                    required: true,
                    customemail: true
                },
                photo: {
                    required: true,
                    photoSize: true
                },
                partType: {
                    required: true
                },
                country: {
                    required: true
                }
            },
            messages: {
                lastName: "Surname is required",
                firstName: "Firstname is required",
                positioneng: {
                    required: "Job title is required",
                    latin: "Only latin letters are allowed"
                },
                companyeng: {
                    required: "Company name is required",
                    latin: "Only latin letters are allowed"
                },
                phone: {
                    required: "Contact phone number is required",
                    customephone: "Only digits are allowed"
                },
                email: {
                    required: "E-mail required",
                    customemail: "Wrong e-mail's format"
                },
                photo: {
                    required: "Upload your photo please",
                    photoSize: "Size exceeds 5 Mb"
                },
                partType: "Category is required",
                country: "Country is required"
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
            })
        }
    }

    function configP5api(formSelector){
    p5api.init(
            p5api.config("ItsExportTime", "http://193.124.184.171:8082/endpoint", false, formSelector)
        );
    }

    function addCustomEmailValidation(){
        $.validator.addMethod("customemail", 
            function(value, element) {
                return /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(value);
            }, 
            "Wrong email's format"
        );

        $.validator.addMethod("customephone", 
            function(value, element) {
                return /[0-9]+$/.test(value);
            }, 
            "Only digits are allowed"
        );

        $.validator.addMethod("latin", 
            function(value, element) {
                return /[^а-яА-Я]+$/.test(value);
            }, 
            "Only latin letters are allowed"
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
            "Size exceeds 5 Mb"
        );
    }

})(jQuery, document, this.p5api);

angular.module("mosurbanforum", ["sotos.crop-image"])
    .directive('validFile',function(){
        return {
            require:'ngModel',
            link:function(scope,el,attrs,ctrl){
                ctrl.$setValidity('validFile', el.val() != '');
                //change event is fired when file is selected
                el.bind('change',function(){
                    ctrl.$setValidity('validFile', el.val() != '');
                    scope.$apply(function(){
                        ctrl.$setViewValue(el.val());
                        ctrl.$render();
                    });
                });
            }
        }
    })
    .controller("IndexController", function($scope, $location, $window) {

        $scope.isSubmitDisable = false;

        $scope.forms = {};
        $scope.dialog = {
            show:false,
            photo:''
        };

        console.log("Last name changed 2");

        $scope.onLastNameChanged = function() {
            $scope.lastNameEng = toTranslit($scope.lastName);
        }

        $scope.onFirstNameChanged = function() {
            $scope.firstNameEng = toTranslit($scope.firstName);
        }

        $scope.onOrganizationBadgeChanged = function() {
            $scope.organizationBadgeEng = toTranslit($scope.organizationBadge);
        }

        $scope.latinPattern = "[a-zA-Z0-9\-\ \`\>\<\'\"s]+";
        $scope.cyrilicPattern = "[а-яА-Я0-9\-\ ёЁ\`\>\<\'\"s]+";

        $scope.registerPhoto = "";

        $scope.accept = false;

        $scope.imageOut = '';

        $scope.options={};                      // required
        $scope.options.image=angular.copy($scope.dialog.photo);
        //$scope.options.image=angular.copy(file);       // image for crop required
        //$scope.options.inModal = true;
        var size = $window.innerHeight * 0.6;
        $scope.options.viewSizeWidth= size;      // canvas size default 480 or 30% 50% 80%...
        $scope.options.viewSizeHeight= size;

        $scope.options.viewShowRotateBtn= false;   //if rotate tool show default true
        $scope.options.rotateRadiansLock= false;  // lock radians default true

        $scope.options.outputImageWidth= 750; //output size of image 0 take the size of source image
        $scope.options.outputImageHeight= 1000;
        $scope.options.outputImageRatioFixed= true; //keep the ratio of source image
        $scope.options.outputImageType= "png"; //output image type
        //if this check the image crop by the original size off image and no resize
        $scope.options.outputImageSelfSizeCrop= false;

        //show the crop tool use only for crop and crop again one image
        $scope.options.viewShowCropTool= true;

        //this is the watermark if is set the watermark tool
        //show after crop
        //watermark type = text or image
        $scope.options.watermarkType='image';
        //set the image
        $scope.options.watermarkImage= null;
        //set text if type is text
        $scope.options.watermarkText= null;
        //settings for the text canvas textfill
        $scope.options.watermarkTextFillColor= 'rgba(0,0, 0, 0.8)'; //color of the letters
        $scope.options.watermarkTextFont= 'Arial'; //font

        $scope.$watch('options.viewShowCropTool',function(){
            $scope.options.viewShowCropTool= true;
        });

        $scope.file_changed = function(element) {
            if(element.files) {
                var photofile = element.files[0];
                
                if(photofile.size < 5242880){
                    var reader = new FileReader();
                    reader.onload = function (e) {
                        $scope.$apply(function () {
                            $scope.dialog.photo = e.target.result;
                            $scope.show();
                        });
                    };
                    reader.readAsDataURL(photofile);
                }
            }
            else {
                var file = encodeURIComponent(element);
                console.log(file);
            }
        };

        $scope.closeDialog = function() {
            $scope.dialog.show=false;
            $scope.photo = "";
            var t = document.querySelector('input[name="photo"]');
            angular.element(t).val(null);
            t.value = null;
            t.files = null;
            $scope.editForm.photo.$modelValue = "";
            $scope.editForm.photo.$$rawModelValue = "";
            $scope.editForm.photo.$viewValue = "";
            $scope.editForm.photo.$commitViewValue();
            $scope.editForm.photo.$valid = false;
            $scope.editForm.photo.$invalid = true;
            $scope.editForm.$valid = false;
            console.log("fdg")
        };
        $scope.saveAvatar = function() {
            $scope.$broadcast('cropImageSave');
            $scope.dialog.show=false;
            $("#photoPreview").attr('src', $scope.imageOut);
        };
        $scope.isNotCropped =true;
        $scope.crop = function() {
            $scope.$broadcast('cropImage');
            $scope.isNotCropped = false;
        };
        $scope.rotateLeft = function(){
            $scope.$broadcast('rotateLeft')
        };
        $scope.rotateRight = function(){
            $scope.$broadcast('rotateRight')
        };
        $scope.show = function(){
            //$location.hash('scroll_top').then(function(){
                $scope.dialog.show=true;
                $scope.options.image=angular.copy($scope.dialog.photo);       // image for crop required
            //});
        };

        $scope.$on("imageOut", function(response, imageData) {
            $scope.imageOut = imageData;
        });

        $scope.showOtherIfSelected = function(current, id, value) {
            var element = $("#" + id);

            if ( typeof value === "string") {
                value = value.substring(value.indexOf(":") + 1)
            }

            if ( current == value ) {
                element.removeClass("hidden");
            } else {
                element.attr("value", "");
                element.addClass("hidden");
            }
        };

        $scope.init = function() {

        };

        $scope.cropImageSave = function(imageOut) {
            $scope.imageOut = imageOut;
        };

        $scope.isValid = function() {
            return $scope.editForm.$valid && $scope.editForm.photo.$valid;
        };
    });