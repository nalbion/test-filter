var GitHubApi = require('../src/issues/github-api.js');
var gitHub = new GitHubApi();
var _ = require('underscore');
var fs = require('fs');
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
            var inlineJavaDoc = fs.readFileSync('../test/fixtures/single-line-jasmine-comments.js',
                                                {encoding: 'utf8'});
            var multilineJavaDoc = fs.readFileSync('../test/fixtures/multi-line-jasmine-comments.js',
                                                {encoding: 'utf8'});

            // {id, status, reporter, assignee, labels, release}
            var issues = {
                'ABC_123': {status: 'open'},
                'ABC_456': {status: 'closed', release: '1.0.0'},
                'ABC_789': {status: 'open', release: '2.0.0'},
                'ABC_987': {status: 'closed'},
                'ABC_654': {status: 'closed'}
            };

            var output = jasminePreprocess(inlineJavaDoc, issues);
            fs.writeFileSync('../test/fixtures/expected/single-line-jasmine-comments.js', output);

            output = jasminePreprocess(multilineJavaDoc, issues);
            fs.writeFileSync('../test/fixtures/expected/multi-line-jasmine-comments.js', output);
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