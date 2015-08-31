module.exports = (function(App,Connection,Package,privateMethods){
    var Model = Connection.models.Order,
        lo = require('lodash'),
        async = require('async');

    function changeOrderStatus(id,status,callback){
        var asyncArr = [
            update.bind(null,id,status),
            get,
            emitEvent
        ];

        async.waterfall(asyncArr,function(err,results){
            if (err) {
                return callback(err);
            }

            callback(null, true);
        });
    }

    function update(id,status,next){
        Model.update({_id : App.Helpers.MongoDB.idToObjId(id)},{$set : {status : parseInt(status)}},function (err) {
            if (err) {
                return next(err);
            }

            next(null, id);
        });

    }

    function get(id,next){
        var query = {_id : id};
        App.Services['mcmsNodeEshop'].Order.findOne(query,{sanitizeForAjax:true,with:['payment']},function(err,result){
            if (err){
                return next(err);
            }

            next(null,result);
        });
    }

    function emitEvent(Order,next){
        App.Services['mcmsNodeEshop'].Order.notifyCustomer(Order,next);
        Order = null;
    }
    return changeOrderStatus;
});