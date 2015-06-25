setTimeout(function(){

    var Product =  App.Connections.mongodb.models.Product
        , stream = Product.synchronize()
        , count = 0;

    stream.on('data', function(err, doc){
        count++;
    });
    stream.on('close', function(){
        console.log('indexed ' + count + ' documents!');
    });
    stream.on('error', function(err){
        console.log(err);
    });
},3000);