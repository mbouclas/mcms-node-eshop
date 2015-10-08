module.exports = (function(App,Package) {
    var packageName = 'mcmsNodeEshop',
        categoryServices = App.Services['mcmsNodeEshop'].Category,
        async = require('async'),
        Cache = {};


    return {
        name: 'Category',
        nameSpace: 'Product',
        findOne: findOne,
        find: find,
        create : create,
        update : update
    };


    function findOne(req,res,next){
        categoryServices.findOne(req.body.id,{},function(err,item){

            if (err){
                return res.status(409).send({success:false, error : err});
            }

            res.send(item.category);
        });
    }

    function find(req,res,next){
        categoryServices.find({permalink : packageName},function(err,categories){
            res.send(categories);
        })

    }

    function create(req,res,next){
        req.body.data.uid = req.user.uid;
        var parent = (req.body.parent) ? req.body.parent : 'mcmsNodeEshop';//expecting permalink
        categoryServices.create(parent,req.body.data,function(err,result){
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
        categoryServices.update(req.body.id,req.body.data,function(err,result){
            if (err){
                return res.status(409).send({success:false, error : err});
            }

            res.send(result);
        })

    }

});