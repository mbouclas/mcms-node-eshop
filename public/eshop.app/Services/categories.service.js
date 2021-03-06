(function(){
    'use strict';

    angular.module('mcms.eshop.categories')
        .service('eshop.categoriesService',CategoriesService);

    CategoriesService.$inject = ['eshop.dataService','eshopConfig','$rootScope','lodashFactory','$timeout'];

    function CategoriesService(dataService,Config,$rootScope,lo){
        var Service = {
            loaded : false,
            newCategory : newCategory,
            getCategories : getCategories,
            save : saveCategory
        };

        return Service;

        function newCategory(){
            return lo.clone({
                category: '',
                permalink: '',
                orderby: 0,
                settings: {},
                ExtraFields: [],
                active : false,
                thumb : {},
                uid : {}
            });
        }

        function saveCategory(data){
            if (!data.id){
                return dataService.Post('createCategory',{data : data})
                    .then(function (res) {
                    });
            }

            return dataService.Post('updateCategory',{id : data._id,data : data});
        }

        function getCategories(options){
            options = lo.merge({
                page : 1
            },options);
            return dataService.Post('allCategories',options)
                .then(dataService.responseSuccess);
        }

    }


})();