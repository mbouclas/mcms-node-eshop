module.exports = (function(App,Express,Package){
    var Route = App.Route;
    Express.use('/api',require('./routes/cart')(App,Route,Package));
    Express.use(Route.use);
});
