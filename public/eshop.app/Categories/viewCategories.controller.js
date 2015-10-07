(function(){
    angular.module('mcms.eshop.categories')
        .controller('viewCategoriesCtrl',viewCategoriesCtrl);

    viewCategoriesCtrl.$inject = ['$rootScope','logger','pageTitle','eshop.productService','$timeout'];

    function viewCategoriesCtrl($rootScope,logger,pageTitle,eshopService,$timeout){
        var vm = this,
            timer = false;
        vm.currentCategory = {};
        vm.filters = {
            active : {
                type : 'equals'
            },
            category : {
                type : 'like',
                placeholder : 'Title',
                model : 'title',
                fieldType : 'text'
            }
        };

        vm.setCurrentCategory = function(category){
          vm.currentCategory = category;
        };

        vm.onCategorySave = function(category){
          console.log('from callback',category);
        };

        changePage().then(function(){

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
                    vm.Categories = categories;
                });
        }

        pageTitle.set('Categories');
    }

})();