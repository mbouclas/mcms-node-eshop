module.exports = (function(App,Connection,Package){
    return function(product){

        return {
            id : product.id || product._id,
            title : product.title,
            price : product.eshop.price,
            permalink : product.permalink,
            thumb : product.thumb || {},
            qty : 0,
            sku : product.sku || ''
        }
    }
});