module.exports = (function(App,Connection,Package,privateMethods){
    var lo = require('lodash');
    var exclude = ['__v','_id','updated_at','created_at'];

    return function(data,exclude){
        if (lo.isArray(data)){
            processArray(data);
        } else {
            sanitize(data);
        }

        return data;
    };

    function processArray(data){
        for (var i in data){
            data[i] = sanitize(data[i]);
        }

        return data;
    }

    function sanitize(data){
        for (var key in data){
            if (exclude.indexOf(key) != -1){
                delete data[key];
            }

            if (lo.isObject(data[key])){
                sanitize(data[key]);
            }

            if (lo.isArray(data[key])){
                processArray(data);
            }
        }

        return data;
    }
});