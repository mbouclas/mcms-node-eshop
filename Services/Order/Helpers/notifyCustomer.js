module.exports = (function(App,Connection,Package,privateMethods){
    var OrderModel = Connection.models.Order,
        UserModel = Connection.models.User;



    return notifyCustomer;

    function notifyCustomer(Order,callback){
        var Notification = {
            mailTemplate : selectEmailTemplate(),
            to : {
                email : Order.email,
                name : Order.orderInfo.firstName + ' ' + Order.orderInfo.lastName
            },
            subject : App.Lang.get('emails.orderStatusSubject.customer.' + selectStatusCode(Order.status),{orderID: Order.orderId}),
            data : {
                order : Order,
                Config : App.Config
            }
        };
        //we need a method pushNotificationToQueue
        App.Queue.put(Notification,function(err,jobID){

            App.Event.emit('order.customerNotified',jobID);
            if (callback){
                return callback(err,jobID);
            }
        });
    }

    function selectStatusCode(code){
        return App.Config.eshop.statusCodes[code];
    }

    function selectEmailTemplate(){
        return '';
    }
});