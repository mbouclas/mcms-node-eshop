module.exports = (function(App,Connection,Package){
    var User = Connection.models.User,
        Product = Connection.models.Product,
        async = require('async'),
        lo = require('lodash');
    var Cart = {},
        Coupon = {};

    return applyCouponToCart;

    //This method performs some database checks that cannot be done in the cart module and then validates
    // the coupon via the cart module
    function applyCouponToCart(code,callback) {
        Cart = App.Cart;
        Coupon = App.Cart.Coupon;
        var asyncArr = [];
        var coupon = Coupon.findCoupon({code:code});
        if (!coupon){
            return callback('coupon_not_found');
        }

        if (coupon.categories){
            asyncArr.push(checkInCategory.bind(null,coupon));//check if category in cart
        }

        if (coupon.per_user){//TODO
            asyncArr.push(checkUserQuota.bind(null,coupon));//check per user!!!
        }

        async.parallel(asyncArr,function(err,results){
            if (err){
                return callback(err);
            }

            //now validate against the Cart module
            if (!Coupon.validate(code)){
                return callback('invalid_coupon');
            }

            callback(null,true);
        });
    }

    function checkInCategory(coupon,next) {
        //check if the cart products belong in the category requested.
        //If yes, apply the coupon to them
        var Query = [],
            categoriesToLookInto = App.Helpers.MongoDB.arrayToObjIds(coupon.categories),
            ProductModel = App.Connections.mongodb.models.Product;

        //first grab the products
        var products = [],
            items = App.Cart.items();

        for (var a in items){
            products.push(items[a].id);
        }

        Query.push({
            $match : {
                _id : {
                    $in : App.Helpers.MongoDB.arrayToObjIds(products)
                }
            }
        });

        Query.push({
            $match : {
                categories : {
                    $in : categoriesToLookInto
                }
            }
        });

        Query.push({$project: { _id: 1, title : 1 } });


        ProductModel.aggregate(Query).exec(function(err,results){

           if (err){
               return next(err);
           }

            if (results.length == 0){
                return next('product_not_in_cart');
            }

            var toPush = [];

            for (var a in results){
                toPush.push(String(results[a]._id));
            }
            coupon.products = toPush;

            next(null,'done checking categories');
        });




    }

    function checkUserQuota(coupon, next) {
        next(null,'done checking user');
    }
});