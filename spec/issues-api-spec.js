var issuesApiFactory = require('../src/issues/issues-api.js');
var _github = require('../src/issues/github-api.js');

describe('issues API', function () {
    describe('factory', function () {
        it('should be able to determine the issue management system from the bugs.url section in package.json',
            function () {
                // By default, issuesApiFactory attempts to determine the system from bugs.url
                var issuesApi = issuesApiFactory.getIssuesApi();
                expect(issuesApi.constructor).toBe(_github);
            }
        )

        it('should be able to parse URLS', function () {
            expect(issuesApiFactory.parseSystem('https://github.com/nalbion/test-filter/issues')).toBe('github');
            expect(issuesApiFactory.parseSystem('http://jira.secondlife.com')).toBe('jira');
            expect(issuesApiFactory.parseSystem('https://issues.apache.org/jira/')).toBe('jira');
        });

        it('should accept an optional options object - system, host, username etc', function () {
            expect(function () {
                issuesApiFactory.getIssuesApi({system: 'other'})
            }).toThrow('Sorry, other is not currently supported');

            var issuesApi = issuesApiFactory.getIssuesApi({
                host: 'github.example.com'
            });
            expect(issuesApi.constructor).toBe(_github);
        });
    });

    describe('GitHub', function () {

    })
})