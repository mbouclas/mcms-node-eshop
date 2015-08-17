module.exports = (function(App,Package){
    var defaultDB = App.Config.database.default,
        Connection = App.Connections[defaultDB],
        privateMethods = {
        };



    return {
        name : 'Paypal',
        nameSpace : 'Paypal',
        ipnVerify : require('./Helpers/ipnVerify')(App,Connection,Package,privateMethods)
    };
});