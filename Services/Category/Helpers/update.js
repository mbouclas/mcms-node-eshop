module.exports = (function(App,Connection,Package,privateMethods){
    var Model = Connection.models.ProductCategory,
        lo = require('lodash'),
        async = require('async');

    function update(id,data,callback){
        var category = privateMethods.formatItem(data);
        if (!lo.isObject(category)){
            return callback(category);//error
        }

        //we are not using update cause it does not fire Model setters and that is a deal breaker
        // here as we need get/set methods for the price
        Model.findOne({_id : App.Helpers.MongoDB.idToObjId(id)}).exec(function(err,Category){
            lo.merge(Category,category);
            Category.save(function(err){
                if (err) {
                    return callback(err);
                }

                App.Event.emit('cache.reset.object','categories',id);
                callback(null, true);
            });
        });


    }

    return update;
});