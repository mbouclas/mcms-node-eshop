module.exports = (function(App,Connection,Package,privateMethods){
    function applyDiscount(product){
        var Discount = pullDiscountFromCache(product._id);

        if (!Discount){
            return false;
        }

        product.eshop.originalPrice = product.eshop.price;
        if (Discount.type == '%'){
            product.eshop.saving = (Discount.discount/100)*product.eshop.price;
        }
        else {
            product.eshop.saving = Discount.discount;
        }

        product.eshop.price = product.eshop.price - product.eshop.saving;

        return product;
    }

    function pullDiscountFromCache(productID){
        if (!App.Cache['Discounts'][App.Cache.DiscountedItems[productID]]){
            return false;
        }

        return App.Cache['Discounts'][App.Cache.DiscountedItems[productID]];
        //console.log(App.Cache['Discounts'][App.Cache.DiscountedItems[item.product._id]]);
    }


    return applyDiscount;
});