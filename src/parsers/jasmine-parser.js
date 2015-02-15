var fs = require('fs');
var _ = require('underscore');

var testAnnotations = {};

/**
 * Called by karma-test-filter-preprocessor
 *
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
    var GENERATED_REGEXP = / \* @(status|release) ([^@(*/)]*)/;
    var singleLineComment, output = '';

    output = parseSpecFile(input, output,
        function (line, annotations) {
            var match = line.match(GENERATED_REGEXP); // @issue and @release
            if (match) {
                // Save attr value just in case not specified in issue.
                // These values will be over-rided by values
                // specified on the issues.
                if ('status' == match[1]) {
                    annotations.prevStatus = match[2];
                } else if ('release' == match[1]) {
                    annotations.prevRelease = match[2];
                }
                // remove previously generated annotations
                return false;
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
                        annotations.status = testIssue.determinePriorityStatus(annotations.status);

                        // if multiple release values use the earliest release
                        // (to avoid early failures refactor the tests)
                        annotations.release = testIssue.determinePriorityRelease(annotations.release);
                    }
                }
            }
        },
        function (match, singleLineComment, annotations, output) {
            if (_.keys(annotations).length != 0) {
                // remove the comment closing chars
                output = output.substring(0, output.length - (singleLineComment ? 3 : (match[1].length + 5)));
                var status = annotations.status || annotations.prevStatus;
                if (status) {
                    output += '\n' + match[1] + ' * @status ' + status;
                }
                var release = annotations.release || annotations.prevRelease;
                if (release) {
                    output += '\n' + match[1] + ' * @release ' + release;
                }
                output += '\n' + match[1] + ' */\n';
                return output;
            }
        }
    );

    if (outputFilePath) {
        fs.writeFileSync(outputFilePath, output);
    }
    return output;
};


/**
 *
 * @param {string} file
 * @param {Object.<string, Object.<string, string>>} specAnnotations (output)
 *      eg: {'spec name': {'release': '1.0.0', 'status': 'open', 'issue': '1 2 3'}}
 */
exports.evaluateSpecAnnotations = function (file, specAnnotations) {
    var input = fs.readFileSync(file, {encoding: 'utf8'});
    var ANNOTATION_REGEXP = / \* @(issue|status|release) ([^@(*/)]*)/;
    //specAnnotations.rootPath = '';

    parseSpecFile(input, {path: ''},
        function (line, annotations) {
            var match = line.match(ANNOTATION_REGEXP);
            if (match) {
                annotations[match[1]] = match[2];
            }
        },
        function (match, singleLineComment, annotations, output) {
            var path;
            //if (undefined !== match[2]) {
            //    console.info(match[2], ': ', match[3]);
                path = output.path + ' ' + match[2];
            //} else {
            //    console.info(match[2], ': ', match[3]);
                path = output.path + ' ' + match[3];
            //}

            console.info('path: ', path);
            output.path = path;
            return output;
        }
    )
};


/**
 * @param {string} input
 * @param {string} output - 4th parameter to, and return value of processSpecDeclaration()
 * @param {function(string, Object)} parseCommentLine - return false if the line should be excluded from the output
 * @param {function(Array.<string>, boolean, string, string)} processSpecDeclaration
 */
function parseSpecFile(input, output, parseCommentLine, processSpecDeclaration) {
    //var ISSUE_REGEXP = /@issue ([^@(*/)]*)/;
    //var GENERATED_REGEXP = / \* @(status|release) ([^@(*/)]*)/;
    var TEST_REGEXP = /(\s*)[fx]?(?:describe|it)\(\s*(?:"((?:[^"]|\")+)"|'((?:[^']|\')+)')/;
    var OPEN_BLOCK_REGEXP = /{[^'"]*$/;
    var CLOSE_BLOCK_REGEXP = /}[^'"]*$/;
    var inComment = false, singleLineComment,
        start = 0, end,
        annotations, line;

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
                annotations = {};
            }
        }

        if (inComment) {
            if (false === parseCommentLine(line, annotations) ) {
                continue;
            };

            end = line.indexOf('*/');
            if (end >= 0) {
                inComment = false;
            } else {
                singleLineComment = false;
            }
        } else {
            var match = line.match(TEST_REGEXP);
            if (match) {
                output = processSpecDeclaration(match, singleLineComment, annotations, output);
            }
        }

        if (typeof output === 'string') {
            output += line + '\n';
        }
    }

    return output;
};