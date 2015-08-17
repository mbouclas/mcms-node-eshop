module.exports = (function(App,Express,Package){
    var Route = App.Route;
    Express.use('/api',require('./routes/cart')(App,Route,Package));
    Express.use('/api',require('./routes/paypal')(App,Route,Package));
    Express.use('/admin/api/eshop',App.Auth.middleware.applyCSRF,[App.Auth.middleware.isAdmin],require('./routes/api')(App,Route,Package));
    Express.use(Route.use);
});
