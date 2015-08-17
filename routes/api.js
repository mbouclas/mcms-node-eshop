module.exports = (function(App,Route,Package){
    var express = require('express');
    var router = express.Router();
    var Controllers = App.Controllers.mcmsNodeEshop,
        categoryServices = App.Services['mcmsNodeEshop'].Category;


    router.post('/find' ,function(req, res, next) {
        res.render('partials/index.html', { title: 'Admin', flash : req.flash() });
    });

    router.get('/findOne' ,Controllers['Product/Product'].findOne);
    router.post('/getProduct' ,Controllers['Product/Product'].findOne);
    router.post('/allProducts' ,Controllers['Product/Product'].find);
    router.post('/initProducts' ,Controllers['Product/Product'].init);
    router.post('/create' ,Controllers['Product/Product'].create);
    router.post('/update' ,Controllers['Product/Product'].update);
    router.post('/uploadThumb' ,Controllers['Product/Product'].uploadThumb);
    router.post('/uploadImage' ,Controllers['Product/Product'].uploadImage);
    router.post('/getOrders' ,Controllers['Order/Order'].getOrders);
    router.post('/getOrder' ,Controllers['Order/Order'].getOrder);

    return router;
});