var ipn = require('paypal-ipn');
var async = require('async');

var OrderService = {},
    PaypalData = {};
module.exports = (function(App,Connection,Package,privateMethods){
    return function(params,sandbox,callback){
        OrderService = App.Services[Package.packageName].Order;
        App.LogPaypal.info('incoming IPN',params);

        ipn.verify(params, {'allow_sandbox': sandbox || false}, function(err, msg) {
            PaypalData = params;
            if (err){
                App.LogPaypal.error('IPN error',err);
                App.Event.emit('paypal.ipn.error',err,params);
                return callback(err);
            }

            //check the paypal status, if not success, throw an error
            if (params.payment_status !== 'Completed'){
                App.LogPaypal.error('IPN error','not completed');
                App.Event.emit('paypal.ipn.error','not completed',params);
                return callback('not completed');
            }

            var asyncArr = [
                findOrder.bind(null,params),
                updateOrder,
                broadCastEvents
            ];

            async.waterfall(asyncArr,function(error,results){
                if (error){
                    App.LogPaypal.error('IPN error',error);
                    return callback(error);
                }
                App.LogPaypal.info('IPN Success',results);
                callback(error,results);
            });

        });
    };


    function findOrder(orderData,next){
        OrderService.findOne({orderId : orderData.invoice, status : 1, email : orderData.payer_email},{},function(err,Order){
            if (err || !Order){
                return next('no order found');
            }

            next(null,Order);
        });
    }


    function updateOrder(Order,next){
        OrderService.update(Order._id,{status : 4},function(err){
            if (err) {
                return next(err);
            }
            Order.status = 3;
            next(null,Order);
        });
    }

    function broadCastEvents(Order,next){
        App.Event.emit('order.complete',Order);
        next(null,Order);
    }


});