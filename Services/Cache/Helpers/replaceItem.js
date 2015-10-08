module.exports = (function(App,Connection,Package,privateMethods){

    return function(tag,key,id,newValue){
        delete App.Cache[tag][id];
        privateMethods.addToCache(tag,key,null,newValue);
    }
});