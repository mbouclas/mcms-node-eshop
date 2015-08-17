(function(){
    angular.module('mcms.eshop')
        .controller('eshopCtrl',eshopCtrl);

    eshopCtrl.$inject = ['$rootScope','logger','pageTitle','eshop.productService','$timeout','eshop.productService','configuration'];

    function eshopCtrl($rootScope,logger,pageTitle,eshopService,$timeout,Product,Config){
        var vm = this;
        pageTitle.set('E-Shop');
        var Lang = Config.Lang;
        var statusCodes = [];
        for (var i in Product.statusCodes){
            statusCodes.push({
                n : Lang.userPanel.statusCodes[Product.statusCodes[i]],
                v : i
            });
        }

        vm.filters = [
            {
                placeholder : 'Order ID',
                model: 'orderId',
                type: 'like',
                fieldType: 'text'
            },
            {
                placeholder : 'email',
                model: 'email',
                type: 'like',
                fieldType: 'email'
            },
            {
                placeholder : 'name',
                model: 'name',
                type: 'like',
                fieldType: 'text'
            },
            {
                model: 'created_at',
                type: 'date',
                fieldType: 'date'
            },
            {
                model: 'status',
                type: 'equals',
                fieldType: 'select',
                options: "o.v as o.n for o in " + JSON.stringify(statusCodes),
                varType : 'int'
            }
        ];
    }


})();