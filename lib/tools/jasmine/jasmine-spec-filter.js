var _ = require('underscore'),
    fs = require('fs'),
    semver = require('semver'),
    jasmineParser = require('../../parsers/jasmine-parser.js');

/**
 * @param {Object.<string, GitHubIssue>} issues mapped by ID
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

//JasmineSpecFilter.prototype.jasmineStarted = function(summary) {
//    console.info('jasmine-spec-filter jasmine started...');
//};
//JasmineSpecFilter.prototype.suiteStarted = function(suite) {
//    console.info('jasmine-spec-filter suite started');
//};
//JasmineSpecFilter.prototype.specStarted = function(spec) {
////TODO: uncomment if useful       console.info('jasmine-spec-filter spec started', spec.fullName);
//};
//JasmineSpecFilter.prototype.specDone = function(spec) {
//    console.info('jasmine-spec-filter spec done');
//};
//JasmineSpecFilter.prototype.suiteDone = function(suite) {
//    console.info('jasmine-spec-filter suite done');
//};
//JasmineSpecFilter.prototype.jasmineDone = function (jasmine) {
//    console.info('jasmine-spec-filter done!');
//};

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
    var specName;
    if (undefined !== spec.result) {
        specName = spec.result.fullName;
    } else {
        // minijasmin 1.3.1 used by protractor
        specName = spec.suite.description;
        var parent = spec.parentSuite;
        while (parent != null) {
            specName = parent.description + ' ' + specName;
            parent = parent.parentSuite;
        }
        specName += ' ' + spec.description;
    }

    var annotations = JasmineSpecFilter.specAnnotations[specName];
    if (annotations == null) {
        console.info('no annotations found for spec:', specName);
    }
    //console.info('specFilter for:', spec.id, specName);

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
 * Called from Jasmine via our customised loadSpecs() method
 * @param {File|string} file - Vinyl File from gulp, or the file path
 * @param {Object.<string, Object.<string, string>>} specAnnotations (output)
 *      eg: {'spec name': {'release': '1.0.0', 'status': 'open', 'issue': '1 2 3'}}
 * @return {string} the processed specFileContent
 */
JasmineSpecFilter.prototype.evaluateSpecAnnotationsInFile = function (file, specAnnotations) {
    var specFileContent;
    if ('string' == typeof file) {
        specFileContent = fs.readFileSync(file, {encoding: 'utf8'});
    } else {
        // Vinyl File from Gulp with Buffer (or Stream?)
        specFileContent = file.contents;
        file = file.path;
    }

    if (this.issues) {
        console.info('Preprocessing @issue annotations in', file);
        specFileContent = this.preprocess(specFileContent, this.issues,
            this.preserveSpecs ? undefined : file );
    }

    jasmineParser.evaluateSpecAnnotations(specFileContent, specAnnotations);
    JasmineSpecFilter.specAnnotations = specAnnotations;

    return specFileContent;
};

module.exports = JasmineSpecFilter;
