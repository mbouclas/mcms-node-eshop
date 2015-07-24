module.exports = (function(App,Connection,Package){
    var eagerLoader = require('mcms-node-eager-loader')(),
        Loader = new eagerLoader();
    return function(ids,callback) {
        var privateMethods =
            {
                getPageThumb : require('./getPageThumb')(App,Connection,Package)
            },
            Relationships = Package.modelRelationships,
            withRelations = [
                Relationships.thumb
            ];

        Loader.set(privateMethods).with(withRelations).
            exec(function(next){
                App.Connections[App.Config.database.default].models.Product.where('_id')
                    .in(App.Helpers.MongoDB.arrayToObjIds(ids))
                    .exec(function(err,results){
                        if (err){
                            return callback(err);
                        }

                        results.forEach(function(product){
                            Package.services.Discount.applyDiscount(product);
                        });

                        next(null,results);
                    });
            },callback);


    }
});