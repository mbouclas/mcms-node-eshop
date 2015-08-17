(function(){
    'use strict';

    angular.module('mcms.eshop')
        .service('eshop.ordersService',ordersService);

    ordersService.$inject = ['eshop.dataService','eshopConfig','$rootScope','lodashFactory','$timeout'];

    function ordersService(dataService,Config,$rootScope,lo){
        var ordersService = {
            loaded : false,
            statusCodes : [],
            statusCodesById : {},
            save : save,
            all : getOrders,
            get : getOrder
        };

        return ordersService;


        function save(data){
            if (!data.id){
                return dataService.create(data)
                    .then(function (res) {
                    });
            }

            return dataService.update(data.id,data);
        }

        function getOrders(options){
            options = lo.merge({
                page : 1
            },options);
            return dataService.Post('getOrders',options)
                .then(dataService.responseSuccess);
        }

        function getOrder(id){
            return dataService.Post('getOrder',{id : id})
                .then(dataService.responseSuccess);
        }
    }


})();