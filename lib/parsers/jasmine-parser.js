var fs = require('fs');
var _ = require('underscore');
var semver = require('semver');

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
 * @param {string=} outputFilePath - if provided, the annotated specs will be saved to disk.
 * @param {Object=} config - optionally specifies release & issue to filter specs against
 * @return {string}
 */
exports.preprocess = function (input, issues, outputFilePath, config) {
    //var log = logger.create('test-filter.jasmine-parser');

    var ISSUE_REGEXP = /@issue ([^@(*/)]*)/;
    var GENERATED_REGEXP = / (?:\/\*)?\* @(status|release) ([^@(*/)]*)/;
    var output = '';

    output = parseSpecFile(input, output,
        // parseCommentLine
        function (line, annotations) {
            var match = line.match(GENERATED_REGEXP); // @issue and @release
            if (match) {
                var value = match[2].trim();
                // Save attr value just in case not specified in issue.
                // These values will be overridden by values
                // specified on the issues.
                if ('status' == match[1]) {
                    annotations.prevStatus = value;
                } else if ('release' == match[1]) {
                    annotations.prevRelease = value;
                }
                // remove previously generated annotations
                return false; //annotations.issues === undefined;
            }
            var issueAnnotation = line.match(ISSUE_REGEXP);
            if (issueAnnotation) {
                var testIssues = issueAnnotation[1].trim().split(' ');
                var status, release;
                for (var i = testIssues.length; i-- != 0;) {
                    var testIssue = issues[testIssues[i]];
                    if (undefined === testIssue) {
                        console.warn('Issue not found on server:', testIssues[i]);
                        console.info('  issues:', issues);
                    } else {
                        // if multiple status values go with the worst case scenario
                        // ie OPEN
                        status = testIssue.determinePriorityStatus(status);

                        // if multiple release values use the earliest release
                        // (to avoid early failures refactor the tests)
                        release = testIssue.determinePriorityRelease(release);
                    }
                }
                annotations.status = status;
                annotations.release = release;
                annotations.issues = testIssues;
            }
        },
        // processSpecDeclaration
        function (match, blockLevel, commentType, annotations, output) {
            if (commentType > 0 && _.keys(annotations).length != 0) {
                // remove the comment closing chars
                // match[1] holds the indentation chars
                output = output.substring(0, output.length - (commentType == 1 ? 3 : (match[1].length + 5)));
                var status = annotations.status || annotations.prevStatus;
                if (status) {
                    output += '\n' + match[1] + ' * @status ' + status;
                }
                var release = annotations.release || annotations.prevRelease;
                if (release) {
                    output += '\n' + match[1] + ' * @release ' + release;
                }
                output += '\n' + match[1] + ' */\n';
            }

            if (config && undefined !== config.issue
                && annotations.issues && annotations.issues.indexOf(config.issue) >= 0) {
                // focus specific suites/specs that match the specified issue
                output += match.input.replace(/^(\s*)[xf]?((d)escribe|(i)t)/, '$1$3$4$2');
            } else {
                output += match.input;
            }
            return output;
        },
        // processSpecBody
        function (match, annotations, output) {
            if( config && annotations ) {
                if ('open' == annotations.status) {
                    output += match[1] + '    pending(\'status: ' + annotations.status + '\'); // (test-filter)\n';
                } else {
                    var release = annotations.release || annotations.prevRelease;
                    if (undefined !== release) {
                        if (semver.lt(config.release, release)) {
                            output += match[1] + '    pending(\'release: ' + release + '\'); // (test-filter)\n';
                        }
                    }
                }
            }

            return output;
        }
    );
    if (outputFilePath) {
        fs.writeFileSync(outputFilePath, output);
    }
    // else console.info(output);
    return output;
};


/**
 * Called from test-filter's wrapper function
 * <code>runJasmineWithPreprocessorAndSpecFilter</code>
 * via JasmineSpecFilter.evaluateSpecAnnotations().
 * @param {string|Buffer} file - path or contents
 * @param {Object.<string, Object.<string, string>>} specAnnotations (output)
 *      eg: {'spec name': {'release': '1.0.0', 'status': 'open', 'issue': '1 2 3'}}
 */
exports.evaluateSpecAnnotations = function (file, specAnnotations) {
    var input = (typeof file == 'string') ?
                    (fs.existsSync(file) ? fs.readFileSync(file, {encoding: 'utf8'}) : file) :
                    file;
    var ANNOTATION_REGEXP = /@(issue|status|release) ([^@(*/)]*)/;
    var prevBlockLevel = 0;

    parseSpecFile(input, [],
        // parseCommentLine
        function (line, annotations) {
            var match = line.match(ANNOTATION_REGEXP);
            if (match) {
                annotations[match[1]] = match[2].trim();
            }
        },
        // processSpecDeclaration
        function (match, blockLevel, commentType, annotations, output) {
            var path = blockLevel == 0 ? match[3] : output[blockLevel - 1] + ' ' + match[3];
            // Update the path and annotations for the caller
            specAnnotations[path] = annotations;

            // update the internal graph
            output[blockLevel] = path;

            prevBlockLevel = blockLevel;
            return output;
        }
    );
};


/**
 * @param {string|Buffer} input
 * @param {string} output - 4th parameter to, and return value of processSpecDeclaration()
 * @param {function(string, Object)} parseCommentLine - return false if the line should be excluded from the output
 * @param {function(Array.<string>, number, number, Object, string)} processSpecDeclaration
 * @param {function(Object)} processSpecBody
 */
function parseSpecFile(input, output, parseCommentLine, processSpecDeclaration, processSpecBody) {
    var TEST_REGEXP = /(\s*)[fx]?(?:describe|it)\(\s*(?:"((?:[^"]|\")+)"|'((?:[^']|\')+)')/;
    var inComment = false, commentType = 0,
        blockLevel = 0,
        start = 0, end,
        annotations = [{}], line,
        enteredSpec, match;

    if ('string' != typeof input) {
        // provides Buffer.indexOf()
        require('buffertools').extend();
        input.substring = _.partial(input.toString, undefined);
    }

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
                commentType = 1;
            }
        }

        if (inComment) {
            var includeInOutput = parseCommentLine(line, annotations[blockLevel]);

            end = line.indexOf('*/');
            if (end >= 0) {
                inComment = false;
            } else {
                commentType = 2;
            }

            if (false === includeInOutput) {
                // line should be excluded from the output
                var startComment = line.indexOf('/**');
                if (startComment >= 0) {
                    // add an extra 3 because processSpecDeclaration will take it off again
                    line = line.substring(0, startComment + 3 + 3);
                } else {
                    continue;
                }
            };
        } else {
            match = line.match(TEST_REGEXP);
            if (match) {
                enteredSpec = blockLevel;
                output = processSpecDeclaration(match, blockLevel, commentType,
                                                annotations[blockLevel], output);
            }
            commentType = 0;

            // Update blockLevel
            for (var i = 0, quote = undefined; i < line.length; i++) {
                var c = line[i];
                if (undefined == quote) {
                    if ('/' == c && line[i+1] == '/') {
                        break;
                    } else if ('{' == c) {
                        blockLevel++;
                        annotations[blockLevel] = _.extend({}, annotations[blockLevel - 1]);
                    } else if ('}' == c) {
                        delete annotations[blockLevel];
                        blockLevel--;
                        annotations[blockLevel] = _.extend({}, annotations[blockLevel - 1]);
                    } else if (('"' == c || "'" == c) && i > 0 && line[i-1] != '\\') {
                        quote = c;
                    }
                } else if(quote == c) {
                    quote = undefined;
                }
            }

            if (match) {
                line = '';
            }
        }

        if (typeof output === 'string') {
            output += line + '\n';
            if (match && processSpecBody && blockLevel === enteredSpec + 1) {
                output = processSpecBody(match, annotations[enteredSpec], output);
                enteredSpec = -1;
            }
        }
    }

    return output;
};
