module.exports = (function(App,Connection,Package,privateMethods){
    var Model = Connection.models.Product,
        lo = require('lodash'),
        async = require('async');

    function update(id,data,callback){
        var product = privateMethods.formatItem(data);
        if (!lo.isObject(product)){
            return callback(product);//error
        }

        //we are not using update cause it does not fire Model setters and that is a deal breaker
        // here as we need get/set methods for the price
        Model.findOne({_id : App.Helpers.MongoDB.idToObjId(id)}).exec(function(err,Product){
            lo.merge(Product,product);
            Product.save(function(err){
                if (err) {
                    return callback(err);
                }

                App.Event.emit('cache.reset.object','products',id);
                callback(null, true);
            });
        });

/*        Model.update({_id : App.Helpers.MongoDB.idToObjId(id)},{$set : product},function (err) {
            if (err) {
                return callback(err);
            }

            App.Event.emit('cache.reset.object','products',id);
            callback(null, true);
        });*/

    }

    return update;
});