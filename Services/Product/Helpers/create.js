module.exports = (function(App,Connection){
    var userModel = Connection.models.User;

    function create(user_data,callback){

        new userModel(user_data).save(function (err, user) {
            if (err) {
                throw err;
            }

            callback(null, user);
        });
    }

    return create;
});