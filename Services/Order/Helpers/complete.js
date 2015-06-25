module.exports = (function(App,Connection,Package,privateMethods) {

    return function(id,callback){
        var OrderModel = Connection.models.Order;
        if (!id){
            return callback('notValidOrderID');
        }

        Package.services.Order.findOne(id,{},function(err,Order){
            if (err || !Order){
                return callback('orderNotFound');
            }
            //clear cart
            App.Cart.clear();
            //update order status
            Order.status = 4;
            OrderModel.update({_id : Order.id},{status:4},function(err){
                if (err){
                    console.log(err);
                }
                //emit completion event
                App.Event.emit('order.complete',Order);

                callback(null,'done');
            });

        });


    }

});