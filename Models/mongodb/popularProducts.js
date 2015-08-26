module.exports = function (mongoose, modelName) {
    var schema = mongoose.Schema({
        productId: { type: {}, index: true},
        unitsSold : Number,
        subTotal : Number,
        created_at: {type : Date, default : Date.now},
        updated_at: {type : Date, default : Date.now}
    },{
        strict: false,
        id : true
    });

    schema.set('toObject', { getters: true });
    schema.set('toJSON', { getters: true });

    mongoose.model(modelName, schema);

};