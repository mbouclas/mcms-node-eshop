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
                console.log('sss')
                scope.onSave({category : scope.Category});//callback to the caller
            };

        }
    }


})();