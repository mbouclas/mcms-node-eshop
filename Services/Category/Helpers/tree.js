module.exports = (function(App,Connection,Package,privateMethods){
    var Loader = require('mcms-node-eager-loader')();
    var async = require('async');
    var Model = Connection.models.ProductCategory;
    var lo = require('lodash');

    function tree(category,callback){
        var asyncObj = {};
        if (arguments.length == 1 && lo.isFunction(arguments[0])){//return the entire tree without search
            callback = arguments[0];
            Model.GetFullArrayTree(function (err, catTree) {
                if (err){
                    return callback(err);
                }

                return callback(null,catTree);
            });

            return;
        }

        Model.findOne(category,function(err,cat){
            if (err){
                return callback(err);
            }

            cat.getArrayTree(function(err,catTree){
                return callback(null,catTree);
            });

        });
    }

    return tree;
});