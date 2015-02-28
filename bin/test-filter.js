#!/usr/bin/env node
var path = require('path'),
    _ = require('underscore'),
    issuesApiFactory = require('../lib/issues/issues-api.js'),
    Command = require('jasmine/lib/command.js');

// usage:
//     test-filter

/**
 * $ test-filter jasmine [offline=true]
 */
function runJasmineWithPreprocessorAndSpecFilter(args) {
    var Jasmine = require('../node_modules/jasmine/lib/jasmine.js'),
                  //  require('jasmine'),
        projectBaseDir = path.resolve(),
        jasmine = new Jasmine({ projectBaseDir: projectBaseDir }),
        command = new Command(path.resolve()),
        projectPkg = require(projectBaseDir + '/package.json'),
        release = projectPkg.version, issueNumber,
        offline = false,
        preserveSpecs = false,
        options = {};

    args.forEach(function (arg) {
        if (arg === '--offline') {
            offline = true;
        } else if (arg === '--preserve-specs') {
            preserveSpecs = true;
        } else {
            var match = arg.match(/(.*)=(.*)/);
            if (match) {
                var key = match[1];
                var value = match[2];
                if ('release' === key) {
                    release = value;
                } else if ('issue' === key) {
                    issueNumber = value;
                } else {
                    options[key] = value;
                }
            }
        }
    });

    if (!offline) {
        var issuesApi = issuesApiFactory.getIssuesApi(options);
        /** @type {Promise} */
        issuesApi.getIssues().then(function (issues) {
            var JasmineSpecFilter = require('../lib/tools/jasmine/jasmine-spec-filter');
            var jasmineSpecFilter = new JasmineSpecFilter(issues, preserveSpecs, release, issueNumber);

            // Swap in a customised loadSpecs() method
            var specAnnotations = {},
                originalLoadSpecs = _.bind(jasmine.loadSpecs, jasmine);
            jasmine.loadSpecs = function() {
                this.specFiles.forEach(function(file) {
                    jasmineSpecFilter.evaluateSpecAnnotationsInFile(file, specAnnotations);
                });
                originalLoadSpecs();
            };

            jasmine.env.specFilter = jasmineSpecFilter.jasmineSpecFilter;
//                                   _.bind(jasmineSpecFilter.specFilter, this);
//          jasmine.env.addReporter( jasmineSpecFilter );

            command.run(jasmine, args);
        }, function (error) {
            console.error('Failed to download issues from server. Try running with --offline', error);
        });
    } else {
        command.run(jasmine, args);
    }
}


switch (process.argv[2]) {
case 'jasmine':
    runJasmineWithPreprocessorAndSpecFilter(process.argv.slice(3));
    break;
default:
    console.info('Usage:');
    console.info('  $ test-filter jasmine');
};
