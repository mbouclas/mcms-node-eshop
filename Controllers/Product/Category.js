module.exports = (function(App,Package) {
    var packageName = Package.name,
        categoryServices = App.Services['mcmsNodeEshop'].Category,
        async = require('async'),
        Cache = {};


    return {
        name: 'Category',
        nameSpace: 'Product',
        findOne: findOne,
        find: find
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

});