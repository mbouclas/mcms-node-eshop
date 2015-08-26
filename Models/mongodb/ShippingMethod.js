module.exports = function (mongoose, modelName) {
    var schema = mongoose.Schema({
        title: String,
        permalink: { type: String, index: true },
        shippingTime : String,
        destination : String,
        code : String,
        parent : {},
        orderBy : Number,
        description: String,
        active: Boolean,
        baseCost : Number,
        settings: {},
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