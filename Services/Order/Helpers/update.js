module.exports = (function(App,Connection,Package,privateMethods){
    var Model = Connection.models.Order,
        lo = require('lodash'),
        async = require('async');

    function update(id,data,callback){
        if (!lo.isObject(data)){
            return callback(data);//error
        }

        Model.update({_id : App.Helpers.MongoDB.idToObjId(id)},{$set : data},function (err) {
            if (err) {
                return callback(err);
            }
            App.Event.emit('cache.reset.object','products',id);
            callback(null, true);
        });

    }

    return update;
});