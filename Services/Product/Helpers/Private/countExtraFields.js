module.exports = (function(App,Connection,Package) {
    var lo = require('lodash'),
        async = require('async'),
        ExtraFieldsModel = App.Connections[App.Config.database.default].models.ExtraField,
        productModel = App.Connections[App.Config.database.default].models.Product;

    return function(catId,options,callback){
        var asyncArr = [
            getCounts.bind(null,catId,options),
            getFieldDetails,
            mergeResults
        ];

        async.waterfall(asyncArr,function(err,results){
            if (err){
                return callback(err);
            }

            callback(null,results);
        });
    };

    function getCounts(Filters,options,next){

        var query = (lo.isArray(Filters)) ? Filters : [];


        if (options.itemIds){
            var itemIds = (!lo.isArray(options.itemIds)) ? [options.itemIds] : options.itemIds;
            query.push({'$match': {'_id' : {'$in': App.Helpers.MongoDB.arrayToObjIds(itemIds)}}});
        }

        query.push({'$unwind': '$ExtraFields'});
        query.push({$project: { _id: 0, id : '$_id', ExtraFields: 1 } });

        if (options.ExtraFields){
            var Efields = (!lo.isArray(options.ExtraFields)) ? [options.ExtraFields] : options.ExtraFields;
            query.push({'$match': {'ExtraFields.fieldID' : {'$in': Efields}}});
        }

        query.push({'$group':{
            _id: {
                itemid : '$id', value : '$ExtraFields.value', fieldID : '$ExtraFields.fieldID'
            }
        }
        });

        query.push( {'$group':{
            _id: {
                values : '$_id.value', fieldID : "$_id.fieldID"
            }
            ,"count": { "$sum": 1 }
        }
        });

        productModel.aggregate(query)
            .exec(function(err,counts){
                if (err){
                    return next(err);
                }

                return next(null,counts);
            });
    }

    function getFieldDetails(counts,next){
        var ids = [],
            simplified = [];
        for (var a in counts){
            ids.push(counts[a]._id.fieldID);
            simplified.push(lo.merge(counts[a]._id,{count : counts[a].count}));//the aggregated object is a mess, fix it
        }

        ExtraFieldsModel.where('_id').in(lo.uniq(ids)).lean().exec(function(err,fields){
            if (err){
                return next(err);
            }

            next(null,simplified,fields);
        });

    }

    function mergeResults(counts,fields,next){
        var groupedFields = {},
            map = {};
        lo.forEach(fields,function(field){
            if (!lo.isObject(groupedFields[field.varName])){
                groupedFields[field.varName] = field;
                groupedFields[field.varName].values = [];
                map[field._id] = field.varName;//use it on the second loop
            }
        });

        lo.forEach(counts,function(item){
            var fieldPointer = map[item.fieldID];
            if (groupedFields[fieldPointer]){
                groupedFields[fieldPointer].values.push(item);
            }

        });

        next(null,groupedFields);
    }
});