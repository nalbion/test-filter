var _ = require('underscore');
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
var createTestFilterPreprocessor = function(logger, config) {
    var frameworks = config.frameworks,
        testFilterConfig = config.testFilter;

    var log = logger.create('preprocessor.test-filter');
    var issuesConfig = (testFilterConfig === undefined) ? undefined : testFilterConfig.issues;
    var issuesApi = issuesApiFactory.getIssuesApi(issuesConfig);
    var issues = issuesApi.getIssues();

    // Karma only supports one test framework per config file, but it is valid to have more than
    // one framework (eg: ['jasmine', 'requirejs'])
    var framework = _.intersection(['jasmine', 'cucumber', 'mocha', 'qunit'], frameworks)[0];
    var preprocess = require('../../parsers/' + framework + '-parser.js').preprocess;

    return function(content, file, nextProcessor) {
        log.info('Pre-processing "%s".', file.originalPath);
        // When running the tests for this module I don't want the test files modified
        // but it would generally be useful so that offline mode can be used.
        var outputFile = (testFilterConfig && false === testFilterConfig.modifyTestFiles) ?
                        undefined : file.originalPath;

        if (typeof issues.then === 'function') {
            log.debug('Waiting for issues...');
            issues.then(function (promisedIssues) {
                log.debug('...Issues have been downloaded, proceeding with', file.originalPath);
                issues = promisedIssues;
                nextProcessor(preprocess(content, issues, outputFile, config));
            }, function(error) {
                log.error('Failed to download issues from server', error);
                nextProcessor(error);
            });
        } else {
            log.debug('Issues already downloaded, proceeding with', file.originalPath);
            nextProcessor(preprocess(content, issues, outputFile, config));
        }
    };
};

createTestFilterPreprocessor.$inject = ['logger', 'config'];

module.exports = createTestFilterPreprocessor;

