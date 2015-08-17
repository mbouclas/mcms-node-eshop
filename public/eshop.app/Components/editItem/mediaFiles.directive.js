(function() {
    angular.module('mcms.eshop.product')
        .directive('productMediaFiles', mediaFiles);

    mediaFiles.$inject = ['eshopConfig'];
    mediaFilesController.$inject = ['eshop.productService','$scope','$rootScope'
        ,'eshopConfig','$timeout','configuration','lodashFactory'];


    function mediaFiles(Config) {

        return {
            templateUrl: Config.appUrl + "Components/editItem/mediaFiles.directive.html",
            controller: mediaFilesController,
            require: ['^editProduct'],
            scope: {},
            restrict : 'E',
            link : mediaFilesLink,
            controllerAs: 'VM'
        };

    }

    function mediaFilesLink(scope, elem, attrs, editProductController){

    }

    function mediaFilesController(Product,$scope,$rootScope,Config,$timeout,BaseConfig,lo){
        var vm = this;


        $rootScope.$on('product.loaded',function(event,product){
            vm.Product = product;
            vm.uploadConfig = {
                url : Config.apiUrl + 'uploadThumb',
                fields : {
                    id : product._id
                }
            };

            vm.uploadConfigMulti = {
                url : Config.apiUrl + 'uploadImage',
                fields : {
                    id : product._id
                }
            };
        });

        vm.sortableOptions = {
            containment: '#sortable-container',
            orderChanged: function(event) {
                recalculateOrderBy(vm.Product.mediaFiles.images);
            }
        };

        vm.onUploadDone = function(file,response){//handle the after upload shit
            if (!vm.Product.thumb){
                vm.Product.thumb = thumb;
            }

            vm.Product.thumb = response;
        };

        vm.saveProduct = function(){
            Product.save(vm.Product)
                .then(function (res) {
                    vm.success = true;
                    $timeout(function(){
                        vm.success = false;
                    },5000);
                });
        };


        vm.onUploadMultiDone = function(file,response){//handle the after upload shit
            if (!vm.Product.mediaFiles){
                vm.Product.mediaFiles = mediaFiles;
            }
            vm.Product.mediaFiles.images.push(lo.merge({id : response.id},response.copies));
        };

    }

    function recalculateOrderBy(arr){
        angular.forEach(arr,function(item,i){
            item.orderBy = i;
        });
    }


})();