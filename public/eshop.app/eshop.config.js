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
