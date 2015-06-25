module.exports = (function(App) {
    var colors = require('colors');
    var async = require('async');
    var Faker = require('faker');
    var lo = require('lodash');
    var slug = require('slug');
    var moment = require('moment');
    var wrench = require('wrench');
    var Cache = {
        images: [],
        documents: [],
        categories: [],
        pages: [],
        users: []
    };
    var Products,ExtraFields,Categories,EshopItemDetails,Users;
    var idMap = {}, Product,Category,ExtraField,User,ItemDetail,Image;

    function command(){
        this.name = 'eshop:migrate';
        this.description = 'Migrate data from MySQL to Mongo';
        this.options = {};
    }

    command.prototype.fire = function(callback) {
        this.type = this.options['_'][1];
        var _this = this;
        var command = this.type || 'full';
        Product = App.Connections.mongodb.models.Product;
        Category = App.Connections.mongodb.models.ProductCategory;
        ExtraField = App.Connections.mongodb.models.ExtraField;
        Image = App.Connections.mongodb.models.ProductImage;
        User = App.Connections.mongodb.models.User;

        var Migrate = {
            products : products,
            categories : categories,
            extraFields : extraFields,
            images : images,
            users : users,
            orders : orders,
            blank : blank

        };

        if (command != 'full' && !lo.isFunction(Migrate[command])){
            console.log(colors.red('command ' + command + ' is not valid'));
            return callback('commandInvalid');
        }

        if (command == 'full'){
            async.parallel(Migrate,function(err,results){
                console.log(colors.green('command ' + _this.name + ' fired'));
                callback(null,'all commands done');
            });

            return;
        }

        console.log(colors.green('command ' + _this.name + ' fired'));
        Migrate[command](callback);
    };

    function blank(callback){
        setTimeout(function(){
            callback(null,'did nothing... again');
        },3000);
    }

    function products(callback){
        Products = readFile('products*');
        //we expect an array of array cause of the *

        var asyncArr = [],
            tasks = {
                categories : function(next){
                    Category.find({}).exec(next);
                },
                extraFields : function(next){
                    ExtraField.find({}).exec(next);
                },
                users : function(next){
                    User.find({}).lean().exec(next);
                },
                images : function(next){
                    Image.find({}).exec(next);
                }
            };


        async.parallel(tasks,function(err,results){
            //insertProduct(results,Products[1][4],callback);
            Products.forEach(function(productsSet){
                for (var a in productsSet){
                    asyncArr.push(insertProduct.bind(null,results,productsSet[a]));
                }
            });

            async.parallel(asyncArr,function(err,results){
                callback(null,'products done');
            });

        });


    }

    function categories(callback){
        Categories = readFile('categories');
        var asyncArr = [];
        var Parent = Category.findOne({category : 'mcmsNodeEshop'},function(err,cat){
            for (var a in Categories){
                asyncArr.push(insertCategory.bind(null,cat,Categories[a]));
            }


            async.parallel(asyncArr,function(err,results){
                callback(null,'categories done');
            });
        });

    }

    function extraFields(callback){
        ExtraFields = readFile('ExtraFields');
        var asyncArr = [];
        //first grab categories
        Category.find({})
            .exec(function(err,categories){
            //now start inserting
            for (var a in ExtraFields){
                asyncArr.push(insertExtraField.bind(null,categories,ExtraFields[a]));
            }


            async.series(asyncArr,function(err,results){
                callback(err,'efields done');
            });
        });

    }

    function images(callback){
        Images = readFile('images');
        var asyncArr = [];
        for (var a in Images){
            asyncArr.push(insertImage.bind(null,Images[a]));
        }

        async.series(asyncArr,function(err,results){
            callback(err,'images done');
        });
    }

    function users(callback){
        Users = readFile('users');
        var asyncArr = [];

        for (var a in Users){
            asyncArr.push(insertUser.bind(null,Users[a]));
        }
        //after insert fix UID, catids
        async.parallel(asyncArr,function(err,results){
            callback(null,'users done');
        });
    }

    function orders(callback){
        callback(null,'orders done');
    }

    function readFile(file){
        if (file.indexOf('*') == -1){
            var json = require(__dirname + '/migrations/'+ file + '.json');
            return json;
        }

        var files = wrench.readdirSyncRecursive(__dirname + '/migrations/'),
            targetFile = new RegExp(file.replace('*','') + "\\..*\\.json", "i"),
            ret = [];


        for (var a in files){
            var match = files[a].match(targetFile);
            if (match) {
                ret.push(require(__dirname + '/migrations/'+ match[0]));
            }
        }

        return ret;
    }

    function createIdMap(file,oldId,newId){
        if (typeof idMap[file] == 'undefined'){
            idMap[file] = {};
        }

        idMap[file][oldId] = newId;
    }

    function insertUser(user,callback){
        var activatedAt, createdAt,updatedAt;
        activatedAt = (user.activated == null ) ? new Date : moment(user.activated_at,'YYYY-MM-DD HH:mm:ss').toDate();
        createdAt = (user.created_at == null ) ? new Date : moment(user.created_at,'YYYY-MM-DD HH:mm:ss').toDate();
        updatedAt = (user.updated_at == null ) ? new Date : moment(user.updated_at,'YYYY-MM-DD HH:mm:ss').toDate();

        var temp = {
            username : user.uname,
            password : user.pass,
            email : user.email,
            firstName : user.user_name,
            lastName : user.user_surname,
            active : user.activated,
            settings : user.settings,
            activated_at : activatedAt,
            created_at : createdAt,
            updated_at : updatedAt,
            remember_token : user.remember_token,
            userClass : user.user_class,
            preferences : user.prefs,
            activation_code : user.activation_code,
            oldID : user.id
        };

        return new User(temp).save(function(err,item){
            if (err){
                console.log(err);
            }

            createIdMap('User',user.id,item.id);
            console.log(colors.magenta(user.email) + ' inserted');
            callback(null,'user inserted');
        });
    }

    function insertExtraField(categories,efield, callback){


        var createdAt = (efield.created_at == null ) ? new Date : moment(efield.created_at,'YYYY-MM-DD HH:mm:ss').toDate();
        var updatedAt = (efield.updated_at == null ) ? new Date : moment(efield.updated_at,'YYYY-MM-DD HH:mm:ss').toDate();
        var active = (efield.active == 'Y') ? true : false;
        var groups = [],
            options = [],
            settings = {},
            categoriesFound = [];

        for (var a in efield.settings.multipleData){
            options.push(efield.settings.multipleData[a]);
        }

        for (var a in efield.categories){
            var tempCat = lo.find(categories,{oldID : efield.categories[a].catid});

            if (!tempCat || !tempCat.id){
                tempCat = { id : ''};
            }

            categoriesFound.push({
                catid : tempCat.id,
                orderBy : efield.categories[a].orderby
            });
        }


        settings = efield.settings;
        delete settings.multipleData;
        delete settings.translations;

        var temp = {
            title: efield.field,
            varName: efield.var_name,
            permalink: efield.var_name,
            module: efield.module,
            type: efield.type,
            created_at: createdAt,
            updated_at: updatedAt,
            settings: settings,
            active: active,
            fieldOptions : options,
            categories : categoriesFound,
            groups :groups,
            oldID : efield.fieldid
        };

        return new ExtraField(temp,false).save(function(err,item){
            if (err){
                console.log('Efield error : ',err);
            }

            createIdMap('ExtraField',efield.fieldid,item.id);
            console.log(colors.magenta(efield.field) + ' inserted');
            callback(null,'Extra field inserted');
        });
    }

    function insertCategory(parent,cat,callback){
        var createdAt = (cat.created_at == null ) ? new Date : moment(cat.created_at,'YYYY-MM-DD HH:mm:ss').toDate();
        var updatedAt = (cat.updated_at == null ) ? new Date : moment(cat.updated_at,'YYYY-MM-DD HH:mm:ss').toDate();
        var parentID = (cat.parent_id == null) ? 0 : cat.parent_id;

        var temp = {
            category: cat.category,
            description: cat.description,
            permalink: cat.permalink,
            parentID: parentID,
            orderBy: cat.order_by,
            created_at: createdAt,
            updated_at: updatedAt,
            settings : cat.settings,
            oldID : cat.categoryid
        };

        parent.appendChild(temp,function(err,item){
            if (err){
                console.log(err);
            }

            createIdMap('Category',cat.categoryid,item.id);
            console.log(colors.magenta(cat.category) + ' inserted');
            callback(null,'category inserted');
        });
    }

    function insertProduct(Helpers,product,callback){

        var mediaFiles = {
            images : []
        };
        var categories = [],
            extraFields = [],
            mediaFiles = {
                images: [],
                documents: [],
                videos: []
            },
            thumb = {},
            upSell = [],
            uID;

        for (var a in product.categories){
            var cat = lo.find(Helpers.categories,{permalink : product.categories[a].alias});
            if (cat){
                categories.push(App.Helpers.MongoDB.idToObjId(cat.id));
            }
        }

        if (product.efields){
            for (var a in product.efields){
                var field = lo.find(Helpers.extraFields,{varName : product.efields[a].var_name});

                extraFields.push({
                    fieldID : App.Helpers.MongoDB.idToObjId(field.id),
                    value : product.efields[a].pivot.value
                });
            }
        }

        if (product.thumb){
            tempThumb = lo.find(Helpers.images,{oldID : product.thumb.id});
            thumb = {
                alt : product.thumb.alt,
                title : product.thumb.title,
                id : App.Helpers.MongoDB.idToObjId(tempThumb.id)
            };
        }

        if (product.images){
            for (var a in product.images){
                tempImg = lo.find(Helpers.images,{oldID : product.images[a].id});
                mediaFiles.images.push({
                    alt : product.images[a].alt,
                    title : product.images[a].title,
                    id : App.Helpers.MongoDB.idToObjId(tempImg.id)
                });
            }
        }

        uID = lo.find(Helpers.users,{oldID : product.uid});

        var settings = (!lo.isObject(product.settings)) ? {} : product.settings;

        var temp = {
            sku : product.sku,
            title : product.title,
            permalink : product.permalink,
            uid : uID._id,
            description : product.description,
            description_long : product.description_long,
            active : product.active,
            settings : settings,
            created_at : moment.unix(product.date_added),
            updated_at : moment.unix(product.date_modified),
            ExtraFields : extraFields,
            eshop : product.eshop,
            categories : categories,
            oldID : product.id,
            thumb : thumb,
            mediaFiles : mediaFiles
        };

        new Product(temp,false).save(function(err,item){
            if (err){
                console.log(err);
            }

            console.log(colors.yellow(product.sku + ' ' + product.title) + ' inserted');
            callback(null,'product inserted');
        });
    }

    function insertImage(image,callback){
        if (typeof image.additional.length == 'undefined' || image.additional.length == 0){
            return callback('no copies',null);
        }

        var oldImageMap = {
            itemid : image.itemid,
            imageID : image.id
        };
        var copies = {};

        //first insert these images to their collection
        var createdAt = (image.additional[0].created_at == null ) ? new Date : moment.unix(image.additional[0].date_added);
        var updatedAt = createdAt;

        for (var a in image.additional){
            var copy = image.additional[a];
            copies[copy.image_type] = {
                imageUrl : copy.image_url,
                imagePath : copy.image_path,
                imageX : copy.image_x,
                imageY : copy.image_y
            }
        }

        var temp = {
            originalFile: image.original_file,
            created_at: createdAt,
            updated_at: updatedAt,
            settings: {},
            copies : copies,
            details : {},
            oldID : image.id,
            oldItemID : image.itemid
        };

        new Image(temp,false).save(function(err,item){

            if (err){
                console.log('Image error : ',err);
                return callback('Image error : ' + item.id);
            }

            console.log(colors.magenta(item.originalFile) + ' inserted');
            callback(null,'image added');
        });
    }

    return command;
});