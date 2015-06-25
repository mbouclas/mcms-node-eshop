module.exports = (function(App,Connection,Package,privateMethods){
    var eagerLoader = require('mcms-node-eager-loader')(),
        Loader = new eagerLoader();
    var async = require('async');
    var Model = Connection.models.Product,
        lo = require('lodash'),
        Options = {};

    function findOne(productID,options,callback){
        var asyncObj = {},
            Relationships = Package.modelRelationships,
            withRelations = [
                Relationships.categories,
                Relationships.related,
                Relationships.images,
                Relationships.ExtraFields,
                Relationships.thumb
            ];
        Options = options;

        if (arguments.length == 2){
            callback = arguments[1];
        }

        if (typeof options.withRelations != 'undefined'){
            withRelations = options.with;
        }



        asyncObj.product = function(next){
            Loader.set(privateMethods).with(withRelations).
                exec(getProduct.bind(null, productID,null),next);
        };

        async.parallel(asyncObj,function(err,results){
            if (err){
                return callback(err);
            }

            if (!options.with || !results.product){
                return callback(null,results);

            }

            async.parallel({
                relatedSku : function(cb){
                    var tmp = results.product.sku.split('_');
                    Package.services.Product.relatedSku(tmp[0],{exclude:results.product._id},cb);
                }
            },function(errors,done){
                return callback(null,lo.merge(results,done));
            });
        });
    }

    function getProduct(args,options,callback){
        var query,
            searchBy = (typeof args == 'string') ? {_id : App.Helpers.MongoDB.idToObjId(args)} : args;

        if (typeof args == 'string'){
            query = Model.findById(args);
        } else {
            query = Model.findOne(searchBy);
        }

        query.exec(function(err,product){
            if (err){
                console.log(err);
                return callback(err);
            }

            if (product == null){
                return callback('productNotFound');
            }
            if (Options.applyDiscounts){
                Package.services.Discount.applyDiscount(product);
            }

            return callback(null,product);
        });
    }

    function findById(id,options,callback) {
        Model.findById(id).exec(function(err,product){
            if (err){
                return callback(err);
            }


            return callback(err,product);
        });
    }

    return findOne;
});