var _ = require('underscore');
var GitHubApi = require('github');
var package = require('../package.json');

// var GitHubReader = require('../src/github-reader.js');
// var gitHubReader = new GitHubReader({host: "github.my-GHE-enabled-company.com"});
// githubReader.repoIssues({}. function(err, data){});


/**
 * @param {{version: !string,
 *      debug: boolean=, protocol: string=, host: string=, pathPrefix: string=,
  *      timeout: number=, headers: Object.<string, string>=}=} options
 * @constructor
 */
var GitHubReader = function(options) {
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
            "user-agent": package.name + "-" + package.version
        }
    }, options);

    this.github = new GitHubApi(options);
};

/**
 * @type {function(Object)} - accepts an object with the following fields:
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
GitHubReader.prototype.repoIssues = function (options, callback) {
    return this.github.issues.repoIssues(options, function (error, data) {
        var issues = _.map(data, function(record) {
            issue = {
                number: record.number,
                status: record.state,     // 'open', 'closed'
                reporter: record.user && record.user.login
            };

            if (record.assignee) {
                issue.assignee = record.assignee.login;
            }

            if (record.labels) {
                issue.labels = _.map(record.labels, function(label) {
                    return label.name;
                });
            }
            if (record.milestone) {
                issue.release = record.milestone.title;
            };

            return issue;
        });
        callback(error, issues);
    });
}

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


module.exports = GitHubReader;