(function(){
    'use strict';

    angular.module('mcms.eshop', [
        'mcms.eshop.configuration',
        'mcms.eshop.categories',
        'mcms.eshop.product',
        'mcms.eshop.orders'
    ])
        .config(eshopConfig)
        .run(eshopRun);

    eshopConfig.$inject = ['$routeProvider','eshopConfiguration'];
    eshopRun.$inject = ['eshop.productService','$rootScope','$location','$route'];


    function eshopConfig($routeProvider,configuration) {
        $routeProvider
            .when('/eshop', {
                templateUrl: configuration.appUrl + 'index.html',
                controller: 'eshopCtrl',
                controllerAs: 'VM',
                name : 'eshop-home'
            });
    }

    function eshopRun(eshopService,$rootScope,$location,$route){
        $rootScope.$on('$routeChangeStart', function(e, next, current) {
            if (!eshopService.loaded && !eshopService.loading){
                e.preventDefault();//pause until init
                eshopService.init().then(function(res){
                    $route.reload();//reload the route
                });
            }
        });

    }
})();

