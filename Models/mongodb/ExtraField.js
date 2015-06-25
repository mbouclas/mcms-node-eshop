module.exports = function (mongoose, modelName) {
    var Schema = mongoose.Schema;

    var schema = mongoose.Schema({
        title: String,
        varName : { type: String, index: true },
        permalink: { type: String, index: true },
        module: String,
        type: String,
        created_at: {type : Date, default : Date.now},
        updated_at: {type : Date, default : Date.now},
        settings: {},
        active: Boolean,
        fieldOptions : [],
        categories : [],
        groups :[]
    },{
        strict: false,
        id : true
    });

    schema.set('toObject', { getters: true });
    schema.set('toJSON', { getters: true });

    mongoose.model(modelName, schema);

};