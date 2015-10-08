module.exports = (function(App,Connection,Package){
    var slug = require('slug'),
        lo = require('lodash');
//validate here
    return function(data){

        var Category = {
            category : data.category,
            permalink : slug(data.category,{lower: true}),
            description : data.description || '',
            description_long : data.description_long || '',
            active : data.active || false,
            orderBy : data.orderBy || false,
            uid : App.Helpers.MongoDB.idToObjId(data.uid),
            thumb : data.thumb || {},
            settings : data.settings || {}
        };


        return Category;
    }
});