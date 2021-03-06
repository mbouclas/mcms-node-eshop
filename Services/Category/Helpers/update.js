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
            for (var i in category){
                Category[i] = category[i];
            }

            Category.save(function(err,doc){
                if (err) {
                    return callback(err);
                }

                App.Event.emit('cache.replace.object','ProductCategories','permalink',data.permalink,doc);
                callback(null, doc);
            });
        });


    }

    return update;
});