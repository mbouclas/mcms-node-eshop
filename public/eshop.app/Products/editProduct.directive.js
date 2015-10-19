(function() {
    angular.module('mcms.eshop.product')
        .directive('editProduct', editProduct);

    editProduct.$inject = ['eshopConfig','$rootScope'];
    editProductController.$inject = ['$scope','eshop.productService','$timeout','eshopConfig','$routeParams','$rootScope','lodashFactory','configuration'];

    function editProduct(Config,$rootScope) {
        return {
            controller: editProductController,
            templateUrl: Config.appUrl + "Products/editProduct.directive.html",
            scope : {},
            restrict : 'E',
            controllerAs: 'VM'
        };

    }

    function editProductController($scope,Product,$timeout,Config,$routeParams,$rootScope,lo,BaseConfig){
        var modulesToWaitFor = [
            'productMediaFiles',
            'productExtraFields'
        ],
            modulesLoaded = 0;

        $rootScope.$on('module.loaded', function(e,module) {
            //do your will
            if (modulesToWaitFor.indexOf(module) != -1){
                modulesLoaded++;
            }
            console.log(modulesLoaded,module)
            if (modulesLoaded == modulesToWaitFor.length){
                allDone();
            }
        });

        var vm = this;
        vm.Product = {
            active : false,
            categories : [],
            ExtraFields : [],
            thumb : {},
            mediaFiles : {
                images : [],
                documents : [],
                videos : []
            },
            related : [],
            upselling : [],
            productOptions : {},
            settings : {}
        };

        function allDone(){
            if ($routeParams.id != 'new'){
                Product.get($routeParams.id).then(function(product){

                    $rootScope.$broadcast('product.loaded',product);
                    vm.Product = product;

                });
            } else {//new product
                $rootScope.$broadcast('product.loaded',vm.Product);
            }
        }

        $rootScope.$on('file.upload.progress',function(e,file,progress){//monitor file progress

        });

        $rootScope.$on('file.upload.added',function(e,files){//new files added
            //$rootScope.$broadcast('file.upload.startUpload',files);//could be bound on a button
        });

        vm.changeState = function(state){
            console.log(state)
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
    }
})();