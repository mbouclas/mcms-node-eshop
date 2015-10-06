(function(){
    'use strict';

    angular.module('mcms.eshop.categories',[])
        .config(moduleConfig);

    moduleConfig.$inject = ['$routeProvider','eshopConfiguration'];

    function moduleConfig($routeProvider,configuration) {
        $routeProvider
            .when('/products/categories', {
                templateUrl: configuration.appUrl + 'Categories/index.html',
                controller: 'viewCategoriesCtrl',
                controllerAs: 'VM',
                name : 'view-product-categories',
                reloadOnSearch : false
            })
            .when('/products/categories/edit/:id', {
                templateUrl: configuration.appUrl + 'Categories/editCategory.html',
                controller: 'editCategoryCtrl',
                controllerAs: 'VM',
                name : 'edit-product-category',
                reloadOnSearch : false
            });
    }
})();