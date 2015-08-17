module.exports = (function(App,Connection,Package){
    var slug = require('slug'),
        lo = require('lodash');
//validate here
    return function(data){
        var base = (data.sku) ? data.sku.split('_') : '',
            baseSku = base[0] || '';

        if (data.thumb){//sanitize input coming from the admin ui
            var tempThumb = lo.clone(data.thumb);
            data.thumb = {
                id : App.Helpers.MongoDB.idToObjId(tempThumb.id),
                title : tempThumb.title || '',
                alt : tempThumb.alt || ''
            };
        }

        if (data.mediaFiles && lo.isArray(data.mediaFiles.images)){//sanitize images
            var tempImages = lo.clone(data.mediaFiles.images);
            data.mediaFiles.images = [];
            for (var i in tempImages){
                data.mediaFiles.images.push({
                    id : App.Helpers.MongoDB.idToObjId(tempImages[i].id),
                    title : tempImages[i].title || '',
                    alt : tempImages[i].alt || '',
                    orderBy : tempImages[i].orderBy || i,
                    active : tempImages[i].active || false
                });
            }
        }

        if (data.ExtraFields) {//sanitize extraFields
            var tempExtraFields = lo.clone(data.ExtraFields);
            data.ExtraFields = [];
            for (var i in tempExtraFields){
                data.ExtraFields.push({
                    fieldID : App.Helpers.MongoDB.idToObjId(tempExtraFields[i]._id),
                    value : tempExtraFields[i].value
                });
            }
        }

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
            ExtraFields : data.ExtraFields || [],
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