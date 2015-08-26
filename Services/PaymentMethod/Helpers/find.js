module.exports = (function(App,Connection,Package,privateMethods){
    var Model = Connection.models.Discount,
        lo = require('lodash'),
        async = require('async');
    var Relationships = Package.modelRelationships;
    var eagerLoader = require('mcms-node-eager-loader')(),
        Loader = new eagerLoader();

    function find(options,callback){

        Loader.set(privateMethods)
            .with([Relationships.shipping,Relationships.processors])
            .exec(getPaymentMethods.bind(null,options),callback);
/*        async.parallel([
            function(next){
                Loader.set(privateMethods)
                    .with([Relationships.shipping,Relationships.processors])
                    .exec(getPaymentMethods.bind(null,options),next);
            }
        ],function(err,results){
            if (err){
                console.log('Err:',err);
            }
            console.log('final:',results);
            callback(null,results);
        });*/
    }

    function getPaymentMethods(options,next){
        if (options.lean){
            toExec = toExec.lean();
        }

        App.Connections.mongodb.models.PaymentMethod.find().sort({orderBy : 1}).exec(next);
    }

    return find;
});