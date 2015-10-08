module.exports = (function(App,Connection,Package){
    var lo = require('lodash');
    return function(name,key,err,data){
        if (err){
            return;
        }

        if (!App.Cache) {
            App.Cache = {};
        }

        if (!key){
            App.Cache[name] = data;
            return;
        }

        if (!lo.isArray(data)){//we will add a single item to the existing cache tag
            App.Cache[name][key] = data;

            return;
        }

        var temp = {};
        for (var a in data){
            temp[data[a][key]] = data[a];
        }

        App.Cache[name] = temp;
    }
});