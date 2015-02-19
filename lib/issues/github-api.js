var _ = require('underscore');
var semver = require('semver');
var NodeGitHubApi = require('github');
var pkg = require('../../package.json');
var q = require("promised-io/promise");

// var GitHubApi = require('../src/github-api.js');
// var gitHub = new GitHubReader({host: "github.my-GHE-enabled-company.com"});
// github.repoIssues({}. function(err, data){});


/**
 * @param {{
 *      group: !string, repo: !string,
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

    this.group = options.group;
    this.repo = options.repo;
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
 * If multiple release values use the earliest release
 * (to avoid early failures refactor the tests)
 *
 * @param {string} release
 * @return {string}
 */
GitHubIssue.prototype.determinePriorityRelease = function (release) {
    if (undefined === release) {
        return this.release;
    } else if (undefined === this.release) {
        return release;
    } else {
        return semver.lte(this.release, release) ? this.release : release;
    }
};

/**
 * }
 * Usage:
 * <pre>
 * github.getIssues().then(
 *      function (/** @type {Object.<string, GitHubIssue>} *&#x2F(issues)) {
 *          // process issues
 *      },
 *      function (error) {
 *          // handle error
 *      }
 * </pre>
 *
 * @param {{user: string, repo: string, headers: Object=, milestone: string=, state: string=,
  * assignee: string=, mentioned: string=, labels: string=, sort: string=, direction: string=,
  * since: Date=, page: number=, per_page: number=}}
 *      options - accepts an object with the following fields:
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
 * @return {Promise}
 */
GitHubApi.prototype.getIssues = function (options) {
    options = _.extend({
        user: this.group,
        repo: this.repo
    }, options);
    var github = this;
    var deferred = q.defer();

    this.github.issues.repoIssues(options, function (error, data) {
        if (error) {
            console.error('Error downloading issues from GitHub');
            deferred.reject(error);
        } else {
            var issues = _.reduce(data, github.parseIssue, {});
            console.info('Downloaded', _.keys(issues).length, 'issues from GitHub');
            deferred.resolve(issues);
        }
    });

    return deferred.promise;
};

/**
 * @param {Object.<string, GitHubIssue>} issues - the parsed issue will be added to this object, indexed by issue ID
 * @param {Object} record - the input from GitHub's API
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
