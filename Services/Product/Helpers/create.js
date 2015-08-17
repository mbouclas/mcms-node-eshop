module.exports = (function(App,Connection,Package,privateMethods){
    var Model = Connection.models.Product,
        lo = require('lodash'),
        async = require('async');

    function create(data,callback){
        var product = privateMethods.formatItem(data);
        if (!lo.isObject(product)){
            return callback(product);//error
        }

        var asyncArr = [
            checkForExistingPermalink.bind(null,product),
            saveProduct
        ];

        async.waterfall(asyncArr,callback);

    }

    function checkForExistingPermalink(data,next){
        Model.findOne({permalink:data.permalink}).exec(function(err,res){
            if (res){
                return next('permalinkExists');
            }

            next(null,data);
        });
    }

    function saveProduct(data,next){
        new Model(data).save(function (err, product) {
            if (err) {
                return next(err);
            }

            next(null, product);
        });
    }

    return create;
});