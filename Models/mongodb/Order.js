module.exports = function (mongoose, modelName) {
    var schema = mongoose.Schema({
        orderId : { type: String, index: true},
        email: { type: String, index: true },
        status : Number,
        amount : Number,
        paymentMethod : {},
        shippingMethod : {},
        notes : String,
        orderDetails: {},
        orderInfo: {},
        archive : Boolean,
        ipAddress : String,
        user : {},
        items : [],
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