module.exports = function (mongoose, modelName) {
    var schema = mongoose.Schema({
        originalFile: String,
        created_at: {type : Date, default : Date.now},
        updated_at: {type : Date, default : Date.now},
        settings: {},
        copies : {},
        details : {
            imageX : Number,
            imageY : Number
        },
        oldID : Number,
        oldItemID : Number
    }, {
        strict: false,
        id : true
    });

    schema.set('toObject', { getters: true });
    schema.set('toJSON', { getters: true });
    /*
     * Format of copies
     * {
     *   main : {
     *       imagePath : '',
     *       imageUrl : '',
     *       imageX : '',
     *       imageY : ''
     *   }
     * }
     */


    mongoose.model(modelName, schema);

};