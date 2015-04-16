var path = require('path');

/**
 * Wrap the real Jasmine framework with an initial call to
 * jasmineSpecFilter.evaluateSpecAnnotationsInFile for each spec file
 *
 * @param {Runner} runner The current Protractor Runner.
 * @param {Array} specs Array of Directory Path Strings.
 * @return {q.Promise} Promise resolved with the test results
 */
exports.run = function(runner, specs) {
    // expose testFilterOptions from protractor.conf.js onto global scope
    global.testFilterOptions = runner.config_.testFilterOptions || {};

    var JasmineSpecFilter = require('./jasmine/jasmine-spec-filter'),
        jasmineSpecFilter = new JasmineSpecFilter(null, global.testFilterOptions),
        specAnnotations = {};

    for (var i = 0; i < specs.length; i++) {
        var file = specs[i];
        jasmineSpecFilter.evaluateSpecAnnotationsInFile(file, specAnnotations);
    }

    return require(path.resolve('node_modules/protractor/lib/frameworks/jasmine2')).run(runner, specs);
}