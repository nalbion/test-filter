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

// PUBLISH DI MODULE for Karma
module.exports = {
  'preprocessor:test-filter': ['factory', require('./karma-test-filter-preprocessor')]
};
