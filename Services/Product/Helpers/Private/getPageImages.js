module.exports = (function(App,Connection,Package){
    return function(ids,callback){
        return App.Helpers.MongoDB.itemImages(App.Connections[App.Config.database.default].models.ProductImage,ids,{active : true},function(err,res){
            callback(null,res);
        });
    }
});