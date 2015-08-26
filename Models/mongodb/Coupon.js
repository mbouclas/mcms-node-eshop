module.exports = function (mongoose, modelName) {
    var slug = require('slug');
    var schema = mongoose.Schema({
        title: String,
        permalink: { type: String, index: true},
        code: { type: String, index: true },
        description: String,
        active: {type : Boolean, default : false},
        discount : Number,
        discountType: {type : String, default : '%'},
        minimum : {type : Number, default : 0},
        products :[],
        categories : [],
        timesToUse : {type : Number, default : 0},
        timesUsed : {type : Number, default : 0},
        per_user : {type : Boolean, default : false},
        expire: Date,
        created_at: {type : Date, default : Date.now},
        updated_at: {type : Date, default : Date.now},
        uid : {},
        settings: {}
    },{
        strict: false,
        id : true
    });

    schema.set('toObject', { getters: true });
    schema.set('toJSON', { getters: true });

    mongoose.model(modelName, schema);

};