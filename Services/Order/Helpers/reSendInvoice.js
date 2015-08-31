module.exports = (function(App,Connection,Package,privateMethods){
    var Model = Connection.models.Order,
        lo = require('lodash'),
        async = require('async');

    function reSendInvoice(id,callback){
        App.Services['mcmsNodeEshop'].Order.findOne({_id : id},{sanitizeForAjax:true,with:['payment']},function(err,Order){
            if (err){
                return callback(err);
            }

            App.Services['mcmsNodeEshop'].Order.notifyCustomer(Order,function(err,done){
                callback(null,true);
                Order = null;
            });

        });
    }

    return reSendInvoice;
});