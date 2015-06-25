module.exports = (function(App,Connection,Package){
    var lo = require('lodash'),
        categoryModel = App.Connections[App.Config.database.default].models.ProductCategory,
        productModel = App.Connections[App.Config.database.default].models.Product,
        ids = [];

    return function(catIds,options,callback){
        if (lo.isObject(catIds[0])){
            for (var a in catIds){
                ids.push(catIds[a].id);
            }
            catIds = ids;
        }

        ids = lo.uniq(lo.flatten(catIds));

        ids = App.Helpers.MongoDB.arrayToObjIds(ids);
        //aggregate to get counts per category
        productModel.aggregate([
            {$match: { categories: { $in: ids } } },
            {$project: { _id: 0, id : '$_id', categories: 1 } },
            {$unwind: "$categories" },
            {$match: { categories: { $in: ids } } },
            {
                $group: {
                    _id: {
                        items: '$id', categories: '$categories'
                    },
                    "count": {"$sum": 1}
                }
            },
            {
                $group: {
                    _id: {
                        items: '$_id.categories'
                    },
                    "count": {"$sum": 1}
                }
            },
            {$project: { _id: 0,categories: "$_id.items", count: 1 } }
        ])
            .exec(callback);
    };

});