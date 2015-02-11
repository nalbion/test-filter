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
        output = '', line,
        status, milestone;

    while (start >= 0) {
        end = input.indexOf('\n', start + 1);
		if (end > 0) {
			line = input.substring(start, end);
            start = end + 1;
		} else {
			// no EOL on last line
			line = input.substring(start);
            start = -1;
		}

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

			end = line.substring(0, '*/');
            if (end >= 0) {
                inComment = false;
				//line = line.substring(0, end);
            }
			out += line + '\n';
        } else if (status || milestone) {
            match = /\s*(?:describe|it)\(?:"((?:[^"]|\\")+)"|'((?:[^']|\\')+)'),\s*function\s*(/.match(line):
			if (match) 	{
				// remove the comment closing chars
				line = line.substring(0, line.length - 3);
			}
        }
    }

    return output;
};
