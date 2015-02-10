var util = require('util');
var issuesApiFactory = require('../../issues/issues-api.js');

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
    var preprocess = require('./parsers/' + framework + '.js').preprocess;

    return function(content, file, done) {
        log.info('Processing "%s".', file.originalPath);
        log.info(typeof content);
        log.info(file);

        var processedTestCase = preprocess(content, issues);
		done(processedTestCase);

        //var htmlPath = file.originalPath.replace(basePath + '/', '');
        //
        //file.path = file.path + '.js';
    };
};

createTestFilterPreprocessor.$inject = ['logger', 'config.basePath', 'config.frameworks', 'config.testFilter'];

module.exports = createTestFilterPreprocessor;
