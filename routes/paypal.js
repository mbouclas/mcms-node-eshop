module.exports = (function(App,Route,Package) {
    var express = require('express');
    var router = express.Router();
    var Paypal = App.Services[Package.packageName].Paypal;


    router.post('/paypal-ipn',App.Auth.middleware.applyCSRF ,function(req, res, next) {

        res.sendStatus(200);
        Paypal.ipnVerify(req.body,true,function(err,results){
            if (err){
                App.Log.error("IPN ERR: ",err);
            }

        });
    });



    return router;
});