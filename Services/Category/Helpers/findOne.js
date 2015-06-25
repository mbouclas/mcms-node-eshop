module.exports = (function(App,Connection,Package,privateMethods){
    var Loader = require('mcms-node-eager-loader')();
    var async = require('async');
    var Model = Connection.models.ProductCategory;

    function findOne(category,withRelationship,callback){
        var asyncObj = {},
            Relationships = Package.modelRelationships;

        if (arguments.length == 2){
            callback = arguments[1];
        }

        asyncObj.product = function(next){
            Loader.set(Products).with([
                Relationships.categories,
                Relationships.ExtraFields,
                Relationships.upselling,
                Relationships.related,
                Relationships.thumb,
                Relationships.images
            ]).
                exec(Products.findOne.bind(null, req.body.productID,null),next);
        };

        Model.findOne(category,function(err,result){
            callback(null,result);
        });
    }

    return findOne;
});