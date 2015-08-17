(function(){
    'use strict';

    angular.module('mcms.eshop.orders',[])
        .config(moduleConfig);

    moduleConfig.$inject = ['$routeProvider','eshopConfiguration'];

    function moduleConfig($routeProvider,configuration) {
        $routeProvider
            .when('/orders', {
                templateUrl: configuration.appUrl + 'Orders/index.html',
                controller: 'viewOrdersCtrl',
                controllerAs: 'VM',
                name : 'orders-home',
                reloadOnSearch : false
            })
            .when('/orders/view/:id', {
                templateUrl: configuration.appUrl + 'Orders/viewOrder.html',
                controller: 'editProductCtrl',
                controllerAs: 'VM',
                name : 'view-order',
                reloadOnSearch : false
            });
    }
})();