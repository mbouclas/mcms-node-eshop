module.exports = (function(App,Connection,Package){
    var slug = require('slug');
//validate here
    return function(data){
        var base = (data.sku) ? data.sku.split('_') : '',
            baseSku = base[0] || '';

        var product = {
            title : data.title,
            sku : data.sku,
            baseSku : baseSku,
            permalink : slug(data.title,{lower: true}),
            description : data.description || '',
            description_long : data.description_long || '',
            active : data.active || false,
            uid : App.Helpers.MongoDB.idToObjId(data.uid),
            categories : [],
            ExtraFields : [],
            mediaFiles : data.mediaFiles || {
                images : [],
                documents : [],
                videos : []
            },
            thumb : data.thumb || {},
            related : [],
            upselling : [],
            productOptions : {}
        };

        if (!data.categories || data.categories.length == 0){
            return 'noCategories';
        }

        for (var i in data.categories){
            product.categories.push(App.Helpers.MongoDB.idToObjId(data.categories[i]._id));
        }

        return product;
    }
});