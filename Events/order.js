module.exports = (function(App,Express,Package){

    App.Event.on('order.complete',function(Order){
        //Notify customer
        App.Services.mcmsNodeEshop.Order.notifyCustomer(Order);
        //Notify admin
        App.Services.mcmsNodeEshop.Order.notifyAdmin(Order);
        //write into analytics table
        //write into popular products table
        Order.items.forEach(function(item){
            var query = {"_id": App.Helpers.MongoDB.idToObjId(item.id)};
            var update = {
                $inc: { unitsSold: 1,subTotal : item.price },
                $setOnInsert: { productId: App.Helpers.MongoDB.idToObjId(item.id) }
            };
            var options = {new: true,upsert: true};
            App.Connections.mongodb.models.popularProducts.findOneAndUpdate(query, update, options,function(err,res){});
            App.Connections.mongodb.models.Product.update(query, {$inc: { 'eshop.unitsSold': 1}}, {},function(err,res){});
        });
    });

});