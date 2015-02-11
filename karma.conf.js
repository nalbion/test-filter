module.exports = function(config) {
    config.set({
        frameworks: ['jasmine'],
        browsers: ['PhantomJS'],

        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,

        files: [
            'test/fixtures/**/*.js'
            ,'test/fixtures/**/*-spec.js'
        ],
        plugins: [
            'karma-jasmine',
            //'karma-chrome-launcher'
            'karma-phantomjs-launcher',

//            // inlined plugins
//            // {'framework:xyz', ['factory', factoryFn]},
//            // require('./plugin-required-from-config')
            {'preprocessor:test-filter': ['factory', require('./src/tools/karma/karma-test-filter-preprocessor')]}
        ],
        preprocessors: {
            '**/*-spec.js': ['test-filter']
        }
//        customPreprocessors: {
//            test_filter: {
////              base: 'coffee',
////              options: {bare: true}
//            }
//        }
        ,testFilter: {
            foo: 'bar'
        }
        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        ,singleRun: true
    });
};
