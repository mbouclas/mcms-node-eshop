(function(){
    'use strict';

    angular.module('mcms.eshop', [
        'mcms.eshop.configuration',
        'mcms.eshop.categories',
        'mcms.eshop.product',
        'mcms.eshop.orders'
    ])
        .config(eshopConfig)
        .run(eshopRun);

    eshopConfig.$inject = ['$routeProvider','eshopConfiguration'];
    eshopRun.$inject = ['eshop.productService','$rootScope','$location','$route'];


    function eshopConfig($routeProvider,configuration) {
        $routeProvider
            .when('/eshop', {
                templateUrl: configuration.appUrl + 'index.html',
                controller: 'eshopCtrl',
                controllerAs: 'VM',
                name : 'eshop-home'
            });
    }

    function eshopRun(eshopService,$rootScope,$location,$route){
        $rootScope.$on('$routeChangeStart', function(e, next, current) {
            if (!eshopService.loaded && !eshopService.loading){
                e.preventDefault();//pause until init
                eshopService.init().then(function(res){
                    $route.reload();//reload the route
                });
            }
        });

    }
})();


(function(){
    'use strict';
    var assetsUrl = '/assets/',
        appUrl = '/eshop.app/',
        componentsUrl = appUrl + 'components/';
    var config = {
        apiUrl : '/admin/api/eshop/',
        imageBasePath: assetsUrl + 'img',
        appUrl : appUrl,
        componentsUrl : componentsUrl,
        menu : [],
        redactor : {
            wym : true,
            observeLinks : true,
            convertUrlLinks : true,
            plugins : ['fullscreen','fontsize','fontfamily','video','fontcolor'],
            removeEmpty : ['strong','em','p','span']
            //buttons : ['formatting', '|', 'bold', 'italic']
        }
    };

    angular.module('mcms.eshop.configuration',[])
        .constant('eshopConfiguration',config)
        .value('eshopConfig',config);


})();

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
(function(){
    'use strict';

    angular.module('mcms.eshop.categories',[])
        .config(moduleConfig);

    moduleConfig.$inject = ['$routeProvider','eshopConfiguration'];

    function moduleConfig($routeProvider,configuration) {
        $routeProvider
            .when('/products/categories', {
                templateUrl: configuration.appUrl + 'Categories/index.html',
                controller: 'viewCategoriesCtrl',
                controllerAs: 'VM',
                name : 'view-product-categories',
                reloadOnSearch : false
            })
            .when('/products/categories/edit/:id', {
                templateUrl: configuration.appUrl + 'Categories/editCategory.html',
                controller: 'editCategoryCtrl',
                controllerAs: 'VM',
                name : 'edit-product-category',
                reloadOnSearch : false
            });
    }
})();
(function(){
    'use strict';

    angular.module('mcms.eshop.product',[

    ])
        .config(moduleConfig);

    moduleConfig.$inject = ['$routeProvider','eshopConfiguration'];

    function moduleConfig($routeProvider,configuration) {
        $routeProvider
            .when('/products', {
                templateUrl: configuration.appUrl + 'Products/index.html',
                controller: 'viewProductsCtrl',
                controllerAs: 'VM',
                name : 'view-products',
                reloadOnSearch : false
            })
            .when('/product/edit/:id', {
                templateUrl: configuration.appUrl + 'Products/editProduct.html',
                controller: 'editProductCtrl',
                controllerAs: 'VM',
                name : 'edit-product',
                reloadOnSearch : false
            });
    }
})();
(function(){
    'use strict';

    angular.module('mcms.eshop.orders',[])
        .config(moduleConfig);

    moduleConfig.$inject = ['$routeProvider','eshopConfiguration'];

    function moduleConfig($routeProvider,configuration) {
        $routeProvider
            .when('/orders', {
                templateUrl: configuration.appUrl + 'Orders/index.html',
                controller: 'viewOrdersCtrl',
                controllerAs: 'VM',
                name : 'orders-home',
                reloadOnSearch : false
            })
            .when('/orders/view/:id', {
                templateUrl: configuration.appUrl + 'Orders/viewOrder.html',
                controller: 'viewOrderCtrl',
                controllerAs: 'VM',
                name : 'view-order',
                reloadOnSearch : false
            });
    }
})();
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
        return this.Post('createProduct',{data: data}).then(this.responseSuccess);
    }

    function update(id,data){
        return this.Post('updateProduct',{id : id,data : data}).then(this.responseSuccess);
    }

})();
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
            setCategories : setCategories,
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

        function setCategories(newCategories){
            this.Categories = newCategories;
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
            get : getOrder,
            reSendInvoice : reSendInvoice,
            changeOrderStatus : changeOrderStatus,
            saveTrackingNumber : saveTrackingNumber
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

        function reSendInvoice(id){
            return dataService.Post('reSendInvoice',{id : id})
                .then(dataService.responseSuccess);
        }

        function changeOrderStatus(id,status){
            return dataService.Post('changeOrderStatus',{id : id,status : status})
                .then(dataService.responseSuccess);
        }

        function saveTrackingNumber(id,trackingNumber){
            return dataService.Post('saveTrackingNumber',{id : id,trackingNumber:trackingNumber})
                .then(dataService.responseSuccess);
        }
    }


})();
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
(function() {
    angular.module('mcms.eshop.product')
        .directive('editProduct', editProduct);

    editProduct.$inject = ['eshopConfig','$rootScope'];
    editProductController.$inject = ['$scope','eshop.productService','$timeout','eshopConfig','$routeParams','$rootScope','lodashFactory','configuration'];

    function editProduct(Config,$rootScope) {
        return {
            controller: editProductController,
            templateUrl: Config.appUrl + "Products/editProduct.directive.html",
            scope : {},
            restrict : 'E',
            controllerAs: 'VM'
        };

    }

    function editProductController($scope,Product,$timeout,Config,$routeParams,$rootScope,lo,BaseConfig){
        var modulesToWaitFor = [
            'productMediaFiles',
            'productExtraFields'
        ],
            modulesLoaded = 0;

        $rootScope.$on('module.loaded', function(e,module) {
            //do your will
            if (modulesToWaitFor.indexOf(module) != -1){
                modulesLoaded++;
            }
            console.log(modulesLoaded,module)
            if (modulesLoaded == modulesToWaitFor.length){
                allDone();
            }
        });

        var vm = this;
        vm.Product = {
            active : false,
            categories : [],
            ExtraFields : [],
            thumb : {},
            mediaFiles : {
                images : [],
                documents : [],
                videos : []
            },
            related : [],
            upselling : [],
            productOptions : {},
            settings : {}
        };

        function allDone(){
            if ($routeParams.id != 'new'){
                Product.get($routeParams.id).then(function(product){

                    $rootScope.$broadcast('product.loaded',product);
                    vm.Product = product;

                });
            } else {//new product
                $rootScope.$broadcast('product.loaded',vm.Product);
            }
        }

        $rootScope.$on('file.upload.progress',function(e,file,progress){//monitor file progress

        });

        $rootScope.$on('file.upload.added',function(e,files){//new files added
            //$rootScope.$broadcast('file.upload.startUpload',files);//could be bound on a button
        });

        vm.changeState = function(state){
            console.log(state)
        };

        vm.saveProduct = function(){
            Product.save(vm.Product)
                .then(function (res) {
                    vm.success = true;
                    $timeout(function(){
                        vm.success = false;
                    },5000);
                });
        };
    }
})();
(function() {
    angular.module('mcms.eshop.product')
        .directive('productGeneralInformation', generalInformation);

    generalInformation.$inject = ['eshopConfig'];
    generalInformationController.$inject = ['eshop.productService','$scope','$rootScope'
        ,'eshopConfig','$timeout','configuration','lodashFactory'];


    function generalInformation(Config) {

        return {
            templateUrl: Config.appUrl + "Components/editItem/generalInformation.directive.html",
            controller: generalInformationController,
            require: ['^editProduct'],
            scope: {},
            restrict : 'E',
            link : generalInformationLink,
            controllerAs: 'VM'
        };
    }

    function generalInformationLink(scope, elem, attrs, editProductController){

    }

    function generalInformationController(Product,$scope,$rootScope,Config,$timeout,BaseConfig,lo){
        var vm = this;
        vm.redactorConfig = Config.redactor;
        var thumb = {
                copies : {
                    thumb : {}
                }
            },
            mediaFiles = {
                images : [],
                documents : []
            };
        vm.categories = Product.Categories;
        vm.uploadOptions = BaseConfig.fileTypes.image;

        $rootScope.$on('product.loaded',function(event,product){
            vm.Product = product;
            vm.uploadConfig = {
                url : Config.apiUrl + 'uploadThumb',
                fields : {
                    id : product._id
                }
            };
        });


        vm.onUploadDone = function(file,response){//handle the after upload shit
            if (!vm.Product.thumb){
                vm.Product.thumb = thumb;
            }

            vm.Product.thumb = response;
        };

        vm.categoriesChange = function(item){
            if (!vm.Product.categories){
                vm.Product.categories = [];
            }

            if (lo.find(vm.Product.categories,{id : item.id})){
                return;
            }

            vm.Product.categories.push(item);
        };

        vm.removeCategoryFromModel = function(category){
            vm.Product.categories.splice(lo.findIndex(vm.Product.categories,{id : category.id}),1);
        };



    }


})();
(function() {
    angular.module('mcms.eshop.product')
        .directive('productMediaFiles', mediaFiles);

    mediaFiles.$inject = ['eshopConfig'];
    mediaFilesController.$inject = ['eshop.productService','$scope','$rootScope'
        ,'eshopConfig','$timeout','configuration','lodashFactory'];


    function mediaFiles(Config) {

        return {
            templateUrl: Config.appUrl + "Components/editItem/mediaFiles.directive.html",
            controller: mediaFilesController,
            require: ['^editProduct'],
            scope: {},
            restrict : 'E',
            link : mediaFilesLink,
            controllerAs: 'VM'
        };

    }

    function mediaFilesLink(scope, elem, attrs, editProductController){

    }

    function mediaFilesController(Product,$scope,$rootScope,Config,$timeout,BaseConfig,lo){
        var vm = this;

        $rootScope.$broadcast('module.loaded','productMediaFiles');
        $rootScope.$on('product.loaded',function(event,product){
            vm.Product = product;
            vm.uploadConfig = {
                url : Config.apiUrl + 'uploadThumb',
                fields : {
                    id : product._id
                }
            };

            vm.uploadConfigMulti = {
                url : Config.apiUrl + 'uploadImage',
                fields : {
                    id : product._id
                }
            };
        });

        vm.sortableOptions = {
            containment: '#sortable-container',
            orderChanged: function(event) {
                recalculateOrderBy(vm.Product.mediaFiles.images);
            }
        };

        vm.onUploadDone = function(file,response){//handle the after upload shit
            if (!vm.Product.thumb){
                vm.Product.thumb = thumb;
            }

            vm.Product.thumb = response;
        };

        vm.saveProduct = function(){
            Product.save(vm.Product)
                .then(function (res) {
                    vm.success = true;
                    $timeout(function(){
                        vm.success = false;
                    },5000);
                });
        };


        vm.onUploadMultiDone = function(file,response){//handle the after upload shit
            if (!vm.Product.mediaFiles){
                vm.Product.mediaFiles = mediaFiles;
            }
            vm.Product.mediaFiles.images.push(lo.merge({id : response.id},response.copies));
        };

    }

    function recalculateOrderBy(arr){
        angular.forEach(arr,function(item,i){
            item.orderBy = i;
        });
    }


})();

(function() {
    angular.module('mcms.eshop.product')
        .directive('productExtraFields', extraFields);

    extraFields.$inject = ['eshopConfig'];
    extraFieldsController.$inject = ['eshop.productService','$scope','$rootScope'
        ,'eshopConfig','$timeout','configuration','lodashFactory'];

    function extraFields(Config) {

        return {
            templateUrl: Config.appUrl + "Components/editItem/extraFields.directive.html",
            controller: extraFieldsController,
            require: ['^editProduct'],
            scope: {},
            restrict : 'E',
            link : extraFieldsLink,
            controllerAs: 'VM'
        };
    }

    function extraFieldsLink(scope, elem, attrs, editProductController){

    }

    function extraFieldsController(Product,$scope,$rootScope,Config,$timeout,BaseConfig,lo){
        $rootScope.$broadcast('module.loaded','productMediaFiles');
        var vm = this;
        vm.Product = {};
        vm.ExtraFields = Product.ExtraFields;
        $rootScope.$on('product.loaded',function(event,product){
            vm.Product = product;
        });

        vm.extraFieldValue = function(id){
            if (!vm.Product._id){
                return;
            }

            var field = lo.find(vm.Product.ExtraFields,{_id : id});
            if (!field){
                field = lo.find(vm.ExtraFields,{_id : id});
                field.value = '';
                vm.Product.ExtraFields.push(field);
                return lo.find(vm.Product.ExtraFields,{_id : id});
            }

            return field;
        };

    }


})();
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
(function(){
    angular.module('mcms.eshop.product')
        .controller('viewProductsCtrl',viewProductsCtrl);

    viewProductsCtrl.$inject = ['$rootScope','logger','pageTitle','eshop.productService','$timeout'];

    function viewProductsCtrl($rootScope,logger,pageTitle,eshopService,$timeout){
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
            return eshopService.getProducts({filters : vm.filters,page : page || 1 })
                .then(function(products){
                    vm.products = products.items;
                    vm.itemCount = products.itemCount;
                    vm.pagination = products.pagination;
                });
        }

        pageTitle.set('Products');

    }

})();
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
(function() {
    angular.module('mcms.eshop.orders')
        .directive('viewOrders', viewOrders);

    viewOrders.$inject = ['eshopConfig'];
    viewOrdersController.$inject = ['eshop.ordersService','$scope','$rootScope'
        ,'eshopConfig','$timeout','configuration','lodashFactory','eshop.productService'];


    function viewOrders(Config) {

        return {
            templateUrl: Config.appUrl + "Components/orders/viewOrders.directive.html",
            controller: viewOrdersController,
            scope: {
                filters : '=filters'
            },
            restrict : 'E',
            link : viewOrdersLink,
            controllerAs: 'VM'
        };
    }

    function viewOrdersLink(scope, elem, attrs, editProductController){

    }

    function viewOrdersController(Order,$scope,$rootScope,Config,$timeout,BaseConfig,lo,Product){
        var vm = this,
            timer = false;

        if (lo.isArray($scope.filters)){
            vm.filters = $scope.filters;
        }

        vm.filterItems = function(){
            if (timer){
                $timeout.cancel(timer);
            }

            timer = $timeout(function(){
                changePage(1);//reset page
            },500);
        };

        vm.statusCodes = Product.statusCodes;
        vm.Lang = BaseConfig.Lang;
        changePage(1);


        function changePage(page){
            //i need to send an object and not an array
            var toSend = {};
            for (var i in vm.filters){
                toSend[vm.filters[i].model] = vm.filters[i];
            }

            Order.all({filters: toSend, page: page || 1})
                .then(function (result) {
                    vm.Count = result.count.count;
                    vm.Orders = result.orders;
                    vm.pagination = result.pagination;
                });
        }
    }



})();
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
(function() {
    angular.module('mcms.eshop.categories')
        .directive('quickEditCategory', quickEditCategory);

    quickEditCategory.$inject = ['eshopConfig','$timeout'];

    function quickEditCategory(Config,$timeout) {
        return {
            require: "ngModel",
            templateUrl: Config.appUrl + "Components/categories/quickEditCategory.directive.html",
            scope: {
                model : '=ngModel',
                onSave : '&?callback',
                savedFlag : '=?saved'
            },
            restrict : 'E',
            link : quickEditCategoryLink
        };


        function quickEditCategoryLink(scope, elem, attrs){
            scope.uploadConfig = {
                url : Config.apiUrl + 'uploadCategoryImages',
                fields : {

                }
            };

            $('#quickEditCategory').on('show.bs.modal', function (e) {
                $timeout(function(){
                    scope.Category = scope.model;
                });

            });

            scope.Save = function(){
                scope.onSave({category : scope.Category});//callback to the caller
            };

        }
    }


})();