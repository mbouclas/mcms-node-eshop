module.exports = (function(App,Connection,Package) {
    var lo = require('lodash');
    return function(ids,next){
        ids = lo.uniq(lo.flatten(ids));

        App.Connections.mongodb.models.ShippingMethod.where('_id')
            .in(App.Helpers.MongoDB.arrayToObjIds(ids))
            .exec(next);
    }
});