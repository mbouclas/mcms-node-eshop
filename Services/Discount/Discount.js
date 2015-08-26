module.exports = (function(App,Package){
    var defaultDB = App.Config.database.default,
        Connection = App.Connections[defaultDB],
        privateMethods = {
            formatItems : require('./Helpers/Private/formatItems')(App,Connection,Package),
            addItemsToDiscount : require('./Helpers/Private/addItemsToDiscount')(App,Connection,Package),
            removeItemsFromDiscount : require('./Helpers/Private/removeItemsFromDiscount')(App,Connection,Package),
            discountItemTemplate : require('./Helpers/Private/discountItemTemplate')(App,Connection,Package)
        };



    return {
        name : 'Discount',
        nameSpace : 'Discount',
        findOne : require('./Helpers/findOne')(App,Connection,Package,privateMethods),
        find : require('./Helpers/find')(App,Connection,Package,privateMethods),
        create : require('./Helpers/create')(App,Connection,Package,privateMethods),
        update : require('./Helpers/update')(App,Connection,Package,privateMethods),
        applyDiscount : require('./Helpers/applyDiscount')(App,Connection,Package,privateMethods)
    };
});