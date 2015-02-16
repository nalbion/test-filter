var _ = require('underscore');

//var TestFilter = function () {};
//TestFilter.prototype.bla = function () {
//};
//// var bla = require('test-filter');
//// bla.bla();
//module.exports = new TestFilter();
//
//// var TestFilter = require('test-filter');
//// var testFilter = new TestFilter();
//// testFilter.bla();
//module.exports = TestFilter;
//
//// var TestFilter = require('test-filter').TestFilter;
//// var testFilter = new TestFilter();
//// testFilter.bla();
//exports.TestFilter = TestFilter;



// var TestFilter = require('test-filter');
// var testFilter = new TestFilter();
// testFilter.bla();

/**
 * @constructor
 */
var TestFilter = function (config) {
    //this.markSkippedAsPending = false;
    this.createJasmineSpecFilter = function() {
        var JasmineSpecFilter = require('./tools/jasmine/jasmine-spec-filter');
        var jasmineSpecFilter = new JasmineSpecFilter();
        //var specFilter = _.bind(jasmineSpecFilter.specFilter, this);
        var specFilter = jasmineSpecFilter.jasmineSpecFilter;

        jasmine.getEnv().specFilter = specFilter;
        jasmine.getEnv().addReporter( jasmineSpecFilter );

        return specFilter;
    }
};

///**
// * Called from Jasmine to check if each spec should be executed
// * <pre>
// *     var TestFilter = require('test-filter');
// *     var testFilter = new TestFilter(require('./package.json'));
// *     jasmine.getEnv().specFilter = testFilter.jasmineSpecFilter
// * </pre>
// *
// * @param spec {id: 'spec0', description: 'value of "it" string',
// *                 userContext: function():Object  (empty object)
// *                 result: { fullName: 'absolute path of "describe"s and "it" strings"' }
// * @returns {boolean}
// * <strike>@ this {Jasmine}</strike>
// */
////exports.specFilter = function (spec) {
//TestFilter.prototype._jasmineSpecFilter = function (spec) {
//    //console.info(spec.description);
//    //console.info(spec.id, spec.result.fullName);
//    //console.info(this);
//    //runnableLookupTable[spec.id]
//    //console.info(spec);
//    //console.info(spec.userContext());
//    //console.info(spec.beforeAndAfterFns().befores)
//    //spec.result.pendingReason = 'Nick hacked it';
//    //return specFilter.matches(spec.getFullName());
//    //if (this.markSkippedAsPending) {
//    //    spec.pend('Nick hacked it');
//    //    return true;
//    //} else {
//    //    return false;
//    //}
//    return true;
//};


module.exports = TestFilter;



//jasmine.getEnv().specFilter = testFilter.jasmineSpecFilter;

//// PUBLISH DI MODULE for Karma
//module.exports = {
//  'preprocessor:test-filter': ['factory', require('./karma-test-filter-preprocessor')]
//};
