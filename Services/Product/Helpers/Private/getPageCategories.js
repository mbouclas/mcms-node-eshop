module.exports = (function(App,Connection,Package){
    var lo = require('lodash'),
        categoryModel = App.Connections[App.Config.database.default].models.ProductCategory;

    return function(catIds,options,callback){

        var ids = lo.uniq(lo.flatten(catIds));

        ids = App.Helpers.MongoDB.arrayToObjIds(ids);

        categoryModel.where('_id').in(ids).exec(callback);
    };

});