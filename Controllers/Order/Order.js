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
        getOrder : getOrder,
        saveTrackingNumber : saveTrackingNumber,
        changeOrderStatus : changeOrderStatus,
        reSendInvoice : reSendInvoice
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
                App.Log.error(err);
            }
            result.pagination = App.Helpers.common.pagination(result.count.count,limit,page);
            return res.send(result);
        });
    }

    function getOrder(req,res,next){
        //var query = {user: App.Helpers.MongoDB.idToObjId(req.user.uid)};
        var query = {orderId : req.body.id};
        App.Services['mcmsNodeEshop'].Order.findOne(query,{sanitizeForAjax:true,with:['payment']},function(err,result){
            if (err){
                App.Log.error(err);
            }

            return res.send(result);
        });
    }

    function saveTrackingNumber(req,res,next){
        var data = {
          orderDetails : {tackingNumber : req.body.trackingNumber}
        };

        App.Services['mcmsNodeEshop'].Order.update(req.body.id,
            App.Helpers.MongoDB.sanitizeInput(data),function(err,result){
            if (err){
                App.Log.error(err);
            }

            return res.send(result);
        });
    }

    function changeOrderStatus(req,res,next){
        App.Services['mcmsNodeEshop'].Order.changeOrderStatus(req.body.id,req.body.status,function(err,result){
            if (err){
                App.Log.error(err);
            }

            return res.send(result);
        });
    }

    function reSendInvoice(req,res,next){
        App.Services['mcmsNodeEshop'].Order.reSendInvoice(req.body.id,function(err,result){
            if (err){
                App.Log.error(err);
            }

            return res.send(result);
        });
    }
});