//jasmine.getEnv().specFilter = require('../../src/parsers/jasmine-parser.js').specFilter;

var TestFilter = require('../../src/index.js');
var testFilter = new TestFilter(require('../../package.json'));
testFilter.createJasmineSpecFilter();

beforeAll(function (done) {
    console.info('Global beforeAll');
    //console.info(jasmine);
    //jasmine.addReporter();
    done();
});


//beforeEach(function(done) {
//    console.info('beforeEach', this);
//});

//jasmine.suiteStarted = function(suite) {
//    console.info('suiteStarted', suite);
//};

