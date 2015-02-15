/**
 * @constructor
 */
var JasmineSpecFilter = function() {
    this.markSkippedAsPending = false;
    this.jasmineSpecFilter = _.bind(this.specFilter, this);
}

/**
 * Called from Jasmine to check if each spec should be executed
 * <pre>
 *     var TestFilter = require('test-filter');
 *     var testFitler = new TestFilter();
 *     jasmine.getEnv().specFilter = testFilter.jasmineSpecFilter
 * </pre>
 *
 * @param spec
 * @returns {boolean}
 * @this {Jasmine}
 */
JasmineSpecFilter.prototype.specFilter = function (spec) {
    //console.info(spec.description);
    console.info('specFilter for: ', spec.id, spec.result.fullName);
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
 * @param {{files: Array.<string>}} config
 */
JasmineSpecFilter.prototype.evaluateSpecAttributes = function (config) {
    var files = config.files;
    for (var i = 0; i < files.length; i++) {

    }

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
//    console.info('jasmineStarted:', s);
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