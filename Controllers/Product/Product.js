module.exports = (function(App,Package){
    var packageName = 'mcmsNodeEshop',
        productServices = App.Services['mcmsNodeEshop'].Product,
        categoryServices = App.Services['mcmsNodeEshop'].Category,
        ExtraField = App.Connections.mongodb.models.ExtraField,
        async = require('async'),
        Cache = {};


    return {
        name : 'Product',
        nameSpace : 'Product',
        findOne : findOne,
        find : find,
        init : init,
        create : create,
        update : update
    };

    function init(req,res,next){
        var asyncObj = {
            categories: function (next) {
                categoryServices.find({permalink: packageName}, next);
            },
            ExtraFields: function (next) {
                ExtraField.find().exec(next);
            }
        };

        async.parallel(asyncObj,function(err,results){
            if (err){
                return res.status(409).send({success:false, error : err});
            }
            results.statusCodes = App.Config.eshop.statusCodes;
            res.send(results);
        });
    }

    function findOne(req,res,next){
        productServices.findOne(req.body.id,{},function(err,item){

            if (err){
                return res.status(409).send({success:false, error : err});
            }

            res.send(item.product);
        });
    }

    function find(req,res,next){
        var page = parseInt(req.body.page) || 1;
        var limit = 12;//move it to options file
        var permalink = req.body.permalink || null;
        if (!req.body.filters){
            req.body.filters = {};
        }

        productServices.find({permalink : permalink},{with : ['countItems'],page:page,limit : limit,filters : req.body.filters},function(err,result){
            if (err){
                return res.status(409).send({success:false, error : err});
            }

            var toServe = {
                items : result.items,
                itemCount : result.count,
                pagination : App.Helpers.common.pagination(result.count,limit,page)
            };

            res.send(toServe);
        });
    }

    function create(req,res,next){

        req.body.data.uid = req.user.uid;
        productServices.create(req.body.data,function(err,result){
            if (err){
                return res.status(409).send({success:false, error : err});
            }

            res.send(result);
        });

    }

    function update(req,res,next){
        if (!req.body.id){
            return res.status(409).send({success:false, error : 'noId'});
        }

        req.body.data.uid = req.user.uid;

        productServices.update(req.body.id,req.body.data,function(err,result){
            if (err){
                return res.status(409).send({success:false, error : err});
            }

            res.send(result);
        });
    }


});