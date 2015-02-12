var fs = require('fs');

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
 * @param {string=} outputFilePath
 * @return {string}
 */
exports.preprocess = function (input, issues, outputFilePath) {
    //var log = logger.create('test-filter.jasmine-parser');

    var ISSUE_REGEXP = /@issue ([^@(*/)]*)/;
    var GENERATED_REGEXP = / \* @(status|release) .*/;
    var TEST_REGEXP = /(\s*)(?:describe|it)\(\s*(?:"((?:[^"]|\")+)"|'((?:[^']|\')+)')/;
    var pathArray = [],
        inComment = false, singleLineComment,
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
            if (0 == line.length) {
                break;
            }
            start = -1;
		}

        // detect javadoc-style comments
        // support single-line javadoc comments
        if (!inComment) {
            if (line.indexOf('/**') >= 0) {
                inComment = true;
                singleLineComment = true;
                status = milestone = undefined;
            }
        }

        //support optional -version=0.0.1
        //support optional -issue=ABC_1
        if (inComment) {
            if (line.match(GENERATED_REGEXP)) {
                singleLineComment = false;
                continue;
            }
            var issueAnnotation = line.match(ISSUE_REGEXP);
            if (issueAnnotation) {
                var testIssues = issueAnnotation[1].trim().split(' ');
                for (var i = testIssues.length; i-- != 0;) {
                    var testIssue = issues[testIssues[i]];
                    if (undefined === testIssue) {
                        console.warn('Issue not found on server:', testIssues[i]);
                    } else {
                        // if multiple status values go with the worst case scenario
                        // ie OPEN
                        status = testIssue.determinePriorityStatus(status);

                        // if multiple milestone values use the earliest milestone
                        // (to avoid early failures refactor the tests)
                        milestone = testIssue.determinePriorityMilestone(milestone);
                    }
                }
            }

			end = line.indexOf('*/');
            if (end >= 0) {
                inComment = false;
            } else {
                singleLineComment = false;
            }
        } else if (status || milestone) {
            var match = line.match(TEST_REGEXP);
			if (match) {
				// remove the comment closing chars
				output = output.substring(0, output.length -
                                        (singleLineComment ? 3 : (match[1].length + 5)));
                if (status) {
                    output += '\n' + match[1] + ' * @status ' + status;
                }
                if (milestone) {
                    output += '\n' + match[1] + ' * @release ' + milestone;
                }
                output += '\n' + match[1] + ' */\n';
			}
        }
        output += line + '\n';
    }

    if (outputFilePath) {
        fs.writeFileSync(outputFilePath, output);
    }
    return output;
};
