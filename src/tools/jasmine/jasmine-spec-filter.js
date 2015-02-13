// jasmine env.specFilter = require('test-filter').jasmineSpecFilter;

// var test_filter = require('test-filter');
// test_filter();
module.exports = function () {
	
};



// var jasmineSpecFilter = require('test-filter').jasmineSpecFilter;
// jasmineSpecFilter();
/** Called from Jasmine to check if each spec should be executed */
exports.jasmineSpecFilter = function (spec) {
    return true;
};

//var markSkippedAsPending = false;
//
//jasmine.getEnv().specFilter = function(spec) {
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



	
/* jasmine reporter events: 
'jasmineStarted',
      'jasmineDone',
      'suiteStarted',
      'suiteDone',
      'specStarted',
      'specDone'
*/
this.suiteDone = function(result) {
      storeSuite(result);
    };
