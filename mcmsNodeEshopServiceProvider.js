module.exports = (function(App){
    var express = require('express');
    var miniApp = express();
    var Command = App.Command(App);
    var path = require('path');
    var mcmsCartObj = require('mcms-node-cart');

    function mcmsNodeEshopServiceProvider(){
        this.packageName = 'mcmsNodeEshop';
        this.services = {};
        this.controllers = {};
        this.adminModule = __dirname + '/admin-package.json';
        this.viewsDir = __dirname + '/views';
        this.baseFolder = '/';
        var _this = this;

        App.dbLoader[App.Config.database.default].loadModels(__dirname + '/Models/' + App.Config.database.default);
        this.modelRelationships = require('./Models/model-relationships');
        this.services = App.Helpers.services.loadService(__dirname + '/Services',null,this);
        App.Services[this.packageName] = this.services;


        if (App.CLI){
            var commandFolder = path.join(__dirname , './bin/Command/');
            Command.registerCommand([
                commandFolder + 'migrate'
            ]);

            return;
        }

        //Grab common stuff to place into cache. They will be async the first time but we are using them into Controllers
        //on demand, so we should be ok with the async timings
        this.services.Cache.addModelsToCache();

        var Cart = mcmsCartObj.Cart(App.server);
        //this.Conditions = mcmsCartObj.Conditions;
        App.Cart = new Cart('cart',{},{Event : App.Event});
        miniApp.use(App.Cart.init());


        var expressCart = function(req,res,next){
            //_this.Cart.clear();
            res.locals.Cart = App.Cart.fullCart();
            next();
        };

        setTimeout(function(){
/*            _this.services.Discount.update(App.Helpers.MongoDB.idToObjId("5571846da9f1b73449957138"),{
                //title : 'Discounted items',
                //description : 'A description'

                items : ['EK060_53B','EK401_15H','EK767_82H']
            },function(err,discount){
                console.log(discount)
            });*/
/*            var slug = require('slug'),
                moment = require('moment');*/
/*            var cp = [
                {
                    "code": "5451",
                    "title": "10&euro; discount",
                    permalink : slug("10&euro; discount",{lower:true}),
                    "description": "&lt;p&gt;&amp;lt;p&amp;gt;&amp;lt;p&amp;gt;sssd&amp;lt;\/p&amp;gt;&amp;lt;\/p&amp;gt;&lt;\/p&gt;",
                    "discount": "10.00",
                    "discount_type": "$",
                    "active": true
                },
                {
                    "code": "5452",
                    "title": "10% discount",
                    permalink : slug("10% discount",{lower:true}),
                    "description": "&lt;p&gt;&amp;lt;p&amp;gt;&amp;lt;p&amp;gt;sssd&amp;lt;\/p&amp;gt;&amp;lt;\/p&amp;gt;&lt;\/p&gt;",
                    "discount": "10.00",
                    "discount_type": "%",
                    "active": true
                }
            ];

            App.Connections.mongodb.models.Coupon.create(cp[0]);
            App.Connections.mongodb.models.Coupon.create(cp[1]);*/
            //var query = {status:4};
            //var query = {compare:{field : 'status',type :'gt',value:1}};

/*            var start       = moment({hour : 5}).subtract(1,'day').toDate();
            var end         = moment({hour : 8}).add(4,'days').toDate();
            var query = {date:{field : 'created_at',start : start,end:end}};*/

            //var query = {in:{field : 'status',values:[1,4]}};
            //var query = {user: App.Helpers.MongoDB.idToObjId("54461766a41d20471b6e68a1")};
/*            _this.services.Order.find(query,{sanitizeForAjax:true,with:['payment']},function(err,result){
                console.log(result)
            })*/

        },2000);

        App.Controllers[this.packageName] = App.Helpers.services.loadService(__dirname + '/Controllers',true,this);
        miniApp.use(expressCart);
        miniApp.use(express.static(__dirname + '/public'));
        App.viewEngine.registerTemplates(this.viewsDir, miniApp);
        require('./routes')(App, miniApp,this);
        require('./Events/loader')(App, miniApp,this);
        miniApp.on('mount', function (parent) {
            console.log('Eshop Mounted');//parent is the main app

        });

        App.server.use(miniApp);
    }



    return new mcmsNodeEshopServiceProvider();
});