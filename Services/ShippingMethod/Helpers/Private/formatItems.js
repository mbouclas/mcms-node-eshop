module.exports = (function(App,Connection,Package) {
    var Product = App.Connections.mongodb.models.Product,
        async = require('async'),
        lo = require('lodash');
    return function(items,callback){
        if (!lo.isArray(items) || items.length == 0){
            return callback(null,[]);
        }

        var itemsFound = [],
            toLookUp = [];
        //loop items to see if we got SKU's or ObjectId's
        items.forEach(function(item){
            //if String, we assume it is SKU
            if (lo.isString(item)){
                toLookUp.push(item);
            }
            else if (lo.isObject(item)){
                itemsFound.push(item);
            }
        });

        if (toLookUp.length == 0){
            return callback(null,itemsFound);//no lookup needed, return either any ObjectId's or empty array
        }

        Product.find({sku:{'$in' : toLookUp }})
            .select('_id')
            .exec(function(err,results){
                if (err || results.length == 0){
                    return callback(null,[]);
                }

                for (var a in results){
                    itemsFound.push(results[a]._id);
                }

                callback(err,itemsFound);
            });
    }
});