var _ = require('underscore'),
    path = require('path'),
    glob = require('glob');

/**
 * @constructor
 */
var JasmineSpecFilter = function(options) {
    this.markSkippedAsPending = false;
    this.jasmineSpecFilter = _.bind(this.specFilter, this);

    options = _.extend({
        configFilePath: 'spec/support/jasmine.json'
    }, options);

    this.projectBaseDir = options.projectBaseDir || path.resolve();

    var absoluteConfigFilePath = path.resolve(this.projectBaseDir, options.configFilePath);
    var config = require(absoluteConfigFilePath);

    this.specDir = config.spec_dir || 'spec';
    this.specAnnotations = this.evaluateSpecAnnotations(config);
}

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

    console.info('specFilter for: ', spec.id, spec.result.fullName);
    console.info(annotations);

    //runnableLookupTable[spec.id]
    //console.info(spec);
    //console.info(spec.beforeAndAfterFns().befores)
    //spec.result.pendingReason = 'Nick hacked it';
    //return specFilter.matches(spec.getFullName());
    if (this.markSkippedAsPending) {
        spec.pend('Nick hacked it');
        return true;
    } else {
        return true;
        //return false;
    }
};

/**
 * Scans through Jasmine spec files, capturing all annotations that apply to each spec.
 * @param {{spec_files: Array.<string>}} config
 * @return {Object.<string, Object.<string, string>>}
 *      eg: {'spec name': {'release': '1.0.0', 'status': 'open', 'issue': '1 2 3'}}
 */
JasmineSpecFilter.prototype.evaluateSpecAnnotations = function (config) {
    var specAnnotations = {},
        jasmineParser = require('../../parsers/jasmine-parser.js'),
        files = config.spec_files,
        specFiles = [],
        projectBaseDir = this.projectBaseDir,
        specDir = this.specDir;

    files.forEach(function(specFile) {
        var filePaths = glob.sync(path.join(projectBaseDir, specDir, specFile));
        filePaths.forEach(function(filePath) {
            if(specFiles.indexOf(filePath) === -1) {
                specFiles.push(filePath);
            }
        });
    });


    for (var i = 0; i < specFiles.length; i++) {
        jasmineParser.evaluateSpecAnnotations(specFiles[i], specAnnotations);
    }

    return specAnnotations;
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