//jasmine.getEnv().specFilter = require('../../src/parsers/jasmine-parser.js').specFilter;

//var TestFilter = require('../../index.js');
//var testFilter = new TestFilter(require('./package.json'));
//jasmine.getEnv().specFilter = testFilter.jasmineSpecFilter;

beforeAll(function (done) {
    console.info('Global beforeAll');
    //console.info(jasmine);
    //jasmine.addReporter();
    done();
});