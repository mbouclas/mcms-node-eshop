module.exports = (function(App,Connection,Package,privateMethods){
    var async = require('async');
    var lo = require('lodash');
    var Relationships = Package.modelRelationships;
    var ProductModel = Connection.models.Product,
        CategoryModel = Connection.models.ProductCategory,
        returnObj = {},
        filters = {},
        Options = {},
        Aggregate = [],
        CommonAggregateQueries = [];
    var eagerLoader = require('mcms-node-eager-loader')(),
        Loader = new eagerLoader();

    function find(sku,options,callback){
        Options = options;
        var withRelations = [
                Relationships.thumb
            ];

        Loader.set(privateMethods).with(withRelations).
            exec(getItems.bind(null,sku),callback)
    }

    function getItems(sku,next){
        var sort = (Options.sort) ? Options.sort : 'created_at';
        var way = (Options.way) ? Options.way : '-';
        CommonAggregateQueries = [];
        var Query = [],
            tmpQuery = {};


        Query.push({'$match': {
            sku: { $in: [ new RegExp('^'+sku,'i')] }
        }
        });

        if (Options.exclude){
            if (!lo.isArray(Options.exclude)){
                Options.exclude = [Options.exclude];
            }

            Query.push({'$match': {
                _id: { $nin: App.Helpers.MongoDB.arrayToObjIds(Options.exclude) }
            }
            });
        }

        Query.push({'$match': {
            active: true
        }
        });
        Query.push({'$match': {
            "eshop.quantity": { $gt: 0 }
        }
        });



        Query.push({$project: { _id: 1, title : '$title', sku: 1,thumb:1,permalink:1 } });

        ProductModel.aggregate(Query)
            .sort(way + sort)
            .exec(function(err,items){
                next(err,items);
            });

    }

    return find;
});

