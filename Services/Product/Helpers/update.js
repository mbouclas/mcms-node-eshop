module.exports = (function(App,Connection,Package,privateMethods){
    var Model = Connection.models.Product,
        lo = require('lodash'),
        async = require('async');

    function update(id,data,callback){
        var page = privateMethods.formatItem(data);
        if (!lo.isObject(page)){
            return callback(page);//error
        }

        Model.update({_id : App.Helpers.MongoDB.idToObjId(id)},{$set : page},function (err) {
            if (err) {
                return callback(err);
            }
            App.Event.emit('cache.reset.object',Package.packageName,id);
            callback(null, true);
        });

    }

    return update;
});