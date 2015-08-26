module.exports = (function(App,Connection,Package,privateMethods){
    var OrderModel = Connection.models.Order,
        UserModel = Connection.models.User,
        async = require('async'),
        moment = require('moment'),
        lo = require('lodash'),
        Calculator = {
            orderTotal : orderTotal,
            calculatePaymentMethodExtraCharge : calculatePaymentMethodExtraCharge,
            cart : {}
        };

    function create(orderData,User,callback){
        var orderID = moment().unix(),
            Shipping = lo.find(App.Cache.ShippingMethods,{permalink:orderData.shipping.permalink}),
            Payment = lo.find(App.Cache.PaymentMethods, {id : orderData.payment.id }),
            userInfo = {},
            orderDetails = {};
            //Mind for coupons and discounted products
        if (!Shipping || !Payment){
            return callback('not enough data');
        }

        Calculator.cart = App.Cart.fullCart();

        if (!Calculator.cart){
            return callback('noCart');
        }
        Calculator.selectedShippingMethod = Shipping;
        Calculator.selectedPaymentMethod = Payment;

        userInfo = App.Helpers.MongoDB.sanitizeInput(orderData.user.settings.profile);

        if (Calculator.cart.coupon){
            orderDetails.couponUsed = Calculator.cart.coupon;
        }

        var Order = {
            orderId : orderID,
            email: User.email,
            status : 1,
            amount : Calculator.orderTotal(),
            paymentMethod : App.Helpers.MongoDB.idToObjId(Payment.id),
            shippingMethod : App.Helpers.MongoDB.idToObjId(Shipping.id),
            notes : orderData.notes,
            orderDetails: orderDetails,
            orderInfo: userInfo,
            archive : false,
            ipAddress : orderData.ipAddress,
            user : App.Helpers.MongoDB.idToObjId(User.uid),
            items : Calculator.cart.items
        };



        var asyncObj = {
            order : function(next){
                OrderModel.create(Order,function(err,newOrder){
                    if (err){
                        return next(err);
                    }

                    next(null,newOrder);
                });
            },
            user : function(next){
                UserModel.update({ _id: User.uid }, { 'settings.profile': userInfo }, next);
            }
    };

        async.parallel(asyncObj,function(err,results){
            if (err){
                return callback(err);
            }
            //Mail is not my responsibility. So push the order as an event
            //and hope that someone will pick it up

            App.Event.emit('order.created',results.order);//This should go to the complete order
            callback(null,orderID);
        });




    }

    function orderTotal() {
        var total = 0;
        this.subTotal = this.cart.subTotal;
        this.selectedPaymentMethod.extraCharges = this.calculatePaymentMethodExtraCharge();

        total += this.subTotal + this.selectedShippingMethod.baseCost;
        total += (this.selectedPaymentMethod.surchargeType == '%')  ?
            this.selectedPaymentMethod.extraCharges : parseFloat(this.selectedPaymentMethod.surcharge);

        return total;
    }

    function calculatePaymentMethodExtraCharge(){
        return  (parseFloat(this.selectedPaymentMethod.surcharge)/100)*this.subTotal;
    }

    return create;
});