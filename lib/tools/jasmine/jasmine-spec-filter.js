var _ = require('underscore'),
    fs = require('fs'),
    semver = require('semver'),
    jasmineParser = require('../../parsers/jasmine-parser.js');

/**
 * @param {Object.<string, GitHubIssue>} issues
 * @param {{preserveSpecs: boolean, release: string, issueNumber: string=}} config
 *      release - don't run tests scheduled beyond this release/version/milestone
 *      issueNumber - optionally restrict test execution to those annotated with a given issue number
 * @constructor
 */
var JasmineSpecFilter = function(issues, config) { // preserveSpecs, release, issueNumber) {
    this.markSkippedAsPending = true;
    this.jasmineSpecFilter = _.bind(this.specFilter, this);

    this.issues = issues;
    this.preserveSpecs = config.preserveSpecs;
    this.preprocess = require('../../parsers/jasmine-parser.js').preprocess;
    this.release = config.release;
    this.issueNumber = config.issueNumber;
};

/**
 * Called from Jasmine to check if each spec should be executed
 * <pre>
 *     var TestFilter = require('test-filter');
 *     var testFitler = new TestFilter();
 *     jasmine.getEnv().specFilter = testFilter.createJasmineSpecFilter();
 * </pre>
 *
 * @param spec
 * @returns {boolean}
 * @private (accessed via bound jasmineSpecFilter() method)
 */
JasmineSpecFilter.prototype.specFilter = function (spec) {
    var annotations = this.specAnnotations[spec.result.fullName];
    //console.info('specFilter for:', spec.id, spec.result.fullName);

    if (undefined !== this.issueNumber &&
        (undefined === annotations || this.issueNumber !== annotations.issue) ) {
        //console.info("this is not the test you're looking for.", annotations.issue, spec.result.fullName);
        //spec.pend('issue: ' + annotations.issue);
        return false;
    }

    if( annotations ) {
        //console.info(annotations);
        if ('open' == annotations.status) {
            if (this.markSkippedAsPending) {
                spec.pend('status: ' + annotations.status);
                return true;
            } else {
                return false;
            }
        } else if (undefined !== annotations.release) {
            if (semver.lt(this.release, annotations.release)) {
                if (this.markSkippedAsPending) {
                    spec.pend('release: ' + annotations.release);
                    return true;
                } else {
                    return false;
                }
            }
        }
    }

    return true;
};

/**
 * Scans through Jasmine spec files, capturing all annotations that apply to each spec.
 *
 * Requires the following properties to be set on <code>this</code>:
 *  updateSpec: boolean
 *  projectBaseDir: string
 *  specDir: string
 *
 * @param {{spec_files: Array.<string>}} config
 * @return {Object.<string, Object.<string, string>>}
 *      eg: {'spec name': {'release': '1.0.0', 'status': 'open', 'issue': '1 2 3'}}
 */
//JasmineSpecFilter.prototype.evaluateSpecAnnotations = function (config) {
//    var specAnnotations = {},
//        files = config.spec_files,
//        specFiles = [],
//        projectBaseDir = this.projectBaseDir,
//        specDir = this.specDir;
//
//    files.forEach(function(specFile) {
//        var filePaths = glob.sync(path.join(projectBaseDir, specDir, specFile));
//        filePaths.forEach(function(filePath) {
//            if(specFiles.indexOf(filePath) === -1) {
//                specFiles.push(filePath);
//            }
//        });
//    });
//
//    for (var i = 0; i < specFiles.length; i++) {
//        evaluateSpecAnnotationsInFile(specFiles[i]);
//    }
//
//    return specAnnotations;
//};

/**
 * Called from Jasmine via our customised loadSpecs() method
 */
JasmineSpecFilter.prototype.evaluateSpecAnnotationsInFile = function (file, specAnnotations) {
    var specFileContent = fs.readFileSync(file, {encoding: 'utf8'});

    if (this.issues) {
        console.info('Preprocessing @issue annotations in', file);
        specFileContent = this.preprocess(specFileContent, this.issues,
            this.preserveSpecs ? undefined : file );
    }

    jasmineParser.evaluateSpecAnnotations(specFileContent, specAnnotations);
    this.specAnnotations = specAnnotations;
};

///* jasmine reporter events:
//'jasmineStarted',
//      'jasmineDone',
//      'suiteStarted',
//      'suiteDone',
//      'specStarted',
//      'specDone'
//*/
///**
// * @param {{totalSpecsDefined: number}} s
// */
//JasmineSpecFilter.prototype.jasmineStarted = function (s) {
//    console.info('jasmineStarted');
//    //console.info(loadConfig);
//    //console.info('jasmineStarted:', s);
//    //console.info(this);
//    //console.info(jasmine.getEnv().specFiles);
//}
//
///**
// * @param {{id: string, description: string, fullName: string}} suite
// *      eg: {id: 'suite1',
// *          description: 'value of "describe"',
// *          fullName: 'full path of parent and this value of "describe"'}
// */
//JasmineSpecFilter.prototype.suiteStarted = function (suite) {
//    console.info('suiteStarted:', suite.id, suite.description);
//    console.info('   ', suite.fullName);
//};

module.exports = JasmineSpecFilter;
