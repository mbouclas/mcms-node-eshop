module.exports = (function(App,Package){
    var defaultDB = App.Config.database.default,
        Connection = App.Connections[defaultDB],
        privateMethods = {

        };


    var Service = {
        name : 'Cart',
        nameSpace : 'Cart',
        toCart : require('./Helpers/productToCartFormat')(App,Connection,Package,privateMethods),
        applyCouponToCart : require('./Helpers/applyCouponToCart')(App,Connection,Package,privateMethods),
        removeCoupon : require('./Helpers/removeCoupon')(App,Connection,Package,privateMethods)

    };

    return Service;
});