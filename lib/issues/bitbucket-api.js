var bitbucket = require('bitbucket-api');
var _ = require('underscore');
var q = require("promised-io/promise");

/**
 * @param {{username: string, password: string,
 *          group: string, repo: string}} config
 * @constructor
 */
var BitBucketApi = function (config) {
	// username, password
	this.client = bitbucket.createClient(config);
    this.config = config;
};

/**
 * @return {Promise}
 */
BitBucketApi.prototype.getIssues = function () {
    var deferred = q.defer(),
        bitbucket = this;

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
                        var issues = _.reduce(data.issues, bitbucket.parseIssue, {});
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

module.exports = BitBucketApi;
