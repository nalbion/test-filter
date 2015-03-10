module.exports = function(config) {
    config.set({
        frameworks: ['jasmine'],
        browsers: ['PhantomJS'],

        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,

        files: [
            'test/fixtures/test.js',
            'test/fixtures/*-spec.js'
        ],
        plugins: [
            'karma-jasmine',
            'karma-phantomjs-launcher',

            {'preprocessor:test-filter': ['factory', require('./lib/tools/karma/karma-test-filter-preprocessor')]}
        ],
        preprocessors: {
            '**/*-spec.js': ['test-filter']
        }
        ,testFilter: {
            modifyTestFiles: false
        }
        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        ,singleRun: true
    });
};
