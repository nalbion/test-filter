var GitHubApi = require('../lib/issues/github-api.js');
var gitHub = new GitHubApi();
var _ = require('underscore');
var fs = require('fs');
var jasmineParser = require('../lib/parsers/jasmine-parser.js');
var jasminePreprocess = jasmineParser.preprocess;
//var jasmineSpecParser = new JasmineSpecParser('spec/**/*-spec.js');


xdescribe('skipped feature', function () {
    it('should never be executed', function () {
        expect(this).toBe('never executed');
    });
});

describe('jasmine spec filter', function () {
   it('should evaluate spec annotations', function () {
       var specAnnotations = {};

       jasmineParser.evaluateSpecAnnotations('test/fixtures/test-spec.js',
                                            specAnnotations);
       var spec = specAnnotations['karma test should skip open issues'];
       expect(spec.status).toBe('open');
       expect(spec.issue).toBe('1');
       expect(spec.release).toBeUndefined();

       spec = specAnnotations['karma test should say "Hello dude!" - but not until release 100.0.0'];
       expect(spec.status).toBeUndefined();
       expect(spec.issue).toBeUndefined();
       expect(spec.release).toBe('100.0.0');

       spec = specAnnotations['other test'];
       expect(spec.status).toBe('closed');
       expect(spec.issue).toBeUndefined();
       expect(spec.release).toBe('1.0.0');

       spec = specAnnotations['other test and another nested describe also has another "it"'];
       expect(spec.status).toBe('open');
       expect(spec.issue).toBeUndefined();
       expect(spec.release).toBe('1.2.2');

       spec = specAnnotations['specs without annotations'];
       expect(spec.status).toBeUndefined();
       expect(spec.issue).toBeUndefined();
       expect(spec.release).toBeUndefined();

       spec = specAnnotations['specs without annotations at any level should evaluate without annotations'];
       expect(spec.status).toBeUndefined();
       expect(spec.issue).toBeUndefined();
       expect(spec.release).toBeUndefined();

       spec = specAnnotations['specs without annotations except here and with extra level should evaluate with an issue annotation'];
       expect(spec.status).toBeUndefined();
       expect(spec.issue).toBe('1');
       expect(spec.release).toBeUndefined();

       spec = specAnnotations['specs without annotations except here should still evaluate with issue annotation'];
       expect(spec.status).toBeUndefined();
       expect(spec.issue).toBe('1');
       expect(spec.release).toBeUndefined();
   })
});

describe('jasmine preprocessor', function () {
    xit('skipped scenario', function() {
        expect(this).not.toBe('executed');
    });

    describe('spec parser', function () {
        /** @issue 7
         * @status closed
         */
        it('should parse annotations in spec files', function () {
            var inlineJavaDoc = fs.readFileSync('test/fixtures/single-line-jasmine-comments-spec.js',
                                                {encoding: 'utf8'});
            var multilineJavaDoc = fs.readFileSync('test/fixtures/multi-line-jasmine-comments-spec.js',
                                                {encoding: 'utf8'});

            // {id, status, reporter, assignee, labels, release}
            var issues = {};
            gitHub.parseIssue(issues, {number: '1', state: 'open'});
            gitHub.parseIssue(issues, {number: '2', state: 'closed', milestone: {title: '1.0.0'}});
            gitHub.parseIssue(issues, {number: '3', state: 'open', milestone: {title: '2.0.0'}});
            gitHub.parseIssue(issues, {number: '4', state: 'closed'});
            gitHub.parseIssue(issues, {number: '5', state: 'closed'});

            var outputInline = jasminePreprocess(inlineJavaDoc, issues);
            //fs.writeFileSync('test/fixtures/expected/single-line-jasmine-comments-spec.js', outputInline);
            expect(outputInline).toBe(fs.readFileSync('test/fixtures/expected/single-line-jasmine-comments-spec.js',
                                                        {encoding: 'utf8'}));


            var outputMultiline = jasminePreprocess(multilineJavaDoc, issues);
            //fs.writeFileSync('test/fixtures/expected/multi-line-jasmine-comments-spec.js', outputMultiline);
            expect(outputMultiline).toBe(fs.readFileSync('test/fixtures/expected/multi-line-jasmine-comments-spec.js',
                                                        {encoding: 'utf8'}));
        });
    });

    /** @issue 5
     * @status open
     * @release 1.1.0
     */
    describe('JIRA integration', function () {
        it('should download issue data from the server', function () {
            expect('JIRA integration').toBe('implemented later, but tests to be skipped for now');
        });
    });

    describe('GitHub integration', function () {
        var error, issues;

        beforeEach(function (done) {
            jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

            console.info('get issues from GitHub for test...');
            gitHub.getIssues({
                user: 'nalbion',
                repo: 'test-filter'
            }).then(function (response_data) {
                issues = response_data;
                error = null;
                done();
            }, function (response_error) {
                error = response_error;
                done(response_error);
            });
        });

        /** @issue 2 
         * @status closed
         */
        it('should download issue data from the server', function () {
            expect(error).toBeNull();
            expect(issues).toBeDefined();
            expect(_.keys(issues).length).toBeGreaterThan(0);
        });

        /** @issue 1 
         * @status open
         */
        it('should skip open issues', function () {
            expect('this test').toBe('skipped because "https://github.com/nalbion/test-filter/issues/1" is OPEN');
        });

        /** @issue 3 
         * @status closed
         * @release 100.0.0
         */
        it('should skip tests linked to issues flagged for future releases', function () {
            expect('this').not.toBe('executed until release 100.0.0');
        });

        /**
         * @status closed
         */
        it('should support optional OAuth2 token/secret for private repos', function () {

        });
    });

    /**
     * @is
     * @status open
     */
    describe('status annotation with nested tests', function () {
        it('should skip open issues', function () {
            expect('this nested test').toBe('skipped because "https://github.com/nalbion/test-filter/issues/1" is OPEN');
        });
    });

    describe('command line options', function () {
        /** @issue 3 
         * @status closed
         * @release 100.0.0
         */
        it('should skip test that do not match the "release" parameter', function () {
            expect('this test').toBe('skipped because "https://github.com/nalbion/test-filter/issues/3" is scheduled for a future release');
        });

        it('should skip tests that do not match the "issue" parameter', function () {
            // usage: `test-filter jasmine issue=123`
        });

        /** @issue 4 
         * @status closed
         */
        it('should skip tests that do not match the "status" parameter', function () {

        });
    });
});
