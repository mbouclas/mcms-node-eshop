module.exports = (function(App,Connection,Package,privateMethods){
    var OrderModel = Connection.models.Order,
        UserModel = Connection.models.User;



    return notifyAdmin;

    function notifyAdmin(Order,callback){
        var Notification = {
            mailTemplate : selectEmailTemplate(),
            to : {
                email : App.Config.mail.admin.email,
                name : App.Config.mail.admin.name
            },
            subject : App.Lang.get('emails.orderStatusSubject.admin.' + selectStatusCode(Order.status),{orderID: Order.orderId}),
            data : {
                order : Order
            }
        };
        //we need a method pushNotificationToQueue
        App.Queue.put('orderNotificationDispatcher',Notification,function(err,jobID){
            App.Event.emit('order.adminNotified',jobID);
            if (callback){
                return callback(err,jobID);
            }
        });
    }

    function selectStatusCode(code){
        return App.Config.eshop.statusCodes[code];
    }

    function selectEmailTemplate(status){
        return 'admin'+App.Config.eshop.statusCodes[status];
    }
});