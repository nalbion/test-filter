var _ = require('underscore');
var semver = require('semver');
var NodeGitHubApi = require('github');
var pkg = require('../../package.json');


// var GitHubApi = require('../src/github-api.js');
// var gitHub = new GitHubReader({host: "github.my-GHE-enabled-company.com"});
// github.repoIssues({}. function(err, data){});


/**
 * @param {{version: !string,
 *      debug: boolean=, protocol: string=, host: string=, pathPrefix: string=,
  *      timeout: number=, headers: Object.<string, string>=}=} options
 * @constructor
 */
var GitHubApi = function(options) {
    options = _.extend({
        // required
        version: "3.0.0",
        // optional
        //debug: true,
        //protocol: "https",
        //host: "github.my-GHE-enabled-company.com",
        //pathPrefix: "/api/v3", // for some GHEs
        timeout: 5000,
        headers: {
            "user-agent": pkg.name + "-" + pkg.version
        }
    }, options);

    this.repo = options.repo;
    this.group = options.group;
    this.github = new NodeGitHubApi(options);
};

/**
 * @param {Object} record
 * @constructor
 */
var GitHubIssue = function (record) {
    /** @type {string} */
    this.id = record.number;
    /**
     * 'open' or 'closed'
     * @type {string}
     */
    this.status = record.state;
    /** @type {string} */
    this.reporter = record.user && record.user.login;

    if (record.assignee) {
        /** @type {string} */
        this.assignee = record.assignee.login;
    }

    if (record.labels) {
        /** @type {Array.<string>} */
        this.labels = _.map(record.labels, function(label) {
            return label.name;
        });
    }
    if (record.milestone) {
        /** @type {string} */
        this.release = record.milestone.title;
    };
};

/**
 * If multiple status values go with the worst case scenario - ie OPEN
 * @param {string} status
 * @return {string}
 */
GitHubIssue.prototype.determinePriorityStatus = function (status) {
    if (undefined === status) {
        return this.status;
    }
    if ('open' == this.status) {
        return 'open';
    }
    return status;
};

/**
 * If multiple milestone values use the earliest milestone
 * (to avoid early failures refactor the tests)
 *
 * @param {string} milestone
 * @return {string}
 */
GitHubIssue.prototype.determinePriorityMilestone = function (milestone) {
    if (undefined === milestone) {
        return this.release;
    }
    return semver.lte(this.release, milestone) ? this.release : milestone;
};

/**
 * @type {function(Object):Object.<string, GitHubIssue>} - accepts an object with the following fields:
 headers (Object): Optional. Key/ value pair of request headers to pass along with the HTTP request. Valid headers are: 'If-Modified-Since', 'If-None-Match', 'Cookie', 'User-Agent', 'Accept', 'X-GitHub-OTP'.
 user (String): Required.
 repo (String): Required.
 milestone (String): Optional. Validation rule: ^([0-9]+|none|\*)$.
 state (String): Optional. open, closed, or all Validation rule: ^(open|closed|all)$.
 assignee (String): Optional. String User login, none for Issues with no assigned User. * for Issues with any assigned User.
 mentioned (String): Optional. String User login.
 labels (String): Optional. String list of comma separated Label names. Example: bug,ui,@high
 sort (String): Optional. Validation rule: ^(created|updated|comments)$.
 direction (String): Optional. Validation rule: ^(asc|desc)$.
 since (Date): Optional. Timestamp in ISO 8601 format: YYYY-MM-DDTHH:MM:SSZ
 page (Number): Optional. Page number of the results to fetch. Validation rule: ^[0-9]+$.
 per_page (Number): Optional. A custom page size up to 100. Default is 30. Validation rule: ^[0-9]+$.
 */
GitHubApi.prototype.getIssues = function (options, callback) {
    options = _.extend({
        user: this.group,
        repo: this.repo
    }, options);

    var github = this;

    return this.github.issues.repoIssues(options, function (error, data) {
        //var issues = _.map(data, function(record) {
		var issues = _.reduce(data, github.parseIssue, {});
        callback(error, issues);
    });
};

/**
 * @param {Object.<string, GitHubIssue>} issues - indexed by issue ID
 * @param {Object} record
 */
GitHubApi.prototype.parseIssue = function (issues, record) {
    var issue = new GitHubIssue(record);
    //return issue;
    issues[record.number] = issue;
    return issues;
};

// TODO: support authentication for private repos
//// OAuth2
//github.authenticate({
//    type: "oauth",
//    token: token
//});
//
//// OAuth2 Key/Secret
//github.authenticate({
//    type: "oauth",
//    key: "clientID",
//    secret: "clientSecret"
//})


module.exports = GitHubApi;
