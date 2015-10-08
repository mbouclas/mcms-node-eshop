module.exports = (function(App,Package){
    var defaultDB = App.Config.database.default,
        Connection = App.Connections[defaultDB],
        privateMethods = {
            addToCache : require('./Helpers/Private/addToCache')(App,Connection,Package)
        };



    return {
        name : 'Cache',
        nameSpace : '',
        addModelsToCache : require('./Helpers/addModelsToCache')(App,Connection,Package,privateMethods),
        replaceItem : require('./Helpers/replaceItem')(App,Connection,Package,privateMethods)
    };
});