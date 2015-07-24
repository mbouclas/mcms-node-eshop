module.exports = function (mongoose, modelName) {
    var Schema = mongoose.Schema,
        mongoosastic = require('mongoosastic');

    var schema = mongoose.Schema({
        sku: { type: String, index: true },
        baseSku: { type: String, index: true },
        title: { type: String, index: true },
        permalink: { type: String, index: true },
        description: String,
        description_long: String,
        created_at: {type : Date, default : Date.now},
        updated_at: {type : Date, default : Date.now},
        uid: {},
        active: Boolean,
        categories : [],
        extraFields : {},
        settings: {},
        eshop: {
            price : { type: Number, index: true },
            list_price : Number,
            quantity : Number,
            min_amount : Number,
            membership : Number,
            discount_avail : Number,
            free_shipping : Number,
            avail : Number,
            saving : Number,
            originalPrice: Number,
            unitsSold : Number
        },
        thumb :{},
        mediaFiles : {
            images : [],
            documents : [],
            videos : []
        },
        related :[],
        upselling :[],
        productOptions : {},
        translations : {},
        ExtraFields : []
    },{
        strict: false,
        id : true
    });

    schema.set('toObject', { getters: true });
    schema.set('toJSON', { getters: true });
    schema.plugin(mongoosastic);

    mongoose.model(modelName, schema);

};