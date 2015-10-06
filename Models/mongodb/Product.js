module.exports = function (mongoose, modelName) {
    var Schema = mongoose.Schema,
        mongoosastic = require('mongoosastic'),
        lo = require('lodash');

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
            price : { type: Number, index: true, get: getPrice, set: setPrice },
            list_price : { type: Number, get: getPrice, set: setPrice },
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
    //Mongo does not handle float too well, so we need to convert everything into int
    function getPrice(num){
        if (num < 1){
            return num;
        }
        if (!lo.isNumber(num) || !num || typeof num == 'undefined' || num === 'NaN'){
           return 0;
        }
        return (num/100).toFixed(2);
    }

    function setPrice(num){
        if (!lo.isNumber(num) || !num || typeof num == 'undefined' || num === 'NaN'){
            num = 0;
        }
        return num*100;
    }

    schema.set('toObject', { getters: true });
    schema.set('toJSON', { getters: true });
    schema.plugin(mongoosastic);

    mongoose.model(modelName, schema);

};