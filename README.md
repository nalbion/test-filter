# test-filter
Filter which tests are executed by integrating issue management systems.
Uses javadoc-style annotations to associate tests/specs with issues and their current status and target release/milestone.

## Usage
This module uses the `"bugs": {"url": "XXX"` value in your `package.json` file
to determine how to connect to the issue management system.

### Jasmine
Test Filter can be used as a Jasmine wrapper:

    test-filter jasmine

Optional args:

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
When connecting to BitBucket, you must provide your BitBucket username & password on the command line:

    test-filter jasmine username=someone password=secret