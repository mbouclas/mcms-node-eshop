module.exports = (function(App,Connection,Package){
    //call the extra fields services via the module
    //check if module exists & require('mcms-node-extra-fields');
    //call the service
    var lo = require('lodash');
    var Model = App.Connections[App.Config.database.default].models.ExtraField;
    return function(fields,callback){
        var ids = [];
        lo.uniq(lo.flatten(fields));
        for (var a in fields){
            if (typeof fields[a] != 'undefined' && typeof fields[a].fieldID != 'undefined'){
                ids.push(fields[a].fieldID);
            }
        }


        Model.find({_id:{'$in' : ids }}).lean().exec(function(err,efields){
            if (err){
                App.Log.error(err);
                return callback(err);
            }
            callback(null,efields);
        });
    }

});
