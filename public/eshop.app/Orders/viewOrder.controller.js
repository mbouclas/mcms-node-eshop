(function(){
    angular.module('mcms.eshop.product')
        .controller('viewOrderCtrl',viewOrderCtrl);

    viewOrderCtrl.$inject = ['$rootScope','logger','pageTitle','eshop.ordersService','$timeout','$routeParams','eshop.productService','configuration'];

    function viewOrderCtrl($rootScope,logger,pageTitle,eshopService,$timeout,$routeParams,Product,BaseConfig){
        var vm = this;
        vm.statusCodes = [];
        for (var key in Product.statusCodes){
            vm.statusCodes.push({
                status : parseInt(key),
                label : Product.statusCodes[key]
            });
        }
        vm.Lang = BaseConfig.Lang;
        eshopService.get($routeParams.id).then(function(order){
            vm.Order = order;
        });

        vm.reSendInvoice = function(){

            eshopService.reSendInvoice(vm.Order._id,vm.Order.status).then(function(result){
                updateSuccess('Invoice sent');
            });
        };

        vm.changeOrderStatus = function(){
            eshopService.changeOrderStatus(vm.Order._id,vm.Order.status).then(function(result){
                updateSuccess('Order status updated...');
            });

        };

        vm.saveTrackingNumber = function(){
            eshopService.saveTrackingNumber(vm.Order._id,vm.Order.orderDetails.tackingNumber).then(function(result){
                updateSuccess('Tracking number saved');
            });
        };

        function updateSuccess(message){
            vm.success = true;
            vm.successMessage = message || null;
            $timeout(function(){
                vm.success = false;
            },5000);
        }

        pageTitle.set('Order ' + $routeParams.id);

    }

})();