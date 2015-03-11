'use strict';

var through = require('through2');
//var rs = require('replacestream');
//var istextorbinary = require('istextorbinary');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;

// consts
var PLUGIN_NAME = 'gulp-test-preprocessor';

var issues;

/**
 * @param {{}=} options
 * @returns {*}
 */
module.exports = function(options) {
    var processAnnotations = function(file, enc, callback) {
        if (file.isNull()) {
            return callback(null, file);
        }

        //function processAnnotations() {
            if (file.isStream()) {
                this.emit('error', new PluginError(PLUGIN_NAME, 'Streams not supported!'));
                //file.contents = file.contents.pipe(rs(search, replacement));
                //return callback(null, file);
            }

            if (file.isBuffer()) {
//console.info('file:', file);
if (undefined == issues) {
    console.info('initialising issues');
    issues = {'1': 'one', '2': 'two'};
} else {
    console.info('already have issues:', issues);
}


//this.emit('error', new PluginError(PLUGIN_NAME, 'Buffers not supported!'));
                //if (search instanceof RegExp) {
                //    file.contents = new Buffer(String(file.contents).replace(search, replacement));
                //}
                //else {
                //    var chunks = String(file.contents).split(search);
                //
                //    var result;
                //    if (typeof replacement === 'function') {
                //        // Start with the first chunk already in the result
                //        // Replacements will be added thereafter
                //        // This is done to avoid checking the value of i in the loop
                //        result = [ chunks[0] ];
                //
                //        // The replacement function should be called once for each match
                //        for (var i = 1; i < chunks.length; i++) {
                //            // Add the replacement value
                //            result.push(replacement(search));
                //
                //            // Add the next chunk
                //            result.push(chunks[i]);
                //        }
                //
                //        result = result.join('');
                //    }
                //    else {
                //        result = chunks.join(replacement);
                //    }
                //
                //    file.contents = new Buffer(result);
                //}
                return callback(null, file);
            }

            callback(null, file);
        //}
    };

    return through.obj(processAnnotations);
};