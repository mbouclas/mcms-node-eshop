module.exports = function (mongoose, modelName) {
    var schema = mongoose.Schema({
        title: String,
        permalink: { type: String, index: true },
        description: String,
        active: Boolean,
        discount : Number,
        type: String,
        minPrice : Number,
        settings: {},
        items :[],
        categories : [],
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