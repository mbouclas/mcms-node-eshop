module.exports = (function(App,Route,Package){
    var express = require('express');
    var router = express.Router();
    var productServices = App.Services[Package.packageName].Product,
        cartServices = App.Services[Package.packageName].Cart,
        lo = require('lodash');
    var names = {
        addToCart : '/addToCart',
        removeFromCart : '/removeFromCart'
    };
    Route.set(names,'api');

    router.post('/addToCart' ,function(req, res, next) {
        //look up for product first via the Product service
        var product = App.Cart.findOne({id : req.body.id});
        if (product){
            App.Cart.update(req.body.id,product.qty+1);

            return res.send({
                Cart : App.Cart.fullCart()
            });
        }

        //lookup for product then add it
        productServices.findOne({_id: req.body.id},{with : ['thumb'],applyDiscounts:true},function(err,item){
            if (err){
                return res.send({error:true});
            }

            var product = cartServices.toCart(item.product);
            product.qty = req.body.qty || 1;
            App.Cart.add(product);

            return res.send({
                Cart : App.Cart.fullCart(),
                recommendedProducts : []
            });
        });
    });

    router.post('/removeFromCart' ,function(req, res, next) {
        App.Cart.remove(req.body.id);
        return res.send({
            Cart : App.Cart.fullCart()
        });
    });

    router.post('/updateCart' ,function(req, res, next) {
        //Cart.update(newItem.id,{title : 'new product',price : 12.17,qty : 2}); // To update the entire product
        //Cart.update(newItem.id,4); // To update just the quantity
        //Cart.update([{id:'111',qty:3},{id:'123',qty:1}]); // To mass update items

        if (lo.isArray(req.body.id)){
            req.body.id.forEach(function(item){
                App.Cart.update(item.id,item.qty);
            });
        } else {
            App.Cart.update(req.body.id,req.body.item);
        }

        return res.send({
            Cart : App.Cart.fullCart()
        });
    });


    router.post('/clearCart' ,function(req, res, next) {
        App.Cart.clear();
        return res.send({
            Cart : App.Cart.fullCart()
        });
    });

    App.Event.on('coupon.error',function(err){
        console.log('ERROR:::::',err);
    });

    router.post('/applyCouponCodeToCart' ,function(req, res, next) {


        if (!req.body.code){
            return res.send(errorResponse);
        }

        cartServices.applyCouponToCart(req.body.code,function(err,result){
            var errorResponse = {
                    Error : "coupon_not_found",
                    Cart : App.Cart.fullCart()
                },
                successResponse = {
                    Cart : App.Cart.fullCart()
                };

            if (err){
                return res.send(errorResponse);
            }

            return res.send(successResponse);
        });
    });

    router.post('/removeCoupon' ,function(req, res, next) {
        cartServices.removeCoupon();
        return res.send({
            Cart : App.Cart.fullCart()
        });
    });

    //router.post('/login',App.Auth.middleware.applyCSRF,App.Auth.loginAdmin);

    return router;
});