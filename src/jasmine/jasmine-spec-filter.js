// jasmine env.specFilter = require('test-filter').jasmineSpecFilter;

module.export

jasmineSpecFilter = function() {
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
