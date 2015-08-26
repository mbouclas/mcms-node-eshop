module.exports = (function(App,Connection,Package,privateMethods){
    var async = require('async');
    var lo = require('lodash');
    var Relationships = Package.modelRelationships;
    var ProductModel = Connection.models.Product,
        CategoryModel = Connection.models.ProductCategory,
        returnObj = {},
        filters = {},
        Options = {},
        Aggregate = [],
        CommonAggregateQueries = [];
    var eagerLoader = require('mcms-node-eager-loader')(),
        Loader = new eagerLoader();

    function find(catId,options,callback){
        var asyncArr = [];
        Options = options;
        var withRelations = [
                Relationships.thumb,
                Relationships.categories
            ];

        if (catId.permalink){
            asyncArr.push(getCategoryByPermalink.bind(null,catId.permalink));
        }
        //we need to calculate ALL queries based on productID's or based on the same aggregation query
        //so that the results will be in sync
        asyncArr.push(function(category,next){
            if (arguments.length == 1 && lo.isFunction(category)){//no permalink so everything is changed
                next = arguments[0];
                category = filters || {};
            }
            Loader.set(privateMethods).with(withRelations).
                exec(getItems.bind(null,category),next);
        });

        if (lo.isArray(options.with)){
            asyncArr.push(countItems);
            //asyncArr.push(extraFieldFilters);
        }


        async.waterfall(asyncArr,function(err,results){
            if (err){
                return callback(err);
            }
            callback(null,returnObj);
            returnObj = null;
        });
    }

    function getCategoryByPermalink(permalink,next){
        CategoryModel.findOne({permalink : permalink}).exec(function(err,category){
            if (!category){
                return next('noCategoryFound');
            }
            returnObj.category = category;
            next(null,category);
        });
    }

    function countItems(items,next){
        if (items.length == 0){
            returnObj.count =  0;

            return next(null,0);
        }

        var query = lo.clone(Aggregate);

        query.push({
            '$group': {
                _id: {
                    itemid: '$id'
                },
                "count": {"$sum": 1},
                minPrice : {$min:  '$eshop.price'},
                maxPrice : {$max:  '$eshop.price'}
            }
        });

        ProductModel.aggregate(query).exec(function(err,count){
            returnObj.count = count[0].count || 0;

            next(null,count[0].count || 0);
        });
    }

    function extraFieldFilters(items,next){
        if (!returnObj.category){
            returnObj.extraFieldFilters = [];
            return next(null,[]);
        }
        var category = returnObj.category.id;

        privateMethods.countExtraFields(CommonAggregateQueries,{},function(err,result){
            if (err) {
                return next(err);
            }

            returnObj.extraFieldFilters = result;
            next(null,result);
        });
    }

    function getItems(category,next){

        var page = Options.page || 1;
        var limit = Options.limit || 10;
        var sort = (Options.sort) ? Options.sort : 'created_at';
        var way = (Options.way) ? Options.way : '-';
        filters = (Options.filters) ? Options.filters : {};
        CommonAggregateQueries = [];
        var simplified = (Options.simplified) ? Options.simplified : false;
        var Query = [],
            tmpQuery = {};

        if (category && typeof category.id != 'undefined') {
            filters.categories = {
                type: 'equals',
                value: category.id || category['_id']
            };
            filters.categories.value = App.Helpers.MongoDB.idToObjId(filters.categories.value);
            tmpQuery = {
                '$match': {
                    categories: filters.categories.value
                }
            };
            Query.push(tmpQuery);
            CommonAggregateQueries.push(tmpQuery);
        }




        if (Options.active){
            tmpQuery = {'$match': {
                active: Options.active
            }
            };
            Query.push(tmpQuery);
            CommonAggregateQueries.push(tmpQuery);
        }

        if (Options.filters.ExtraFields && Options.filters.ExtraFields.length > 0){
            Query.push({'$unwind': '$ExtraFields'});
            var or = [];
            lo.forEach(Options.filters.ExtraFields,function(field){
                var and = [],
                    val = (!lo.isArray(field.values)) ? {'ExtraFields.value': field.values} : {'ExtraFields.value': {'$in': field.values}};

                and.push(val,{
                    'ExtraFields.fieldID': App.Helpers.MongoDB.idToObjId(field.fieldID)
                });

                or.push({
                    $and : and
                });
            });
            tmpQuery = {
                '$match': {
                    $or: or
                }
            };

            Query.push(tmpQuery);
            CommonAggregateQueries.push(tmpQuery);
        }

        if (filters && filters.categories){
               filters.categories.value = App.Helpers.MongoDB.idToObjId(filters.categories.value);
        }

        var searchFor = App.Helpers.MongoDB.setupFilters(filters);

        lo.forEach(searchFor,function(value,key){
            var q = {};
            q[key] = value;
            tmpQuery = {'$match': q};
            Query.push(tmpQuery);
            CommonAggregateQueries.push(tmpQuery);
        });

        filters = searchFor;

        ProductModel.aggregate(Query)
            .skip((page - 1) * limit)
            .limit(limit)
            .sort(way + sort)
            .exec(function(err,items){
                Aggregate = Query;
                returnObj.items = items;

                next(err,items);
            });

    }

    return find;
});

