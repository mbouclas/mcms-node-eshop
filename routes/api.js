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
    router.post('/allCategories' ,Controllers['Product/Category'].find);
    router.post('/getCategory' ,Controllers['Product/Category'].findOne);
    router.post('/createCategory' ,Controllers['Product/Category'].create);
    router.post('/updateCategory' ,Controllers['Product/Category'].update);
    router.post('/initProducts' ,Controllers['Product/Product'].init);
    router.post('/createProduct' ,Controllers['Product/Product'].create);
    router.post('/updateProduct' ,Controllers['Product/Product'].update);
    router.post('/uploadThumb' ,Controllers['Product/Upload'].uploadThumb);
    router.post('/uploadImage' ,Controllers['Product/Upload'].uploadImage);
    router.post('/uploadCategoryImages' ,Controllers['Product/Upload'].uploadCategoryImages);
    router.post('/uploadProductImages' ,Controllers['Product/Upload'].uploadProductImages);
    router.post('/getOrders' ,Controllers['Order/Order'].getOrders);
    router.post('/getOrder' ,Controllers['Order/Order'].getOrder);
    router.post('/saveTrackingNumber' ,Controllers['Order/Order'].saveTrackingNumber);
    router.post('/changeOrderStatus' ,Controllers['Order/Order'].changeOrderStatus);
    router.post('/reSendInvoice' ,Controllers['Order/Order'].reSendInvoice);

    return router;
});