(function(){
    angular.module('mcms.eshop')
        .controller('editProductCtrl',editProductCtrl);

    editProductCtrl.$inject = ['$rootScope','logger','pageTitle'];

    function editProductCtrl($rootScope,logger,pageTitle){
        var vm = this;


        $rootScope.$on('product.loaded',function(e,product){

            pageTitle.set({
                pageTitle : product.title,
                path : [
                    {
                        href : 'eshop',
                        title : 'Products'
                    }
                ]
            });
        });

        pageTitle.set('Products');
    }


})();