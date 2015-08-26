module.exports = (function(App,Connection,Package,privateMethods){
    var orderModel = Connection.models.Order,
        shippingModel = Connection.models.ShippingMethod,
        paymentModel = Connection.models.PaymentMethod,
        userModel = Connection.models.User,
        lo = require('lodash');
    var async = require('async'),
        Options = {};

    function findOne(id,options,callback){
        Options = options;
        var asyncObj = {};

        if (!id){
            return callback('notValidOrderID');
        }
        var search = (lo.isObject(id)) ? id  : {orderId : id};//in case we need a where with the id
        orderModel.findOne(search)
            .exec(function(err,Order){
                if (!Order){
                    return callback('orderNotFound');
                }
                //now we just need to fill up the missing bits
                asyncObj.shippingMethod = getShipping.bind(null,Order.shippingMethod);
                asyncObj.paymentMethod = getPayment.bind(null,Order.paymentMethod);
                asyncObj.user = getUser.bind(null,Order.user);

                async.parallel(asyncObj,function(err,results){
                    if (err){
                        return callback(err);
                    }

                    callback(null,lo.merge(Order,results));
                });
            });
    }

    function getShipping(methodId,next){
        shippingModel.findById(methodId).exec(next);
    }

    function getPayment(methodId,next){
        paymentModel.findById(methodId).exec(next);
    }

    function getUser(uid,next){
        userModel.findById(uid).exec(next);
    }

    return findOne;
});