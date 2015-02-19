// var issuesApiFactory = require('../src/issues/issues-api.js');
//var issuesApi = issuesApiFactory.getIssuesApi({
//    system: github,   // or jira etc
//    host: "github.my-GHE-enabled-company.com",
//    pathPrefix: "/api/v3", // for some GHEs
//    group: "my-group-or-workspace",
//    repo: "my-project"
//});

//var TestFilter = function () {};
//TestFilter.prototype.bla = function () {
//};
//// var bla = require('test-filter');
//// bla.bla();
//module.exports = new TestFilter();
//
//// var TestFilter = require('test-filter');
//// var testFilter = new TestFilter();
//// testFilter.bla();
//module.exports = TestFilter;
//
//// var TestFilter = require('test-filter').TestFilter;
//// var testFilter = new TestFilter();
//// testFilter.bla();
//exports.TestFilter = TestFilter;

var appRoot = require('app-root-path');
var _ = require('underscore');

var IssuesApiFactory = function () {
};

/**
 * @param {{system: string=, host: string=, pathPrefix: string=}} config
 *      <code>system</code> is only required if <code>bugs.url</code> is not specified in <code>package.json</code>
 *        and the URL does not imply the system used.  Valid values: 'github' or 'bitbucket'.
  *     <code>host</code> and <code>pathPrefix</code> are only required for GitHub enterprise.
 * @return {GitHubApi|BitBucketApi}
 */
IssuesApiFactory.prototype.getIssuesApi = function (config) {
    var system, api;

    var bugsUrl, pkg = require(appRoot + '/package.json');
    if (undefined !== pkg.bugs && undefined !== pkg.bugs.url) {
        bugsUrl = pkg.bugs.url;
    } else if( config && config.host ) {
        bugsUrl = config.host;
    }
    var bugsConfig = this.parseBugsUrl(bugsUrl);

    if (config && config.system) {
        system = config.system;
    } else {
        system = bugsConfig.system;
    }

    config = _.extend(bugsConfig, config);

    if ('github' == system) {
        var GitHubApi = require('./github-api.js');
        api = new GitHubApi(config);
    } else if ('bitbucket' == system) {
        var BitBucketApi = require('./bitbucket-api.js');
        api = new BitBucketApi(config);
    } else {
        throw 'Sorry, ' + system + ' is not currently supported';
    }

    return api;
};

/**
 * Attempt to parse
 * @param {string} bugsUrl
 * @return {{system: string, group: string, repo: string} where system is one of 'github', 'jira' etc
 */
IssuesApiFactory.prototype.parseBugsUrl = function(bugsUrl) {
    var match = bugsUrl.match(/.*(github|bitbucket)[^\/]*\/([^\/]*)\/([^\/]*)\/issues/);
    if (match) {
        return {system: match[1], group: match[2], repo: match[3]};
    } else if (bugsUrl.indexOf('jira') > 0) {
        return {system: 'jira'};
    };

    throw 'Could not determine issue type from url: ' + bugsUrl;
};

module.exports = new IssuesApiFactory();