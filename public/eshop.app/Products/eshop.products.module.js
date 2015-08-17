(function(){
    'use strict';

    angular.module('mcms.eshop.product',[

    ])
        .config(moduleConfig);

    moduleConfig.$inject = ['$routeProvider','eshopConfiguration'];

    function moduleConfig($routeProvider,configuration) {
        $routeProvider
            .when('/products', {
                templateUrl: configuration.appUrl + 'Products/index.html',
                controller: 'viewProductsCtrl',
                controllerAs: 'VM',
                name : 'view-products',
                reloadOnSearch : false
            })
            .when('/product/edit/:id', {
                templateUrl: configuration.appUrl + 'Products/editProduct.html',
                controller: 'editProductCtrl',
                controllerAs: 'VM',
                name : 'edit-product',
                reloadOnSearch : false
            });
    }
})();