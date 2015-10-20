(function () {
    angular.module('mcms.eshop.categories')
        .controller('viewCategoriesCtrl', viewCategoriesCtrl);

    viewCategoriesCtrl.$inject = ['$rootScope', 'logger', 'pageTitle', 'eshop.categoriesService', '$timeout','eshop.productService'];

    function viewCategoriesCtrl($rootScope, logger, pageTitle, Service, $timeout,Product) {
        var vm = this,
            timer = false;
        vm.currentCategory = {};
        vm.Categories = [];
        vm.filters = {
            active: {
                type: 'equals'
            },
            category: {
                type: 'like',
                placeholder: 'Title',
                model: 'title',
                fieldType: 'text'
            }
        };

        vm.setCurrentCategory = function (category) {
            if (!category) {//new
                category = Service.newCategory();
            }

            vm.currentCategory = category;
        };

        vm.onCategorySave = function (category) {
            Service.save(category)
                .then(function (result) {
                    if (!vm.currentCategory._id){//brand new
                        //look for the parent
                        var parent = lo.find(vm.Categories,{_id:result.parentId});
                        if (!parent){//root
                            vm.Categories.push(result);//push to the back of the array
                        } else {//push to the parent
                            //check if this parent has any children. Could be the first
                            if (!parent.children){
                                parent.children = [];
                            }
                            parent.children.push(result);//just push it to the parent
                            lo.sortBy(parent.children,'orderBy');//resort
                        }
                    }

                    vm.saved = true;
                    //now repopulate the categories for the product module
                    Product.setCategories(vm.Categories);
                    $timeout(function () {
                        vm.saved = false;
                    }, 4000);
                    //show a saved message or something
                });
        };

        changePage().then(function () {

        });

        vm.filterItems = function () {
            if (timer) {
                $timeout.cancel(timer);
            }

            timer = $timeout(function () {
                changePage(1);//reset page
            }, 500);
        };

        vm.changePage = function (page) {
            changePage(page);
        };

        function changePage(page) {
            return Service.getCategories({filters: vm.filters, page: page || 1})
                .then(function (categories) {
                    vm.Categories = categories;
                });
        }

        pageTitle.set('Categories');
    }

})();