var gulp = require('gulp');
var config = require('./gulp.config')();
var args = require('yargs').argv;
var path = require('path');
var fs = require('fs-extra');
var _ = require('lodash');
var $ = require('gulp-load-plugins')({lazy: true});
var del = require('del');

gulp.task('help', $.taskListing);
gulp.task('default', ['help']);


gulp.task('less', ['clean-styles'], function() {
    log('Compiling Less --> CSS');

    return gulp
        .src(config.less)
        .pipe($.plumber())
        .pipe($.less())
        .pipe($.autoprefixer({browsers: ['last 2 version', '> 5%']}))
        .pipe(gulp.dest(config.temp));
});

gulp.task('styles', ['clean-styles'], function() {
    log('Compiling Less --> CSS');

    return gulp
        .src(config.plainCss)
        .pipe($.plumber())
        .pipe(gulp.dest(config.temp));
});

gulp.task('fonts', ['clean-fonts'], function() {
    log('Copying fonts');
    return gulp
        .src(config.fonts)
        .pipe(gulp.dest(config.build + 'assets/build/fonts'));
});

gulp.task('templatecache', ['clean-code'], function() {
    log('Creating AngularJS $templateCache');

    return gulp
        .src(config.htmltemplates)
        .pipe($.minifyHtml({empty: true}))
        .pipe($.angularTemplatecache(
            config.templateCache.file,
            config.templateCache.options
        ))
        .pipe(gulp.dest(config.temp));
});

gulp.task('wiredep', function() {
    log('Wire up the bower css js and our app js into the html');
    var options = config.getWiredepDefaultOptions();
    var wiredep = require('wiredep').stream;

    return gulp
        .src(config.indexTemplate)
        .pipe(wiredep(options))
        .pipe($.inject(gulp.src(config.js)))
        .pipe(gulp.dest(config.client));
});

gulp.task('inject', [ 'styles','less', 'templatecache'], function() {
    log('Wire up the app css into the html, and call wiredep ');
    var options = config.getWiredepDefaultOptions();
    var wiredep = require('wiredep').stream;


    return gulp
        .src(config.indexTemplate)
        .pipe($.inject(gulp.src(config.css)))
        .pipe(wiredep(options))
        .pipe($.inject(gulp.src(config.js)))
        .pipe(gulp.dest(config.client));
});

gulp.task('clean-code', function(done) {
    var files = [].concat(
        config.temp + '**/*.js',
        config.build + '**/*.html',
        config.build + 'js/**/*.js'
    );
    clean(files, done);
});

gulp.task('clean-fonts', function(done) {
    clean(config.build + 'fonts/**/*.*', done);
});

gulp.task('clean-images', function(done) {
    clean(config.build + 'images/**/*.*', done);
});

gulp.task('clean-styles', function(done) {
    clean(config.temp + '**/*.css', done);
});

gulp.task('optimize', ['inject'], function() {
    log('Optimizing the javascript, css, html');

    var assets = $.useref.assets({searchPath: './'});
    var templateCache = config.temp + config.templateCache.file;
    var cssFilter = $.filter('**/*.css');
    var jsLibFilter = $.filter('**/' + config.optimized.lib);
    var jsAppFilter = $.filter('**/' + config.optimized.app);

    return gulp
        .src(config.indexTemplate)
        .pipe($.plumber())
        .pipe($.inject(
            gulp.src(templateCache, {read: false}), {
                starttag: '<!-- inject:templates:js -->'
            }))
        .pipe(assets)
        .pipe(cssFilter)
        .pipe($.csso())
        .pipe(cssFilter.restore())
        .pipe(jsLibFilter)
        .pipe($.uglify())
        .pipe(jsLibFilter.restore())
        .pipe(jsAppFilter)
        .pipe($.ngAnnotate())
        .pipe($.uglify())
        .pipe(jsAppFilter.restore())
        .pipe($.rev())
        .pipe(assets.restore())
        .pipe($.useref())
        .pipe($.revReplace())
        .pipe(gulp.dest(config.build))
        .pipe($.rev.manifest())
        .pipe(gulp.dest(config.build));
});

gulp.task('production', ['optimize'], function() {
    fs.copy(config.build + config.templateName,config.index,function(err){
        if (err){
            console.log(err);
        }

        log('copied ' + config.index + ' to ' + config.viewsDir);
    });

});

gulp.task('customDev',['fonts'],function(){
    var assets = $.useref.assets({searchPath: './'});
    var templateCache = config.temp + config.templateCache.file;
    var cssFilter = $.filter('**/*.css');
    var jsLibFilter = $.filter('**/' + config.optimized.lib);
    var jsAppFilter = $.filter('**/' + config.optimized.app);

    return gulp
        .src(config.indexTemplate)
        .pipe($.plumber())
        .pipe(assets)
        .pipe(assets.restore())
        .pipe($.useref())
        .pipe(gulp.dest(config.build));
});

gulp.task('dev', ['customDev'], function() {
    fs.copy(config.build + config.templateName,config.index,function(err){
        if (err){
            console.log(err);
        }

        log('copied ' + config.build + config.templateName + ' to ' + config.index);

    });

});

gulp.task('normalize', function() {
    return gulp
        .src([config.indexTemplate])
        .pipe($.replace(/\/public/gmi, ''))
        .pipe(gulp.dest(config.build));
});

gulp.task('dev-debug', ['normalize'], function() {
    fs.copy(config.build + config.templateName,config.index,function(err){
        if (err){
            console.log(err);
        }

        log('copied ' + config.build + config.templateName + ' to ' + config.index);

    });

});


gulp.task('watch', function() {
    var filesToWatch = [
        config.indexTemplate,
        config.build + 'eshop.app/**/*.js'
    ];
    gulp.watch(filesToWatch , ['dev']);
});

gulp.task('watch-debug', function() {
    var filesToWatch = [
        config.indexTemplate,
        config.build + 'eshop.app/**/*.js'
    ];
    gulp.watch(filesToWatch , ['customDev']);
});

gulp.task('clean', function(done) {
    var delconfig = [].concat(config.build, config.temp);
    log('Cleaning: ' + $.util.colors.blue(delconfig));
    del(delconfig, done);
});


function clean(path, done) {
    log('Cleaning: ' + $.util.colors.blue(path));
    del(path, done);
}

function log(msg) {
    if (typeof(msg) === 'object') {
        for (var item in msg) {
            if (msg.hasOwnProperty(item)) {
                $.util.log($.util.colors.blue(msg[item]));
            }
        }
    } else {
        $.util.log($.util.colors.blue(msg));
    }
}

function changeEvent(event) {
    var srcPattern = new RegExp('/.*(?=/' + config.source + ')/');
    log('File ' + event.path.replace(srcPattern, '') + ' ' + event.type);
}