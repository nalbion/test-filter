var util = require('util');
var _ = require('underscore');
var q = require('promised-io/promise'); //require('q');
//var queue = require("event-queue");
var issuesApiFactory = require('../../issues/issues-api.js');

//wait = function(target){
//    if(target && typeof target.then === "function"){
//        var isFinished, isError, result;
//        target.then(function(value){
//                isFinished = true;
//                result = value;
//            },
//            function(error){
//                isFinished = true;
//                isError = true;
//                result = error;
//            });
//        while(!isFinished){
//            queue.processNextEvent(true);
//        }
//        if(isError){
//            throw result;
//        }
//        return result;
//    }
//    else{
//        return target;
//    }
//};

/**
 * Factory method to create a pre-processor function
 * @param logger
 * @param basePath
 * @param {Array.<string>} frameworks
 * @param {Object=} testFilterConfig
 *          issues: {
 *            system: 'github',
 *            host: 'git.example.com',
 *            group: 'my-group',
 *            repo: 'my-project
 *         }
 * }
 *
 * @returns {function(string, File, function(Exception|string, string=)}
 *          content:
 *          file: {
 *              path:string (absolute path and file name)
 *              originalPath: (ditto)
 *              contentPath:  (ditto)
 *              mtime: DateTime
 *              isUrl: boolean
 *          }
 *          nextProcessor: function(error, content) (or (content))
 */
var createTestFilterPreprocessor = function(logger, basePath, frameworks, testFilterConfig) {
    var log = logger.create('preprocessor.test-filter');
    //console.info('=============testFilterConfig: ', testFilterConfig);
    //console.info('=============basePath: ', basePath);

    var issuesConfig = (testFilterConfig === undefined) ? undefined : testFilterConfig.issues;
    var issuesApi = issuesApiFactory.getIssuesApi(issuesConfig);
    var issues = issuesApi.getIssues();

    // Karma only supports one test framework per config file, but it is valid to have more than
    // one framework (eg: ['jasmine', 'requirejs'])
    var framework = _.intersection(['jasmine', 'cucumber', 'mocha', 'qunit'], frameworks)[0];
    var preprocess = require('../../parsers/' + framework + '-parser.js').preprocess;

    return function(content, file, done) {
        log.info('Processing "%s".', file.originalPath);
        // When running the tests for this module I don't want the test files modified
        // but it would generally be useful so that offline mode can be used.
        var outputFile = (testFilterConfig && false === testFilterConfig.modifyTestFiles) ?
                        undefined : file.originalPath;

        //issues = wait(issues);
        if (typeof issues.then === 'function') {
            log.debug('Waiting for issues...');
            issues.then(function (promisedIssues) {
                log.debug('...Issues have been downloaded, proceeding with', file.originalPath);
                issues = promisedIssues;
                done(preprocess(content, issues, outputFile));
            }, function(error) {
                log.error('Failed to download issues from server', error);
                done(error);
            });
        } else {
            log.debug('Issues already downloaded, proceeding with', file.originalPath);
            done(preprocess(content, issues, outputFile));
        }

        //var htmlPath = file.originalPath.replace(basePath + '/', '');
        //
        //file.path = file.path + '.js';
    };
};

createTestFilterPreprocessor.$inject = ['logger', 'config.basePath', 'config.frameworks', 'config.testFilter'];

module.exports = createTestFilterPreprocessor;
