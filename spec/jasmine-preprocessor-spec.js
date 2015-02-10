var GitHubApi = require('../src/issues/github-api.js');
var gitHub = new GitHubApi();
var _ = require('underscore');
var jasminePreprocess = require('../src/parsers/jasmine-parser.js').preprocess;
//var jasmineSpecParser = new JasmineSpecParser('spec/**/*-spec.js');


xdescribe('skipped feature', function () {
    it('should never be executed', function() {
        expect(this).toBe('never executed');
    });
});

describe('jasmine preprocessor', function () {
    xit('skipped scenario', function() {
        expect(this).not.toBe('executed');
    });

    describe('spec parser', function () {
        /** @issue 7 */
        it('should parse annotations in spec files', function () {
            //var specs = jasmineSpecParser.parseSpecs();
            //expect(specs['jasmine preprocessor'])

            var inlineJavaDoc = '/** @issue ABC_123 ABC_456 */\n' +
                                'describe("inline javadoc", function () {\n' +
                                '  /** @issue ABC_789 */\n' +
                                '  describe(\'with nested describes\', function () {\n' +
                                '  /** @issue ABC_987 ABC_654 */\n' +
                                '    it("should process its also", function() {\n' +
                                '}) }) })';

            var multilineJavaDoc = '/**\n' +
                                ' * @issue ABC_123 ABC_456\n' +
                                ' */\n' +
                                'describe("multi-line javadoc", function () {\n' +
                                '  /** \n' +
                                '   * @issue ABC_789' +
                                '   */\n' +
                                '  describe(\'with nested describes\', function () {\n' +
                                '    /**\n' +
                                '     * @issue ABC_987 ABC_654' +
                                '     */\n' +
                                '    it("should process its also", function() {\n' +
                                '}) }) })';

            jasminePreprocess(inlineJavaDoc, issues)
        });
    });

    describe('JIRA integration', function () {
        /** @issue 5 */
        it('should download issue data from the server', function () {

        });
    });

    describe('GitHub integration', function () {
        var error, issues;

        beforeEach(function (done) {
            jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

            gitHub.getIssues({
                user: 'nalbion',
                repo: 'test-filter'
            }, function (response_error, response_data) {
                error = response_error;
                issues = response_data;
                done();
            });
        });

        /** @issue 2 */
        it('should download issue data from the server', function () {
            expect(error).toBeNull();
            expect(issues).toBeDefined();
            expect(_.keys(issues).length).toBeGreaterThan(5);
        });

        ///** @issue 1 */
        //it('should skip open issues', function () {
        //    expect('this test').toBe('skipped because "https://github.com/nalbion/test-filter/issues/1" is OPEN');
        //});

        ///** @issue 3 */
        //it('should skip tests linked to issues flagged for future releases', function () {
        //    expect('this').not.toBe('executed until release 100.0.0');
        //});

        /** @issue 6 */
        it('should support optional OAuth2 token/secret for private repos', function () {

        });
    });

    describe('command line options', function () {
        /** @issue 3 */
        it('should skip test that do not match the "release" parameter', function () {

        });

        it('should skip tests that do not match the "issue" parameter', function () {

        });

        /** @issue 4 */
        it('should skip tests that do not match the "status" parameter', function () {

        });
    });
});