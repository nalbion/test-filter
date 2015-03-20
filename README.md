# test-filter
Filter which tests are executed by integrating issue management systems.
Uses javadoc-style annotations to associate tests/specs with issues and their current status and target release/milestone.

The system adds annotations such as `@status open` and `@release 1.2.3` to suite/test/spec annotated with an issue.
You can also add these annotations directly to your specs, and the system will update them if you also have
an issue annotation on the same spec.  Unless you explicitly specify a target release on the command line
the system will use the version specified in `package.json`.  These annotations are used to filter out
tests that you don't want to be run.

You can also execute only tests that relate to a specific issue by providing the `issue=123` argument on the command line.

Currently only Jasmine and Karma are supported.  If you're using Cucumber on a java project you might
be interested in [cucumber-jira](https://github.com/nalbion/cucumber-jira) and
[jira-maven-plugin](https://github.com/nalbion/jira-maven-plugin/tree/feature/generate-cucumber-features#generate-tests)'s `generate-tests` goal.

## Usage

    npm install --save-dev test-filter

This module uses the `"bugs": {"url": "XXX"` value in your `package.json` file
to determine how to connect to the issue management system.

### Jasmine
Test Filter can be used as a Jasmine wrapper:

    test-filter jasmine

For details on the [optional arguments](#Optional%20Arguments) see below.

Add javadoc-style annotations to your spec files:

    /**
     * @issue 1
     */
    describe('Test suite for Issue 1', function() {
       /**
        * @issue 2
        */
        it('should skip this test if either issue 1 or 2 are open', function() {
        });
    });

### Karma
Test-filter can also be used as a Karma preprocessor:

    test-filter karma [start|run [karma.conf.js] issue=123|release=1.2.3]

For details on the [optional arguments](#Optional%20Arguments) see below.

#### karma.conf.js

    module.exports = function(config) {
        config.set({
            frameworks: ['jasmine'],
            ...
            plugins: [
                'karma-jasmine',
                {'preprocessor:test-filter': ['factory', require('test-filter/lib/tools/karma/karma-test-filter-preprocessor')]}
            ],
            preprocessors: {
                '**/*-spec.js': ['test-filter']
            }


### Optional Arguments

 - `--offline` - If you're unable to connect to the issue management system
 - `--preserve-specs` - By default test-filter will add & update the annotations in your spec files.
 - `group=xxx` and `repo=yyy` - Not required for GitHub and BitBucket
 - `release=1.2.3` - By default test-filter will use the `version` in your package.json file,
    along with the target release/milestone of each issue to determine which tests to run/skip.
 - `issue=123` - Run only issues associated with a specific issue.
 - `system=jira` - is only required if <code>bugs.url</code> is not specified in `package.json`
                 and the URL does not imply the system used.  Valid values: 'github' or 'bitbucket'.

#### GitHub

 - `timeout=60000` - Timeout in ms (defaults to 5 seconds)
 - `host=issues.domain.com` and `pathPrefix=prefix` - Only required for GitHub Enterprise

#### BitBucket
When connecting to BitBucket, you must provide your BitBucket username & password:

on the command line:

    test-filter jasmine username=someone password=secret

...or in `~/.netrc`:

    machine bitbucket.org
      login yourusername
      password yourpassword


#### JIRA
Not yet implemented
