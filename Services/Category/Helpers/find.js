module.exports = (function(App,Connection,Package,privateMethods){
    var eagerLoader = require('mcms-node-eager-loader')(),
        Loader = new eagerLoader();
    var async = require('async');
    var Model = Connection.models.ProductCategory;
    var Relationships = Package.modelRelationships;
    var lo = require('lodash');

    function find(catID,options,callback){
        var asyncObj = {},
            attach = [];

        if (arguments.length == 2){
            callback = arguments[1];
        }

        if (options.with){

        }

        asyncObj.tree = function(next){
            Loader.set(privateMethods).with(attach).
                exec(getCategories.bind(null, catID,options),next);
        };

        async.parallel(asyncObj,function(err,results){
            if (err){
                return callback(err);
            }

            return callback(null,results.tree);
        });
    }

    function getCategories(args,options,callback){

        var query,
            searchBy = (typeof args == 'string') ? {_id : App.Helpers.MongoDB.idToObjId(args)} : args,
            ret = (!args.typeOfTree) ? 'getChildren' : args.typeOfTree,
            filters = {
                sort: { orderBy: 1 }
            };

        if (typeof args == 'string'){
            query = Model.findById(args);
        } else {
            query = Model.findOne(searchBy);
        }

        query
            .exec(function(err,Cat){
            if (err){
                console.log(err);
                return callback(err);
            }

            if (Cat == null){
                return callback('categoryNotFound');
            }

            Model.GetChildren(Cat.id,filters,function (err, tree) {

                if (options.with && options.with.indexOf('countItems') != -1){
                    return privateMethods.countItems(tree,{},function(err,itemCount){
                        if (err){
                            return callback(err);
                        }
                        if (!itemCount || itemCount == null) {
                            return callback(null,Model.ToArrayTree(tree));
                        }
                        //convert the tree to array in order to be writable (Mongoose objects are read-only)
                        callback(null,attachToTree(Model.ToArrayTree(tree),itemCount,Relationships.itemsCount));
                    });
                }

                return callback(null,Model.ToArrayTree(tree));
            });

        });
    }

    function attachToTree(tree,attachment,properties){

        var searchFor = {};

        lo.forEach(tree,function(cat){
            searchFor[properties.inject] = App.Helpers.MongoDB.idToObjId(cat[properties.onSource]);
            var count = lo.find(attachment,searchFor);
            cat[properties.as] = (count) ? count[properties.attachment] : 0;//find the object and pass just the value

            if (lo.isArray(cat.children) && cat.children.length > 0){
                attachToTree(cat.children,attachment,properties);
            }
        });

        return tree;
    }

    return find;
});