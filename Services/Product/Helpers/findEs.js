/*
* 1. grab permalink from mongo
* 2. perform the query on ES
* 3. eager load (or just loop) the results to replace ID's with actual objects
* 4. return
* */

module.exports = (function(App,Connection,Package,privateMethods){
    var async = require('async');
    var lo = require('lodash');
    var Relationships = Package.modelRelationships;
    var ProductModel = Connection.models.Product,
        ExtraFieldsModel = App.Connections[App.Config.database.default].models.ExtraField,
        CategoryModel = Connection.models.ProductCategory,
        Options = {},
        relatedSkus = [],
        Filters = {},
        returnObj;
    var eagerLoader = require('mcms-node-eager-loader')(),
        Loader = new eagerLoader(),
        ES = App.Connections.elasticSearch,
        Cache = App.Cache;

    function find(filters,options,callback){
        var asyncArr = [];
        Options = options,
            withRelations = [
                Relationships.thumb
            ];

        if (typeof filters.permalink != 'undefined' && !lo.isObject(filters.permalink)){
            asyncArr.push(getCategoryByPermalink.bind(null,filters.permalink));
        }

        asyncArr.push(function(category,next){
            if (arguments.length == 1 && lo.isFunction(category)){//no permalink so everything is changed
                next = arguments[0];
                category = filters || {};
            }
            Loader.set(privateMethods).with(withRelations).
                exec(getItems.bind(null,category),next);
        });


        async.waterfall(asyncArr,function(err,results){
            if (err){
                console.log('ERR:',err);
                return callback(err);
            }

            returnObj.items = results;

            //lets complicate things a bit. If we want the related SKU's, we need to go and execute a brand new async - eager load round
            if (!Options.with || Options.with.indexOf('relatedSku') == -1){
                return callback(null,returnObj);
            }

            async.waterfall([
                groupSku.bind(null,returnObj.items),
                fetchSku,
                mergeResults
            ],function(errors,final){
                //so.... now the aggregated array (relatedSkus) is ready. It contains the products in their final form (thumbs and all).
                //What we need to do now is iterate the ES results and add as an array all of the found items.
                // The way to do this is to compare the baseSku from the aggregated array to the one in our ES results.
                //mind fuck intensifies....
                returnObj.items.forEach(function(product){
                    var found = lo.find(final,{baseSku : product.baseSku});
                    if (found){
                        product.relatedSkus = {count : found.count,items : found.items};
                        var me = lo.find(product.relatedSkus.items,{sku : product.sku});
                        if (me){//remove my self from the counts
                            product.relatedSkus.items.splice(product.relatedSkus.items.indexOf(me),1);
                            product.relatedSkus.count = product.relatedSkus.items.length;//update counts
                        }
                    }
                });
                callback(null,returnObj);
            });
        });
    }

    function getCategoryByPermalink(permalink,next){
        CategoryModel.findOne({permalink : permalink}).exec(function(err,category){
            if (!category){
                return next('noCategoryFound');
            }

            next(null,category);
        });
    }

    function getItems(queryFilters,next){
        var page = Options.page || 1;
        var limit = Options.limit || 10;
        var priceRangeInterval = Options.priceRangeInterval || 40;
        var priceRangeSteps = Options.priceRangeSteps || 4;
        var sort = {},
            active = [],
            ranges = [],
            sortField = (Options.sort) ? Options.sort : 'created_at',
            activeField = (Options.active) ? Options.active : true;
        var way = (Options.way) ? Options.way : 'desc';
        Filters = (Options.filters) ? Options.filters : {};
        sort[sortField] = {
            order : way
        };

        var simplified = (Options.simplified) ? Options.simplified : false;
        active.push(activeField);
        var Query = {
            bool : {
                must : {
                    terms : {active : active}
                },
                should : [],
                minimum_should_match : 9999
            }
        };

        for (var i = 0;priceRangeSteps > i;i++){
            var tmp = {},
                last = 0;
            if (i == 0){
                ranges.push({
                    to : priceRangeInterval
                });
                continue;
            }
            if (i == priceRangeSteps-1){
                ranges.push({from : (priceRangeInterval*priceRangeSteps)+1});
                continue;
            }

            ranges.push({
                from : (priceRangeInterval*i),
                to : (priceRangeInterval*(i+1))-1
            })

        }

        var Aggregations = {
            categories : {
                "terms": {
                    "field": "categories"
                }
            },
            ExtraFields : {
                "nested": {
                    "path": "ExtraFields"
                },
                "aggs": {
                    "fields": {
                        "terms": {
                            "field": "ExtraFields.fieldID",
                            "size" : 0
                        },
                        "aggs": {
                            "values": {
                                "terms": {
                                    "field": "ExtraFields.value",
                                    "size" : 0,
                                    "order": {
                                        "_count" : "desc"
                                    }
                                }
                            }
                        }
                    }
                }
            },
            priceRange : {
                "histogram" : {
                    "field" : "eshop.price",
                    "interval" : priceRangeInterval
                }
            },
            prices : { "stats" : { "field" : "eshop.price" } },
            priceRanges : {
                "range" : {
                    "field" : "eshop.price",
                    "ranges" : ranges
                }
            }
        };

        //Filter by category

        if (queryFilters && typeof queryFilters.id != 'undefined'){
            Query.bool.should.push({terms : {categories : [queryFilters.id || queryFilters['_id']]} });
        }
        Query.bool.should.push({"range": {"eshop.quantity": {"gte": 0}}});
        Query.bool.should.push({terms : {active : active} });

        if (queryFilters.q){
            var fuzzyQuery = {
                "multi_match": {
                    "query": queryFilters.q,
                    "fields": [
                        "title",
                        "sku"
                    ],
                    "type": "phrase_prefix"
                }
            };
            Query.bool.should.push(fuzzyQuery);
        }
        if (Options.filters.category){
            Query.bool.should.push({terms : {categories : [Options.filters.category]} });
        }

        if (Options.filters.ExtraFields && Options.filters.ExtraFields.length > 0){

            lo.forEach(Options.filters.ExtraFields,function(field){
                var tmp = {
                    nested : {
                        path : "ExtraFields",
                        score_mode : "none",
                        query : {
                            bool : {
                                must : []
                            }
                        }
                    }
                };

                var val = (!lo.isArray(field.values)) ? [field.values] : field.values;
                tmp.nested.query.bool.must.push({
                    terms : {"ExtraFields.value" : val}
                });

                tmp.nested.query.bool.must.push({
                    match : {"ExtraFields.fieldID": field.fieldID}
                });
                Query.bool.should.push(tmp);

            });
        }

        if (Options.filters.price){
            Query.bool.should.push({"range": {"eshop.price": {"gte": Options.filters.price.from}}});
            Query.bool.should.push({"range": {"eshop.price": {"lte": Options.filters.price.to}}});
        }

        var toExecute = {
            primary : {
                index : 'products',
                body: {
                    query : Query,
                    aggregations : Aggregations
                },
                size : limit,
                from : ((page - 1) * limit),
                sort : sortField+':'+way
            },
            secondary : {
                size : limit,
                from : ((page - 1) * limit)
            }
        };

        if (Options.debug){
            console.log(JSON.stringify(toExecute.primary.body),'\n',JSON.stringify(toExecute.secondary));
        }

        ES.search(toExecute.primary,toExecute.secondary).then(function(results){
            var items = (results.hits.count == 0) ? [] : results.hits.hits;

            returnObj = {
                category : (queryFilters.id || queryFilters['_id']) ? queryFilters : {},
                count : results.hits.total,
                aggregations : privateMethods.parseEsAggregations(results.aggregations)
            };

            returnObj.aggregations = eagerLoadAggregations(returnObj.aggregations);

            next(null,parseEsItems(items));
        });

    }


    function parseEsItems(items){
        var ret = [];
        lo.forEach(items,function(item){
            var tmp = item._source;
            tmp.id = item._id;
            tmp._id = item._id;
            if (tmp.thumb){
                tmp.thumb.id = App.Helpers.MongoDB.idToObjId(tmp.thumb.id);
            }
            if (tmp.categories){
                tmp.categories = App.Helpers.MongoDB.arrayToObjIds(tmp.categories);
            }
            if (tmp.mediaFiles.images.length > 0){
                for (var i in tmp.mediaFiles.images){
                    tmp.mediaFiles.images[i].id = App.Helpers.MongoDB.idToObjId(tmp.mediaFiles.images[i].id);
                }
            }
            if (tmp.mediaFiles.documents.length > 0){
                for (var i in tmp.mediaFiles.documents){
                    tmp.mediaFiles.documents[i].id = App.Helpers.MongoDB.idToObjId(tmp.mediaFiles.documents[i].id);
                }
            }
            if (tmp.mediaFiles.videos.length > 0){
                for (var i in tmp.mediaFiles.videos){
                    tmp.mediaFiles.videos[i].id = App.Helpers.MongoDB.idToObjId(tmp.mediaFiles.videos[i].id);
                }
            }
            if (tmp.ExtraFields.length > 0){
                for (var i in tmp.ExtraFields){
                    tmp.ExtraFields[i].fieldID = App.Helpers.MongoDB.idToObjId(tmp.ExtraFields[i].fieldID);
                }
            }

            if (Options.applyDiscounts){
                App.Services[Package.packageName].Discount.applyDiscount(tmp);//apply possible discounts
            }

            ret.push(tmp);
        });

        return ret;
    }

    function eagerLoadAggregations(aggs){
        if (!Cache.ExtraFields || !Cache.ProductCategories){
            return Package.services.Cache.addModelsToCache(eagerLoadAggregations(aggs));//load everything into cache and retry
        }

        if (aggs.ExtraFields){
            aggs.ExtraFields = eagerLoadExtraFields(aggs.ExtraFields);
        }

        if (aggs.categories){
            aggs.categories = eagerLoadCategories(aggs.categories);
        }

        return aggs;
    }

    function eagerLoadExtraFields(fields){
        var processedFields = {};

        fields.forEach(function(field){

            var found = lo.find(Cache.ExtraFields,{_id : field.id});
            if (found){
                field = lo.merge(field,found);
                field.values.forEach(function(val){
                    var searchFor = lo.find(field.fieldOptions,{varName : val.key.toLowerCase()});
                    if (searchFor){
                        val.label = searchFor.title;
                    }
                });

                processedFields[field.varName] = field;
            }
        });

        return processedFields;
    }

    function eagerLoadCategories(categories){
        categories.forEach(function(category){
            var found = lo.find(Cache.ProductCategories,{_id : category.key});

            if (found){
                category = lo.merge(category,found);
            }
        });

        return categories;
    }

    function groupSku(products,next){
        var skus = [];
        products.forEach(function(product){
            skus.push(new RegExp('^'+product.baseSku,'i'));
        });

        next(null,lo.uniq(skus),products);
    }

    /*
    * We are fetching the aggregated results, and then pass the simplified ones to the the eager loader to get thumbs and stuff
    */
    function fetchSku(skus,products,next){
        var EL = new eagerLoader();
        EL.set(privateMethods).with(withRelations).
            exec(executeFetchSku.bind(null,skus),function(err,items){
                if (err){
                    return next(err);
                }
                return next(null,items);
            });
    }
    /*
    * What this does is goes to mongo, fetches all items aggregated, then simplifies them into a flat array
    * assigns the aggregated to a global variable and passes the simplified one to the eager loader
    */
    function executeFetchSku(skus,next){
        var Query = [];
        Query.push({'$match': { sku: { $in: skus } } });
        Query.push({'$match': {"eshop.quantity": { $gt: 0 }}});
        Query.push({'$match': {"active": true}});
        Query.push({$project: { _id: 1, title : '$title', sku: 1,baseSku:1, thumb:1,permalink:1 } });
        Query.push({'$group':
        {
            _id: {
                base : '$baseSku'
            }, items : {$push : {sku : '$sku',id : '$_id',permalink : '$permalink',thumb:'$thumb',title : '$title',baseSku:'$baseSku'} },count : {$sum:1}
        }
        });


        ProductModel.aggregate(Query)
            .exec(function(err,items){
                if (err){
                    return next(err);
                }

                if (items.length == 0){
                    return next(null,[]);
                }

                var ret = [];
                items.forEach(function(item){
                    for(var i=0;item.items.length > i;i++){
                        ret.push(item.items[i]);
                    }

                    relatedSkus.push({baseSku : item._id.base,items : item.items,count : item.count});
                });

                next(err,ret);
            });
    }

    /*
    * The eager loader returns the simplified flat array of products. We now have to merge these with the global aggregated one
    * and when we are done, we need to merge that, with the original results returned by the ES query.
    * Some serious mind fuck
    */
    function mergeResults(products,next){
        relatedSkus.forEach(function(agg){
           agg.items.forEach(function(product){
               var found = lo.find(products,{_id : product._id});
               if (found){
                   product = found;
               }
           });
        });



        next(null,relatedSkus);
    }


    return find;

});