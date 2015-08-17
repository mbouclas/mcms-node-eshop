(function() {
    angular.module('mcms.eshop.orders')
        .directive('viewOrders', viewOrders);

    viewOrders.$inject = ['eshopConfig'];
    viewOrdersController.$inject = ['eshop.ordersService','$scope','$rootScope'
        ,'eshopConfig','$timeout','configuration','lodashFactory','eshop.productService'];


    function viewOrders(Config) {

        return {
            templateUrl: Config.appUrl + "Components/orders/viewOrders.directive.html",
            controller: viewOrdersController,
            scope: {
                filters : '=filters'
            },
            restrict : 'E',
            link : viewOrdersLink,
            controllerAs: 'VM'
        };
    }

    function viewOrdersLink(scope, elem, attrs, editProductController){

    }

    function viewOrdersController(Order,$scope,$rootScope,Config,$timeout,BaseConfig,lo,Product){
        var vm = this,
            timer = false;

        if (lo.isArray($scope.filters)){
            vm.filters = $scope.filters;
        }

        vm.filterItems = function(){
            if (timer){
                $timeout.cancel(timer);
            }

            timer = $timeout(function(){
                changePage(1);//reset page
            },500);
        };

        vm.statusCodes = Product.statusCodes;
        vm.Lang = BaseConfig.Lang;
        changePage(1);


        function changePage(page){
            //i need to send an object and not an array
            var toSend = {};
            for (var i in vm.filters){
                toSend[vm.filters[i].model] = vm.filters[i];
            }

            Order.all({filters: toSend, page: page || 1})
                .then(function (result) {
                    vm.Count = result.count.count;
                    vm.Orders = result.orders;
                    vm.pagination = result.pagination;
                });
        }
    }



})();