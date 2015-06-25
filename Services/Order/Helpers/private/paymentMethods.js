module.exports = (function(App,Connection,Package) {

    return function(ids,next){
        App.Connections.mongodb.models.PaymentMethod.where('_id')
            .in(App.Helpers.MongoDB.arrayToObjIds(ids))
            .exec(next);
    }
});