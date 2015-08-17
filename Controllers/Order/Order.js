module.exports = (function(App,Package){
    var packageName = Package.name,
        productServices = App.Services['mcmsNodeEshop'].Product,
        categoryServices = App.Services['mcmsNodeEshop'].Category,
        ExtraField = App.Connections.mongodb.models.ExtraField,
        async = require('async'),
        Cache = {};


    return {
        name : 'Order',
        nameSpace : 'Order',
        getOrders : getOrders,
        getOrder : getOrder
    };


    function getOrders(req,res,next){
        //var query = {user: App.Helpers.MongoDB.idToObjId(req.user.uid)};
        var query = {};
        var page = parseInt(req.body.page) || 1;
        var limit = 12;//move it to options file
        if (!req.body.filters){
            req.body.filters = {};
        }
        App.Services['mcmsNodeEshop'].Order.find(query,{sanitizeForAjax:true,with:['payment'],filters : req.body.filters},function(err,result){
            if (err){
                console.log(err);
            }
            result.pagination = App.Helpers.common.pagination(result.count.count,limit,page);
            return res.send(result);
        });
    }

    function getOrder(req,res,next){
        //var query = {user: App.Helpers.MongoDB.idToObjId(req.user.uid)};
        var query = {_id : App.Helpers.MongoDB.idToObjId(req.body.id)};
        App.Services['mcmsNodeEshop'].Order.findOne(query,{sanitizeForAjax:true,with:['payment']},function(err,result){
            if (err){
                console.log(err);
            }

            return res.send(result);
        });
    }
});