(function() {
    angular.module('mcms.eshop.product')
        .directive('productExtraFields', extraFields);

    extraFields.$inject = ['eshopConfig'];
    extraFieldsController.$inject = ['eshop.productService','$scope','$rootScope'
        ,'eshopConfig','$timeout','configuration','lodashFactory'];

    function extraFields(Config) {

        return {
            templateUrl: Config.appUrl + "Components/editItem/extraFields.directive.html",
            controller: extraFieldsController,
            require: ['^editProduct'],
            scope: {},
            restrict : 'E',
            link : extraFieldsLink,
            controllerAs: 'VM'
        };
    }

    function extraFieldsLink(scope, elem, attrs, editProductController){

    }

    function extraFieldsController(Product,$scope,$rootScope,Config,$timeout,BaseConfig,lo){
        $rootScope.$broadcast('module.loaded','productMediaFiles');
        var vm = this;
        vm.Product = {};
        vm.ExtraFields = Product.ExtraFields;
        $rootScope.$on('product.loaded',function(event,product){
            vm.Product = product;
        });

        vm.extraFieldValue = function(id){
            if (!vm.Product._id){
                return;
            }

            var field = lo.find(vm.Product.ExtraFields,{_id : id});
            if (!field){
                field = {
                    _id : id,
                    fieldID : id,
                    value : ''
                };
                vm.Product.ExtraFields.push(field);
                return lo.find(vm.Product.ExtraFields,{_id : id});
            }

            return field;
        };

    }


})();