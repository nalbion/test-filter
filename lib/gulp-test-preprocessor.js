// A Gulp Plugin to pre-process test/spec files annotated with issue IDs.

'use strict';

var through = require('through2');
var gutil = require('gulp-util');
var JasmineSpecFilter = require('./tools/jasmine/jasmine-spec-filter');
var PluginError = gutil.PluginError;
var _ = require('underscore');

// consts
var PLUGIN_NAME = 'gulp-test-preprocessor';

var issues;
var specAnnotations = {};

/**
 * Downloads all of the project's issue data (once only) using the Issues API,
 * then call <code>proceedWithIssues(issues)</code>.
 *
 * @param {{system: string=, host: string=, pathPrefix: string=}} options
 *      <code>system</code> is only required if <code>bugs.url</code> is not specified in <code>package.json</code>
 *        and the URL does not imply the system used.  Valid values: 'github' or 'bitbucket'.
 *     <code>host</code> and <code>pathPrefix</code> are only required for GitHub enterprise. options
 * @param {function(Object.<string, Issue>)} proceedWithIssues
 */
function initialiseIssues(options, proceedWithIssues) {
    if (undefined == issues) {
        console.info('initialising issues');
        //issues = {'1': 'one', '2': 'two'};
        var issuesApiFactory = require('../lib/issues/issues-api.js'),
            issuesApi = issuesApiFactory.getIssuesApi(options);
        issues = issuesApi.getIssues();
    } else if(undefined == issues.then) {
        console.info('already have issues:', issues);
        proceedWithIssues(issues);
        return;
    }

    issues.then(proceedWithIssues,
        //function (issues) {console.info('initIssues->proceedWithIssues', issues); proceedWithIssues(issues)},
        function (error) {
            console.error(error);
            this.emit('error', new PluginError(PLUGIN_NAME, 'Failed to load issues'));
        }
    );
}

/**
 * @param file
 * @param options
 * @param specAnnotations
 * @param {Object.<string, Issue>} issues mapped by ID
 */
function evaluateSpecAnnotationsInFile(file, options, specAnnotations, issues, callback) {
    var jasmineSpecFilter = new JasmineSpecFilter(issues, options);
    var specFileContent = jasmineSpecFilter.evaluateSpecAnnotationsInFile(file, specAnnotations);

    file.contents = new Buffer(specFileContent);

    callback(null, file);
}

/**
 * @param {{}=} options
 * @returns {*}
 */
module.exports = function(options) {
    options = _.extend({}, options);

    var processAnnotations = function(file, enc, callback) {
        if (file.isNull()) {
            // nothing to do
            callback(null, file);
        } else if (file.isStream()) {
            this.emit('error', new PluginError(PLUGIN_NAME, 'Streams not supported!'));
            callback();
            // file.contents is a Stream - https://nodejs.org/api/stream.html

            //file.contents = file.contents.pipe(rs(search, replacement));
            //return callback(null, file);
        } else if (file.isBuffer()) {
            // file.contents is a Buffer - https://nodejs.org/api/buffer.html
                var proceedWithIssues = _.partial(evaluateSpecAnnotationsInFile,
                                                    file, options, specAnnotations, _, callback);
                initialiseIssues(options, proceedWithIssues);
            }
        //}
    };

    return through.obj(processAnnotations);
};