// jasmine env.specFilter = require('test-filter').jasmineSpecFilter;

// var test_filter = require('test-filter');
// test_filter();
module.exports = function () {
	
};


//var markSkippedAsPending = false;

///**
// * Called from Jasmine to check if each spec should be executed
// * <pre>
// *     var TestFilter = require('test-filter');
// *     var testFitler = new TestFilter();
// *     jasmine.getEnv().specFilter = testFilter.jasmineSpecFilter
// * </pre>
// *
// * @param spec
// * @returns {boolean}
// * @this {Jasmine}
// */
//exports.specFilter = function (spec) {
//    //console.info(spec.description);
//    console.info(spec.result.fullName);
//    //runnableLookupTable[spec.id]
//    //console.info(spec);
//    //console.info(spec.beforeAndAfterFns().befores)
//    //spec.result.pendingReason = 'Nick hacked it';
//    //return specFilter.matches(spec.getFullName());
//    if (markSkippedAsPending) {
//        spec.pend('Nick hacked it');
//        return true;
//    } else {
//        return false;
//    }
//};

	
///* jasmine reporter events:
//'jasmineStarted',
//      'jasmineDone',
//      'suiteStarted',
//      'suiteDone',
//      'specStarted',
//      'specDone'
//*/
//this.suiteDone = function(result) {
//      storeSuite(result);
//    };
