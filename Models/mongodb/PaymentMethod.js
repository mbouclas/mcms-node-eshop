module.exports = function (mongoose, modelName) {
    var schema = mongoose.Schema({
        varName: String,
        title: String,
        permalink: { type: String, index: true },
        orderBy : Number,
        description: String,
        active: Boolean,
        surcharge : Number,
        surchargeType: String,
        settings: {},
        shippingMethods :[],
        processor : {},
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