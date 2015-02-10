/**
 * Example:
 * <pre>
 * /**
 *  * @release 1.0.0
 *  * @issue ABC_1 ABC_2 ABC_3
 *  * @status OPEN
 *  * @pre-filter enabled
 *  *&slash;
 * describe('jasmine example', function() {
 *   /**
 *    * @release 1.0.0
 *    * @issue ABC_1 ABC_2 ABC_3
 *    * @status OPEN
 *    * @pre-filter enabled
 *    *&slash;
 *   it('has annotations on "describe" and "it"', function() {
 *   }
 * )
 * </pre>
 *
 * @param {string} input
 * @param {Object.<string, GitHubIssue>} issues - indexed by issue ID
 *                {id, status, reporter, assignee, labels, release}
 * @return {string}
 */
exports.preprocess = function (input, issues) {
    // scan through the input string
    // build up maps "describes" and

    var pathArray = [],
        inComment = false,
        start = 0, end,
        output = '',
        status, milestone;

    do {
        end = input.indexOf('\n', start + 1);
        var line = input.substring(start, end);
        start = end + 1;

        // detect javadoc-style comments
        // support single-line javadoc comments
        if (!inComment) {
            if (line.indexOf('/**') >= 0) {
                inComment = true;
                status = milestone = undefined;
            }
        }

        //support optional -version=0.0.1
        //support optional -issue=ABC_1
        // TODO unit test
        if (inComment) {
            var issueAnnotation = /@issue ((?!@|\*\/)+)/.match(line);
            if (issueAnnotation) {
                var testIssues = issueAnnotation.split(' ');
                for (testIssue in testIssues) {
                    testIssue = issues[testIssue];
                    // if multiple status values go withwith the worst case scenario
                    // ie OPEN
                    status = testIssue.determinePriorityStatus(status);

                    // if multiple milestone values use the earliest milestone
                    // (to avoid early failures refactor the tests)
                    milestone = testIssue.determinePriorityMilestone(milestone);
                }
            }

            if (line.indexOf('*/') >= 0) {
                inComment = false;
            }
        } else {

        }
    }

    return 'describe("replaced", function(){' +
        'it("should be replaced", function(){' +
        'expect(true).toBe(true);' +
        '})' +
        '})'; //util.format(TEMPLATE, htmlPath, escapeContent(content)));
};