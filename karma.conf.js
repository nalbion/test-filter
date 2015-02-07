module.exports = function(config) {
  config.set({
    browsers: ['PhantomJS'],
    frameworks: ['jasmine'],
    files: [
      'src/**/*.js',
      'spec/**/*spec.js'
    ],
	plugins: [
	  // inlined plugins
   //   {'framework:xyz', ['factory', factoryFn]},
     // require('./plugin-required-from-config')
	],
	customPreprocessors: {
      test_filter: {
 //       base: 'coffee',
//        options: {bare: true}
      }
    }
  });
};
