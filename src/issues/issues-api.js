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

var IssuesApiFactory = function () {

};

/**
 *
 * @param {Object=} config
 */
IssuesApiFactory.prototype.getIssuesApi = function (config) {
    var system, api;

    if (config && config.system) {
        system = config.system;
    } else {
        var bugsUrl, pkg = require(appRoot + '/package.json');
        if (undefined !== pkg && undefined !== pkg.bugs && undefined !== pkg.bugs.url) {
            bugsUrl = pkg.bugs.url;
        } els if( config && config.host ) {
            bugsUrl = config.host;
        }
        system = this.parseSystem(bugsUrl);
    }

    if ('github' == system) {
        var GitHubApi = require('./github-api.js');
        api = new GitHubApi(config);
    } else {
        throw 'Sorry, ' + system + ' is not currently supported';
    }

    return api;
};

/**
 * Attempt to parse
 * @param {string} bugsUrl
 * @return {string} - 'github', 'jira' etc
 */
IssuesApiFactory.prototype.parseSystem = function(bugsUrl) {
    if (bugsUrl.indexOf('github') > 0) {
        return 'github';
    } else if (bugsUrl.indexOf('jira') > 0) {
        return 'jira';
    };

    throw 'Could not determine issue type from url: ' + bugsUrl;
};

module.exports = new IssuesApiFactory();