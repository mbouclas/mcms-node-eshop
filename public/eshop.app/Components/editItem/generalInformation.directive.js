(function() {
    angular.module('mcms.eshop.product')
        .directive('productGeneralInformation', generalInformation);

    generalInformation.$inject = ['eshopConfig'];
    generalInformationController.$inject = ['eshop.productService','$scope','$rootScope'
        ,'eshopConfig','$timeout','configuration','lodashFactory'];


    function generalInformation(Config) {

        return {
            templateUrl: Config.appUrl + "Components/editItem/generalInformation.directive.html",
            controller: generalInformationController,
            require: ['^editProduct'],
            scope: {},
            restrict : 'E',
            link : generalInformationLink,
            controllerAs: 'VM'
        };
    }

    function generalInformationLink(scope, elem, attrs, editProductController){

    }

    function generalInformationController(Product,$scope,$rootScope,Config,$timeout,BaseConfig,lo){
        var vm = this;
        vm.redactorConfig = Config.redactor;
        var thumb = {
                copies : {
                    thumb : {}
                }
            },
            mediaFiles = {
                images : [],
                documents : []
            };
        vm.categories = Product.Categories;
        vm.uploadOptions = BaseConfig.fileTypes.image;

        $rootScope.$on('product.loaded',function(event,product){
            vm.Product = product;
            vm.uploadConfig = {
                url : Config.apiUrl + 'uploadThumb',
                fields : {
                    id : product._id
                }
            };
        });


        vm.onUploadDone = function(file,response){//handle the after upload shit
            if (!vm.Product.thumb){
                vm.Product.thumb = thumb;
            }

            vm.Product.thumb = response;
        };

        vm.categoriesChange = function(item){
            if (!vm.Product.categories){
                vm.Product.categories = [];
            }

            if (lo.find(vm.Product.categories,{id : item.id})){
                return;
            }

            vm.Product.categories.push(item);
        };

        vm.removeCategoryFromModel = function(category){
            vm.Product.categories.splice(lo.findIndex(vm.Product.categories,{id : category.id}),1);
        };



    }


})();