module.exports = (function(App,Package){
    var defaultDB = App.Config.database.default,
        Connection = App.Connections[defaultDB],
        privateMethods = {
            countItems : require('./Helpers/Private/countItems')(App,Connection,Package)
        };


    var Category = {
        name : 'Category',
        nameSpace : 'Category',
        findOne : require('./Helpers/findOne')(App,Connection,Package,privateMethods),
        find : require('./Helpers/find')(App,Connection,Package,privateMethods),
        findOrCreate : require('./Helpers/findOrCreate')(App,Connection,Package,privateMethods),
        create : require('./Helpers/create')(App,Connection,Package,privateMethods),
        delete : require('./Helpers/delete')(App,Connection,Package,privateMethods),
        update : require('./Helpers/update')(App,Connection,Package,privateMethods),
        settings : require('./Helpers/settings')(App,Connection,Package,privateMethods)
    };

    Category.tree = require('./Helpers/tree')(App,Connection,Package,privateMethods,Category);

    return Category;
});