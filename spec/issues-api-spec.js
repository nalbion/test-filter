var issuesApiFactory = require('../src/issues/issues-api.js');
var _github = require('../src/issues/github-api.js');

describe('Issues API', function () {
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
        describe('issues', function () {
            it('should select the highest priority status', function () {
                var issuesApi = issuesApiFactory.getIssuesApi(),
                    issues = {},
                    uninitialisedStatus;
                issuesApi.parseIssue(issues, {number: 'TEST_1', state: 'open'});
                issuesApi.parseIssue(issues, {number: 'TEST_2', state: 'closed'});

                expect(issues['TEST_1'].determinePriorityStatus(uninitialisedStatus)).toBe('open');
                expect(issues['TEST_2'].determinePriorityStatus(uninitialisedStatus)).toBe('closed');
                expect(issues['TEST_1'].determinePriorityStatus('open')).toBe('open');
                expect(issues['TEST_2'].determinePriorityStatus('open')).toBe('open');
                expect(issues['TEST_1'].determinePriorityStatus('closed')).toBe('open');
                expect(issues['TEST_2'].determinePriorityStatus('closed')).toBe('closed');
            })

            it('should select the highest priority version/milestone', function () {
                var issuesApi = issuesApiFactory.getIssuesApi(),
                    issues = {},
                    uninitialisedMilestone;
                issuesApi.parseIssue(issues, {number: 'TEST_1', milestone: {title: '1.0.0'}});
                issuesApi.parseIssue(issues, {number: 'TEST_2', milestone: {title: '2.0.0'}});

                expect(issues['TEST_1'].determinePriorityMilestone(uninitialisedMilestone)).toBe('1.0.0');
                expect(issues['TEST_2'].determinePriorityMilestone(uninitialisedMilestone)).toBe('2.0.0');
                expect(issues['TEST_1'].determinePriorityMilestone('0.0.1')).toBe('0.0.1');
                expect(issues['TEST_1'].determinePriorityMilestone('1.0.0')).toBe('1.0.0');
                expect(issues['TEST_2'].determinePriorityMilestone('3.0.0')).toBe('2.0.0');
            })
        })
    })
})