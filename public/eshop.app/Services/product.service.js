(function(){
    'use strict';

    angular.module('mcms.eshop.product')
        .service('eshop.productService',eshopService);

    eshopService.$inject = ['eshop.dataService','eshopConfig','$rootScope','lodashFactory','$timeout'];

    function eshopService(dataService,Config,$rootScope,lo){
        var eshopService = {
            loaded : false,
            Categories : [],
            CategoriesById : {},
            statusCodes : {},
            init : init,
            save : save,
            getProducts : getProducts,
            get : get
        };

        return eshopService;

        function init(){
            var _this = this;
            this.loading = true;
            return dataService.init().then(function(res){
                eshopService.Categories = res.categories;
                eshopService.ExtraFields = res.ExtraFields;
                for (var i in eshopService.Categories){
                    eshopService.CategoriesById[eshopService.Categories[i]._id] = eshopService.Categories[i];
                }

                for (var i in eshopService.ExtraFields){
                    eshopService.CategoriesById[eshopService.ExtraFields[i]._id] = eshopService.ExtraFields[i];
                }
                eshopService.statusCodes = res.statusCodes;
                $rootScope.$broadcast('eshop.init.done');
                $rootScope.eshopAppDone = true;
                _this.loaded = true;
                _this.loading = false;
                return res;
            });
        }

        function save(data){
            if (!data.id){
                return dataService.create(data)
                    .then(function (res) {
                    });
            }

            return dataService.update(data.id,data);
        }

        function getProducts(options){
            options = lo.merge({
                page : 1
            },options);
            return dataService.Post('allProducts',options)
                .then(dataService.responseSuccess);
        }

        function get(id){
            return dataService.Post('getProduct',{id : id})
                .then(dataService.responseSuccess);
        }
    }


})();