module.exports = (function(App,Connection,Package){
    var lo = require('lodash');
    return function(thumb,callback){
        var ids = [];
        for (var i in thumb){
            if (thumb[i] == 'undefined' || typeof thumb[i] == 'undefined' || !thumb[i] || !thumb[i].id){
                continue;
            }
            ids.push(thumb[i]);
        }

        return App.Helpers.MongoDB.itemThumb(App.Connections[App.Config.database.default].models.ProductImage,ids,null,callback);
    }
});