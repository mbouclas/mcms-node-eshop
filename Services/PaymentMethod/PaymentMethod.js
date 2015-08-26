module.exports = (function(App,Package){
    var defaultDB = App.Config.database.default,
        Connection = App.Connections[defaultDB],
        privateMethods = {
            shipping : require('./Helpers/Private/shipping')(App,Connection,Package),
            processors : require('./Helpers/Private/processors')(App,Connection,Package)
        };



    return {
        name : 'PaymentMethod',
        nameSpace : 'PaymentMethod',
        findOne : require('./Helpers/findOne')(App,Connection,Package,privateMethods),
        find : require('./Helpers/find')(App,Connection,Package,privateMethods),
        create : require('./Helpers/create')(App,Connection,Package,privateMethods),
        update : require('./Helpers/update')(App,Connection,Package,privateMethods),
        applyDiscount : require('./Helpers/applyDiscount')(App,Connection,Package,privateMethods),
        sanitize : require('./Helpers/sanitize')(App,Connection,Package,privateMethods)
    };
});