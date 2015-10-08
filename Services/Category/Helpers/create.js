module.exports = (function(App,Connection,Package,privateMethods){
    var Model = Connection.models.ProductCategory,
        lo = require('lodash'),
        async = require('async');

    function create(parent,data,callback){
        var category = privateMethods.formatItem(data);
        if (!lo.isObject(category)){
            return callback(category);//error
        }

        var asyncArr = [
            checkForExistingPermalink.bind(null,category,parent),
            findParent,
            saveProduct
        ];

        async.waterfall(asyncArr,callback);

    }

    function checkForExistingPermalink(data,parent,next){
        Model.findOne({permalink:data.permalink}).exec(function(err,res){
            if (res){
                return next('permalinkExists');
            }

            next(null,parent,data);
        });
    }

    function findParent(parent,data,next){
        Model.findOne({permalink:parent}).exec(function(err,parentCategory){
            if (!parentCategory){
                return next('noParentFound');
            }

            next(null,parentCategory,data);
        });
    }

    function saveProduct(Parent,data,next){
        Parent.appendChild(data,next);
    }

    return create;
});