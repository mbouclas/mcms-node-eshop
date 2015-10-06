(function(){
    angular.module('mcms.eshop.categories')
        .controller('viewCategoriesCtrl',viewCategoriesCtrl);

    viewCategoriesCtrl.$inject = ['$rootScope','logger','pageTitle','eshop.productService','$timeout'];

    function viewCategoriesCtrl($rootScope,logger,pageTitle,eshopService,$timeout){
        var vm = this,
            timer = false;
        vm.filters = {
            active : {
                type : 'equals'
            },
            sku : {
                type : 'like',
                placeholder : 'sku',
                model : 'sku',
                fieldType : 'text'
            },
            title : {
                type : 'like',
                placeholder : 'Title',
                model : 'title',
                fieldType : 'text'
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
            return eshopService.getCategories({filters : vm.filters,page : page || 1 })
                .then(function(categories){
                    console.log(categories)
                });
        }

        pageTitle.set('Categories');

    }

})();