(function(){
    angular.module('mcms.eshop.product')
        .controller('viewProductsCtrl',viewProductsCtrl);

    viewProductsCtrl.$inject = ['$rootScope','logger','pageTitle','eshop.productService','$timeout'];

    function viewProductsCtrl($rootScope,logger,pageTitle,eshopService,$timeout){
        var vm = this,
            timer = false;
        vm.filters = {
            active : {
                type : 'equals'
            },
            sku : {
                type : 'like'
            },
            title : {
                type : 'like'
            },
            categories: {
                type : 'in'
            }
        };

        changePage().then(function(){
            vm.categories = eshopService.Categories;
        });

        vm.filterItems = function(){
            if (timer){
                $timeout.cancel(timer);
            }

            timer = $timeout(function(){
                changePage(1);//reset page
            },500);
        };

        vm.changePage = function(page){
            changePage(page);
        };

        function changePage(page){
            return eshopService.getProducts({filters : vm.filters,page : page || 1 })
                .then(function(products){
                    vm.products = products.items;
                    vm.itemCount = products.itemCount;
                    vm.pagination = products.pagination;
                });
        }

        pageTitle.set('Products');

    }

})();