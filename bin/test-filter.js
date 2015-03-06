#!/usr/bin/env node
var path = require('path'),
    _ = require('underscore'),
    issuesApiFactory = require('../lib/issues/issues-api.js'),
    Command = require('jasmine/lib/command.js'),
    fs = require('fs');
//var resolve = require('resolve');
//
//var NODE_PATH = process.env.NODE_PATH;


// usage:
//     test-filter

function parseCommandLineArgs(args, projectBaseDir) {
    var projectPkg = require(projectBaseDir + '/package.json'),
        options = {
            offline: false,
            preserveSpecs: false,
            release: projectPkg.version
        };

    args.forEach(function (arg) {
        if (arg === '--offline') {
            options.offline = true;
        } else if (arg === '--preserve-specs') {
            options.preserveSpecs = true;
        } else {
            var match = arg.match(/(.*)=(.*)/);
            if (match) {
                var key = match[1];
                var value = match[2];
                options[key] = value;
            } else {
                options.configFile = arg;
            }
        }
    });

    return options;
}

/**
 * $ test-filter jasmine [offline=true]
 */
function runJasmineWithPreprocessorAndSpecFilter(args) {
    var Jasmine = require('../node_modules/jasmine/lib/jasmine.js'),
                  //  require('jasmine'),
        projectBaseDir = path.resolve(),
        options = parseCommandLineArgs(args, projectBaseDir),
        jasmine = new Jasmine({ projectBaseDir: projectBaseDir }),
        command = new Command(path.resolve());

    if (!options.offline) {
        var issuesApi = issuesApiFactory.getIssuesApi(options);
        /** @type {Promise} */
        issuesApi.getIssues().then(function (issues) {
            var JasmineSpecFilter = require('../lib/tools/jasmine/jasmine-spec-filter');
            var jasmineSpecFilter = new JasmineSpecFilter(issues, options);

            // Swap in a customised loadSpecs() method
            var specAnnotations = {},
                originalLoadSpecs = _.bind(jasmine.loadSpecs, jasmine);
            jasmine.loadSpecs = function() {
                this.specFiles.forEach(function(file) {
                    jasmineSpecFilter.evaluateSpecAnnotationsInFile(file, specAnnotations);
                });
                originalLoadSpecs();
            };

            // Use our spec filter
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

function runKarmaWithPreprocessorAndSpecFilter(args) {
    var karmaPath = '../node_modules/karma',
        projectBaseDir = path.resolve();

    var config = {
        cmd: args.shift() || 'start'
    };

    _.extend(config, parseCommandLineArgs(args, projectBaseDir));

    var configFile = config.configFile;
    if (!configFile) {
        // default config file (if exists)
        if (fs.existsSync('./karma.conf.js')) {
            configFile = './karma.conf.js';
        } else if (fs.existsSync('./karma.conf.coffee')) {
            configFile = './karma.conf.coffee';
        }
    }
    config.configFile = configFile ? path.resolve(configFile) : null;

    switch (config.cmd) {
    case 'start':
        require(karmaPath + '/lib/server').start(config);
        break;
    case 'run':
        require(karmaPath + '/lib/runner').run(config);
        break;
    }
}


switch (process.argv[2]) {
case 'jasmine':
    runJasmineWithPreprocessorAndSpecFilter(process.argv.slice(3));
    break;
case 'karma':
    runKarmaWithPreprocessorAndSpecFilter(process.argv.slice(3));
    break;
default:
    console.info('Usage:');
    console.info('  $ test-filter jasmine');
    console.info('  or');
    console.info('  $ test-filter karma [start|run [karma.conf.js] issue=123|release=1.2.3]');
};
