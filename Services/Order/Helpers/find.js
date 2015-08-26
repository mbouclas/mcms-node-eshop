module.exports = (function(App,Connection,Package,privateMethods){
    var Model = Connection.models.Order,
        lo = require('lodash'),
        Options = {};
    var async = require('async');
    var eagerLoader = require('mcms-node-eager-loader')(),
        Loader = new eagerLoader();
    var Relationships = Package.modelRelationships;

    function find(query,options,callback){
        var asyncObj = {},
            Query = App.Helpers.MongoDB.queryComposer(query);
        Options = options;
        var withRelations = [];

        if (options.with && options.with.indexOf('payment') != -1){
            withRelations.push(Relationships.orderPayment)
        }

        if (options.with && options.with.indexOf('shipping') != -1){
            withRelations.push(Relationships.orderShipping)
        }

        if (options.with && options.with.indexOf('user') != -1){
            withRelations.push(Relationships.orderUser)
        }


        asyncObj.count = countItems.bind(null,Query);
        asyncObj.orders = function(next){
            Loader.set(privateMethods).with(withRelations).
                exec(getItems.bind(null,Query),next);
        };

        async.parallel(asyncObj,function(err,results){
           callback(null,results);
        });

    }

    function countItems(query,next){
        var Query = lo.clone(query);
        Query.push({
            '$group': {
                _id: {
                    orderId: '$id'
                },
                "count": {"$sum": 1}
            }
        });

        Model.aggregate(Query).exec(function(err,count){
            next(null,count[0] || 0);
        });
    }

    function getItems(Query,next){
        var page = Options.page || 1;
        var limit = Options.limit || 10;
        var sort =  Options.sort || 'created_at';
        var way =  Options.way  || '-';
        filters = Options.filters || {};

        var searchFor = App.Helpers.MongoDB.setupFilters(filters);

        lo.forEach(searchFor,function(value,key){
            var q = {};
            q[key] = value;
            tmpQuery = {'$match': q};
            Query.push(tmpQuery);
        });

        filters = searchFor;

        Model.aggregate(Query)
            .limit(limit)
            .skip((page - 1) * limit)
            .sort(way + sort)
            .exec(function(err,items){
                if (Options.sanitizeForAjax){
                    items = App.Helpers.MongoDB.sanitizeForAjax(items);
                }
                next(err,items);
            });
    }



    return find;
});