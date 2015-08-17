(function() {
    angular.module('mcms.eshop.product')
        .directive('editProduct', editProduct);

    editProduct.$inject = ['eshopConfig'];
    editProductController.$inject = ['eshop.productService','$timeout','eshopConfig','$routeParams','$rootScope','lodashFactory','configuration'];

    function editProduct(Config) {
        return {
            controller: editProductController,
            templateUrl: Config.appUrl + "Products/editProduct.directive.html",
            scope : {},
            restrict : 'E',
            controllerAs: 'VM'
        };

    }

    function editProductController(Product,$timeout,Config,$routeParams,$rootScope,lo,BaseConfig){
        var vm = this;

        if ($routeParams.id){
            Product.get($routeParams.id).then(function(product){

                $rootScope.$broadcast('product.loaded',product);

                vm.Product = product;

            });
        } else {//new product
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
            $rootScope.$broadcast('product.loaded',vm.Product);
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