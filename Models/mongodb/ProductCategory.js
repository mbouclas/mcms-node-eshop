module.exports = function (mongoose, modelName) {
    var materializedPlugin = require('mongoose-materialized');
    // Define your mongoose model as usual...
    var schema = mongoose.Schema({
        category: { type: String, index: true },
        description: String,
        permalink: { type: String, index: true },
        orderby: Number,
        created_at: {type : Date, default : Date.now},
        updated_at: {type : Date, default : Date.now},
        ExtraFields : [],
        settings : {},
        oldID : Number
    }, {
        strict: false,
        id : true
    });
    schema.set('toObject', { getters: true, virtuals: true });
    schema.set('toJSON', { getters: true, virtuals: true });
    schema.plugin(materializedPlugin);

    mongoose.model(modelName, schema);
};