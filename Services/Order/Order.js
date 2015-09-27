module.exports = (function(App,Package){
    var defaultDB = App.Config.database.default,
        Connection = App.Connections[defaultDB];
    var privateMethods = {
            shippingMethods : require('./Helpers/private/shippingMethods')(App,Connection,Package),
            user : require('./Helpers/private/user')(App,Connection,Package),
            paymentMethods : require('./Helpers/private/paymentMethods')(App,Connection,Package)
        };



    return {
        name : 'Order',
        nameSpace : 'Order',
        findOne : require('./Helpers/findOne')(App,Connection,Package,privateMethods),
        find : require('./Helpers/find')(App,Connection,Package,privateMethods),
        create : require('./Helpers/create')(App,Connection,Package,privateMethods),
        complete : require('./Helpers/complete')(App,Connection,Package,privateMethods),
        update : require('./Helpers/update')(App,Connection,Package,privateMethods),
        applyDiscount : require('./Helpers/applyDiscount')(App,Connection,Package,privateMethods),
        notifyCustomer : require('./Helpers/notifyCustomer')(App,Connection,Package,privateMethods),
        notifyAdmin : require('./Helpers/notifyAdmin')(App,Connection,Package,privateMethods),
        changeOrderStatus : require('./Helpers/changeOrderStatus')(App,Connection,Package,privateMethods),
        reSendInvoice : require('./Helpers/reSendInvoice')(App,Connection,Package,privateMethods)

    };
});