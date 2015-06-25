module.exports = (function(App,Package){
    var defaultDB = App.Config.database.default,
        Connection = App.Connections[defaultDB],
        privateMethods = {

        };



    return {
        name : 'Cache',
        nameSpace : '',
        addModelsToCache : require('./Helpers/addModelsToCache')(App,Connection,Package,privateMethods),
    };
});