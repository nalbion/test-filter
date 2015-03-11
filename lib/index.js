var _ = require('underscore');

/**
 * @constructor
 */
var TestFilter = function () {
};

///**
// * @param jasmine
// * @param {{system: string=, host: string=, pathPrefix: string=,
// *          preserveSpecs: boolean, offline: boolean,
// *          release: string, issueNumber: string=}} config
// *      <code>system</code> is only required if <code>bugs.url</code> is not specified in <code>package.json</code>
// *        and the URL does not imply the system used.  Valid values: 'github' or 'bitbucket'.
// *     <code>host</code> and <code>pathPrefix</code> are only required for GitHub enterprise.
// */
//TestFilter.filterJasmineSpecs = function (jasmine, options) {
//    options = _.extend({}, options);
//
//    if (!options.release) {
//        var path = require('path'),
//            pkg = require(path.resolve('package.json'));
//        options.release = pkg.version;
//    }
//
//    //console.info('loadSpecs:', jasmine);
//
//    if (!options.offline) {
//        var issuesApiFactory = require('./issues/issues-api.js'),
//            issuesApi = issuesApiFactory.getIssuesApi(options);
//
//        /** @type {Promise} */
//        issuesApi.getIssues().then(function (issues) {
//            var JasmineSpecFilter = require('../lib/tools/jasmine/jasmine-spec-filter');
//            var jasmineSpecFilter = new JasmineSpecFilter(issues, options);
//
//// Doesn't work - not implemented in minijasminenode?
//            // Swap in a customised loadSpecs() method
//            var specAnnotations = {},
//                originalLoadSpecs = _.bind(jasmine.loadSpecs, jasmine);
//            jasmine.loadSpecs = function () {
//                this.specFiles.forEach(function (file) {
//                    jasmineSpecFilter.evaluateSpecAnnotationsInFile(file, specAnnotations);
//                });
//                originalLoadSpecs();
//            };
//
//            // Use our spec filter
//            jasmine.env.specFilter = jasmineSpecFilter.jasmineSpecFilter;
////                                   _.bind(jasmineSpecFilter.specFilter, this);
//        });
//    }
//};

module.exports = TestFilter;
