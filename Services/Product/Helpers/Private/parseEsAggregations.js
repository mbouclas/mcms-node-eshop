module.exports = (function(App,Connection,Package){
    var lo = require('lodash');

    var AggregationProcessor = {
        range : range,
        terms : terms,
        nested : nested,
        histogram : histogram,
        stats : stats
    };

    return parseAggregations;

    function parseAggregations(aggs,mappings){
        var aggregations = {},
            defaultMappings = { //this is the default map for Aggregations. You may provide your own map
                range : ['priceRanges'],
                terms : ['categories'],
                nested : ['ExtraFields'],
                histogram : ['priceRange'],
                stats : ['prices']
            };

        if (!mappings){
            mappings = defaultMappings;
        }

        lo.forEach(aggs,function(item,key){
            for (var func in mappings){
                if (mappings[func].indexOf(key) != -1){
                    aggregations[key] = AggregationProcessor[func].call(this,item);
                }
            }
        });
        //console.log(aggregations)
        return aggregations;
    }

    function range(aggs){
        if (!(lo.isArray(aggs.buckets))) {
            return [];
        }

        aggs.buckets.forEach(function(item){
            if (item.to_as_string){
                item.to_as_string = item.to_as_string.replace('.0','');
            }
            if (item.from_as_string){
                item.from_as_string = item.from_as_string.replace('.0','');
            }
        });


        return aggs.buckets;
    }

    function terms(aggs){
        if (!(lo.isArray(aggs.buckets))) {
            return [];
        }

        aggs.buckets.forEach(function(item){
            item.key = App.Helpers.MongoDB.idToObjId(item.key);
        });

        return aggs.buckets;

    }

    function nested(aggs){
        var results = [];

        if (!(lo.isArray(aggs.fields.buckets))) {
            return results;
        }

        aggs.fields.buckets.forEach(function(item){
            var tmp = {
                id : App.Helpers.MongoDB.idToObjId(item.key),
                doc_count : item.doc_count,
                values : []
            };

            if (!item.values.buckets){
                results.push(tmp);
                return;
            }

            tmp.values = item.values.buckets;
            results.push(tmp);
        });

        return results;
    }

    function histogram(aggs){
        if (!(lo.isArray(aggs.buckets))) {
            return [];
        }

        return aggs.buckets;
    }

    function stats(aggs){
        return aggs;
    }

});