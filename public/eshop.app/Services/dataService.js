(function(){
    'use strict';

    angular.module('mcms.eshop')
        .service('eshop.dataService',dataService);

    dataService.$inject = ['core.dataService','eshopConfig'];


    function dataService(baseService,Config){
        var dataServiceObj;
        dataServiceObj = Object.create(new baseService({
            apiUrl : Config.apiUrl
        }));

        dataServiceObj.getAllProducts = getAllProducts;
        dataServiceObj.init = init;
        dataServiceObj.create = create;
        dataServiceObj.update = update;

        return dataServiceObj;
    }

    function init(){
        return this.Post('initProducts').then(this.responseSuccess);
    }

    function getAllProducts(options){
        return this.Post('allProducts',options);
    }

    function create(data){
        return this.Post('create',{data: data}).then(this.responseSuccess);
    }

    function update(id,data){
        return this.Post('update',{id : id,data : data}).then(this.responseSuccess);
    }

})();