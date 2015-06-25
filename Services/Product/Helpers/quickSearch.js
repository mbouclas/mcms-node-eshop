module.exports = (function(App,Connection,Package,privateMethods){
    var ProductModel = Connection.models.Product,
        eagerLoader = require('mcms-node-eager-loader')(),
        Loader = new eagerLoader(),
        Options = {};

    return function(query,options,callback){
        Options = options;
        var Relationships = Package.modelRelationships;

        var withRelations = [
            Relationships.thumb
        ];

        Loader.set(privateMethods).with(withRelations).
            exec(getItems.bind(null,query),callback);
    };

    function getItems(query,next){
        var limit = Options.limit || 10;
        var sort = (Options.sort) ? Options.sort : 'title';
        var way = (Options.way) ? Options.way : '+';
        var Query = {$or : []};

        Query.$or.push({sku : new RegExp('.*'+query+'.*','i')});
        Query.$or.push({title : new RegExp('.*'+query+'.*','i')});

        ProductModel.find(Query).limit(limit).sort(way + sort).exec(function(err,items){
            if (err){
                return next(err);
            }
            next(null,items);
        });
    }

});