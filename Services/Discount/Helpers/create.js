module.exports = (function(App,Connection,Package,privateMethods){
    var Model = Connection.models.Discount,
        async = require('async');

    function create(data,callback){
        var toSave = privateMethods.discountItemTemplate(data),
            asyncArr = {};

        asyncArr.items = privateMethods.formatItems.bind(null,data.items);

        async.parallel(asyncArr,function(err,results){
            toSave.items = results.items;
            new Model(toSave).save(function (err, discount) {
                if (err) {
                    return callback(err);
                }

                callback(null, discount);
            });
        });

    }

    return create;
});