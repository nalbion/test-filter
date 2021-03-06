var bitbucket = require('bitbucket-api');
var _ = require('underscore');
var q = require("promised-io/promise");

/**
 * @param {{username: string, password: string,
 *          group: string, repo: string}} config
 * @constructor
 */
var BitBucketApi = function (config) {
    if (undefined == config.username || undefined == config.password) {
        var netrc = require('node-netrc'),
            credentials = netrc('bitbucket.org');
        config.username = credentials.login;
        config.password = credentials.password;
    }

    this.config = config;
    this.client = bitbucket.createClient(config);
};

/**
 *
 * @return {Promise}
 */
BitBucketApi.prototype.getIssues = function () {
    var deferred = q.defer(),
        self = this;

    // owner, slug
    this.client.getRepository({owner: this.config.group, slug: this.config.repo},
        function (error, repo) {
            if (error) {
                console.error('Error connecting to BitBucket');
                deferred.reject(error);
            } else {
                repo.issues().get(function (error2, data) {
                    if (error2) {
                        console.error('Error downloading issues from BitBucket');
                        deferred.reject(error2);
                    } else {
                        var issues = _.reduce(data.issues, self.parseIssue, {});
                        console.info('Downloaded', _.keys(issues).length, 'issues from BitBucket');
                        // console.info(issues);
                        deferred.resolve(issues);
                    }
                });
            }
        }
    );

    return deferred.promise;
};

/**
 * @param {Object.<string, BitBucketIssue>} issues - the parsed issue will be added to this object, indexed by issue ID
 * @param {Object} record - the input from BitBucket's API
 */
BitBucketApi.prototype.parseIssue = function (issues, record) {
    issues[record.local_id] = new BitBucketIssue(record);
    return issues;
};

// { issues: [ {
//      local_id: 1,
//      status: 'new',      // new, open, on hold, resolved, duplicate, invalid, wontfix, closed
//      priority: 'major',  // trivial, minor, major, critical, blocker
//      title: 'my issue',
//      reported_by: { username: 'nalbion' },
//      responsible: { username: 'nalbion' },
//      metadata: {
//          kind: 'task',   // bug, enhancement, proposal, task
//          version: '1.0.0',
//          component: 'front-end',
//          milestone: '1.0.0'
//      },
/**
 * @param {Object} record
 * @constructor
 */
var BitBucketIssue = function (record) {
    /** @type {string} */
    this.id = record.local_id;

    /**
     * new, open, on hold, resolved, duplicate, invalid, wontfix, closed
     * @type {string}
     */
    this.status = record.status;

    /** @type {string} */
    this.reporter = record.reported_by && record.reported_by.username;

    if (record.responsible) {
        /** @type {string} */
        this.assignee = record.responsible.username;
    }

    if (record.metadata) {
        if (record.metadata.version) {
            this.release = record.metadata.version;
        } else if (record.metadata.milestone) {
            this.release = record.metadata.milestone;
        }
    }
};

/** @type {string|undefined} */
BitBucketIssue.prototype.release;

/**
 * If multiple status values go with the worst case scenario - ie 'open'
 * TODO: currently just returns 'open' or <code>status</code> - do we need to do anything different?
 *
 * @param {string} status - new, open, on hold, resolved, duplicate, invalid, wontfix, closed
 * @return {string}
 */
BitBucketIssue.prototype.determinePriorityStatus = function (status) {
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
 *
 * @param {string} release
 * @return {string}
 */
BitBucketIssue.prototype.determinePriorityRelease = function (release) {
    // console.info('determinePriorityRelease(', release,') vs', this.release);
    if (undefined === release) {
        return this.release;
    } else if (undefined === this.release) {
        return release;
    } else {
        return semver.lte(this.release, release) ? this.release : release;
    }
};

module.exports = BitBucketApi;
