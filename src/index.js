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
    this.specFilter = _.bind(this._specFilter, this);
};

/**
 * Called from Jasmine to check if each spec should be executed
 * <pre>
 *     var TestFilter = require('test-filter');
 *     var testFilter = new TestFilter(require('./package.json'));
 *     jasmine.getEnv().specFilter = testFilter.jasmineSpecFilter
 * </pre>
 *
 * @param spec
 * @returns {boolean}
 * @this {Jasmine}
 */
//exports.specFilter = function (spec) {
TestFilter.prototype._specFilter = function (spec) {
    //console.info(spec.description);
    console.info(spec.result.fullName);
    //runnableLookupTable[spec.id]
    //console.info(spec);
    //console.info(spec.beforeAndAfterFns().befores)
    //spec.result.pendingReason = 'Nick hacked it';
    //return specFilter.matches(spec.getFullName());
    if (markSkippedAsPending) {
        spec.pend('Nick hacked it');
        return true;
    } else {
        return false;
    }
};


module.exports = TestFilter;


//jasmine.getEnv().specFilter = testFilter.jasmineSpecFilter;

//// PUBLISH DI MODULE for Karma
//module.exports = {
//  'preprocessor:test-filter': ['factory', require('./karma-test-filter-preprocessor')]
//};
