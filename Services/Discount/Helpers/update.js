module.exports = (function(App,Connection,Package,privateMethods){
    var Model = Connection.models.Discount,
        lo = require('lodash'),
        async = require('async');

    function update(id,data,callback){
        var toSave = lo.clone(data),
            asyncArr = {};
        if (data.items){
            asyncArr.items = privateMethods.formatItems.bind(null,data.items);
        }

/*
* This is all kinds of wrong i think. Reason why is that if you pass no title for example, the template will overwrite it and you will
* end up deleting the old title. Same goes for everything else.
* Try to initialize the toSave as a {} instead of the template
* */
        async.parallel(asyncArr,function(err,results){
            toSave.items = results.items;
            Model.findById(id).exec(function(err,discount){
                if (toSave.items){
                    toSave.items.forEach(function(item){
                        discount.items.push(item);
                    });
                    toSave.items = lo.uniq(toSave.items);
                }


                lo.forEach(toSave,function(val,key){
                    discount[key] = val;
                });

                discount.save(callback);
            });
        });
    }

    return update;
});