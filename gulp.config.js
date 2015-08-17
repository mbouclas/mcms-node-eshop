module.exports = function() {
    var client = './public/';
    var clientApp = client + 'eshop.app/';
    var assetsDir = client + 'assets/';
    var report = './report/';
    var root = './';
    var server = './src/server/';
    var specRunnerFile = 'specs.html';
    var temp = './.tmp/';
    var wiredep = require('wiredep');
    var bowerFiles = wiredep({devDependencies: true})['js'];
    var viewsDir = './views/';
    var templateName = 'scripts.html';

    var config = {
        alljs: [
            './app/**/*.js',
            './*.js'
        ],
        build: './public/',
        client: client,
        viewsDir : viewsDir,
        assetsDir : assetsDir,
        css: temp + '**/*.css',
        fonts: [
            './public/assets/bower_components/font-awesome/fonts/**/*.*',
            './public/assets/fonts/fonts/**/*.*'
        ],
        html: clientApp + '**/*.html',
        htmltemplates: clientApp + '**/*.html',
        images: assetsDir + 'img/**/*.*',
        templateName : templateName,
        index: viewsDir + 'admin.layout.html',
        indexTemplate: viewsDir + templateName,
        js: [
            clientApp + '**/*.module.js',
            clientApp + '**/*.js',
            '!' + clientApp + '**/*.spec.js'
        ],
        less: [
            assetsDir + 'less/**/*.less'
        ],
        plainCss : [
            assetsDir + 'css/main.css',
            assetsDir + 'css/main-responsive.css'
        ],
        report: report,
        root: root,
        server: server,
        temp: temp,

        /**
         * optimized files
         */
        optimized: {
            app: 'app.js',
            lib: 'lib.js'
        },

        /**
         * template cache
         */
        templateCache: {
            file: 'templates.js',
            options: {
                module: 'app.core',
                standAlone: false,
                root: 'app/'
            }
        },

        /**
         * browser sync
         */
        browserReloadDelay: 1000,

        /**
         * Bower and NPM locations
         */
        bower: {
            json: require('./bower.json'),
            directory: './public/assets/bower_components/',
            ignorePath: '..'
        },
        packages : [
            './package.json',
            './bower.json'
        ]
    };

    config.getWiredepDefaultOptions = function() {
        return options = {
            bowerJson: config.bower.json,
            directory: config.bower.directory,
            ignorePath: config.bower.ignorePath
        };
    };


    return config;
};