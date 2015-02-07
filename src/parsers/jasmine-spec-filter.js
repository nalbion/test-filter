// jasmine env.specFilter = require('test-filter').jasmineSpecFilter;

// var test_filter = require('test-filter');
// test_filter();
module.exports = function () {

};

// var jasmineSpecFilter = require('test-filter').jasmineSpecFilter;
// jasmineSpecFilter();
/** Called from Jasmine to check if each spec should be executed */
exports.jasmineSpecFilter = function () {
    return true;
};




	
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
