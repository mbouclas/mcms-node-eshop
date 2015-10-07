module.exports = (function(App,Package) {
    var fs = require("fs-extra"),
        path = require('path'),
        productServices = App.Services['mcmsNodeEshop'].Product;

    return {
        name: 'Upload',
        nameSpace: 'Product',
        uploadCategoryImages: uploadCategoryImages,
        uploadProductImages: uploadProductImages,
        uploadThumb : uploadThumb,
        uploadImage : uploadImage
    };


    function uploadCategoryImages(req,res,next){
        var file = req.files.uploadedFile;
        var StorageDir = path.join(App.Config.baseDir,App.Config.image.categories.dir);
        fs.move(file.path,StorageDir + file.originalname,{clobber : true},function(err,result){
            file.url = App.Config.image.categories.url + file.originalname;
            res.send(file);
        });
    }

    function uploadProductImages(req,res,next){
        var file = req.files.uploadedFile;
        var StorageDir = path.join(App.Config.baseDir,App.Config.view.frontPageImagesDir);
        fs.move(file.path,StorageDir + file.originalname,{clobber : true},function(err,result){
            file.url = App.Config.view.frontPageImagesUrl + file.originalname;
            res.send(file);
        });
    }

    function uploadThumb(req,res,next){
        productServices.thumb(req.body.id,req.files.uploadedFile,function(err,result){
            if (err){
                return res.status(409).send({success:false, error : err});
            }

            res.send(result);
        });

    }

    function uploadImage(req,res,next){
        productServices.image(req.body.id,req.files.uploadedFile,function(err,result){
            if (err){
                return res.status(409).send({success:false, error : err});
            }

            res.send(result);
        });

    }
});