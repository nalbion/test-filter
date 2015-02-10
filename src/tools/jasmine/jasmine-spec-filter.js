// jasmine env.specFilter = require('test-filter').jasmineSpecFilter;

// var test_filter = require('test-filter');
// test_filter();
module.exports = function () {
	
};

/**
 * @param input
 * @param {Object.<string, Object>} issues - 
 number, status, reporter, assignee, labels, release}}
 */
exports.preprocess = function (input, issues) {
	// scan through the input string
	// build up maps "describes" and 
	
	var pathArray = [],
	    inComment = false,
		output = '',
		status, milestone;
	
	for (line in input) {
		// detect javadoc-style comments
		// support single-line javadoc comments
		if (!inComment) {
			if (line.indexOf('/**') >= 0) {
				inComment = true;
				status = milestone = undefined;
			}
		}
		// TODO unit test
		if (inComment) {
			var issueAnnotation = /@issue ((?!@|\*\/)+)/.match(line);
			if (issueAnnotation) {
				var testIssues = issueAnnotation.split(' ');
				for (testIssue in testIssues) {
					testIssue = issues[testIssue];
					// if multiple status values
					// go withwith the worst case scenario
					// ie OPEN
					status = testIssue.determinePriorityStatus(status);
		
					// if multiple milestone values
					// use the earliest milestone
					// (to avoid early failures refactor the tests)
					milestone = testIssue.determinePriorityMilestone(milestone);
				}
			}
			
			if (line.indexOf('*/') >= 0) {
				inComment = false;
			}
		}
	}
	
    return 'describe("replaced", function(){' +
            'it("should be replaced", function(){' +
                    'expect(true).toBe(true);' +
                '})' +
        '})'; //util.format(TEMPLATE, htmlPath, escapeContent(content)));
};

// var jasmineSpecFilter = require('test-filter').jasmineSpecFilter;
// jasmineSpecFilter();
/** Called from Jasmine to check if each spec should be executed */
exports.jasmineSpecFilter = function () {
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
