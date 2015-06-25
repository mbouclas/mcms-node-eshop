module.exports = (function(App,Connection,Package,privateMethods){
    var async = require('async'),
        lo = require('lodash'),
        asyncObj = {
            extraFields : extraFields,
            productCategories : productCategories,
            shippingMethods : shippingMethods,
            paymentMethods : paymentMethods,
            paymentProcessors : paymentProcessors,
            coupons : coupons,
            addDiscountsToCache : addDiscountsToCache
        };
    if (App.Event){
        App.Event.on('cache.dirty',function(item,callback){
            if (!callback){
                callback = function(err,result){
                }
            }
            execute([asyncObj[item]],callback)
        });
    }

    return function(callback){
        if (!callback){
            callback = function(err,result){

            }
        }

        execute(asyncObj,callback);
    };

    function execute(tasks,callback){
        async.parallel(tasks,function(err,results){
            if (err){
                return callback(err);
            }
            callback(null,'loaded into cache');
        });
    }

    function extraFields(next){
        App.Connections.mongodb.models.ExtraField.find().lean().exec(function(err,result){
            addToCache('ExtraFields','varName',err,result);
            next(null,'extra fields done');
        });
    }

    function productCategories(next){
        App.Connections.mongodb.models.ProductCategory.find().lean().exec(function(err,result){
            addToCache('ProductCategories','permalink',err,result);
            next(null,'categories done');
        });
    }

    function shippingMethods(next){
        App.Connections.mongodb.models.ShippingMethod.find().exec(function(err,result){
            var transformedResult = result.map(function(res) {
                return res.toObject();
            });

            addToCache('ShippingMethods','permalink',err,App.Helpers.MongoDB.sanitizeForAjax(transformedResult));
            next(null,'shipping methods done');
        });
    }

    function paymentMethods(next){
        Package.services.PaymentMethod.find({},function(err,result){
            var transformedResult = result.map(function(res) {
                return res.toObject();
            });

            addToCache('PaymentMethods','',err,App.Helpers.MongoDB.sanitizeForAjax(transformedResult));
            next(null,'Payment methods done');
        });
    }

    function paymentProcessors(next){
        App.Connections.mongodb.models.PaymentProcessor.find().lean().exec(function(err,result){
            addToCache('PaymentProcessors','_id',err,result);
            next(null,'payment processors done');
        });
    }

    function coupons(next){
        App.Connections.mongodb.models.Coupon.find({active:true}).lean().exec(function(err,result){
            App.Cart.Coupon.fill(result);
            addToCache('Coupons','code',err,result);
            next(null,'coupons done');
        });
    }

    function addDiscountsToCache(next){
        App.Connections.mongodb.models.Discount.find().lean().exec(function(err,discounts){
            addToCache('Discounts','_id',err,discounts);
            var discountedItems = {};
            discounts.forEach(function(discount){
                discount.items.forEach(function(product){
                    if (!lo.isArray(discountedItems[product])){
                        discountedItems[product] = [discount._id];
                        return;
                    }

                    discountedItems[product].push(discount._id)
                });
            });

            App.Cache.DiscountedItems = discountedItems;
            next(null,'discounts done');
        });
    }

    function addToCache(name,key,err,data){
        if (err){
            return;
        }

        if (!App.Cache) {
            App.Cache = {};
        }

        if (!key){
            App.Cache[name] = data;
            return;
        }

        var temp = {};
        for (var a in data){
            temp[data[a][key]] = data[a];
        }

        App.Cache[name] = temp;
    }
});