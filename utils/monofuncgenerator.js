'use strict';

/**
 * This script automatically creates library files for each Accel function that
 * just takes a single argument, and which can be converted to a javascript Math-function
 * with the same argument.
 *
 * The template of the macro shold be defined in the file
 * "macrotemplate.txt" in the same folder as this file.
 * In this file, the following wild-cards can be entered:
 *
 * __a__ : name of the accel function
 * __j__ : name of javascript function
 *
 *
 * @author Roel Jacobs
 */

// IO modules
var fs = require('fs');
var path = require('path');

/**
 * Functions of which the Accell script name is equal to the javascript name.
 * @type {String[]}
 */
var functions1to1 = [
    'sin',
    'cos',
    'tan',
    'asin',
    'acos',
    'atan',
    'sqrt',
    'abs',
    'ceil',
    'floor',
    'round',
    'exp'
];

/**
 * Functions of which the Accell script name is different from the javascript name.
 * In this case the array contains of object with two fields:
 * accel: name of the function in Accel
 * js: name of the function in Javascript
 *
 * @type {Array}
 */
var functionsDiff = [{
    accel: 'ln',
    js: 'log'
}];

/**
 * Template, read from librarytemplate.txt
 * @type {String}
 */
var template = fs.readFileSync('./utils/librarytemplate.txt', 'utf8');

/**
 * Extension for library files
 * @type {String}
 */
var ext = '.js';

/**
 * Output directory for the macro files.
 * Can be given by command line.
 * By default, it creates a folder "output" in the folder
 * of thid script.
 * @type {String}
 */
var outputdir = path.normalize(process.argv[2] || './output/');

/**
 * Write the given data to file.
 * @param  {String} filename name of the output file
 * @param  {String} data data to write to file
 */
function outputFile(filename, data) {
    var file = path.join(outputdir, filename + ext);

    mkPath(outputdir);

    fs.writeFileSync(file, data);
}

/**
 * Creates the directories in the given path if they do not yet exist.
 * @param  {String} p path]
 */
function mkPath(p) {
    var dirs = p.split(path.sep);
    for (var i = 0; i < dirs.length; i++) {
        var subpath = dirs.slice(0, i + 1).join(path.sep);
        if (!fs.existsSync(subpath)) {
            fs.mkdirSync(subpath);
        }
    }
}

// Create a new .gitignore file.
var gitignore = fs.openSync(path.join(outputdir, ".gitignore"), 'w');
fs.appendFile(path.join(outputdir, ".gitignore"), ".gitignore\n", function (err) { });

// Handle all functions that need no translation
functions1to1.forEach(function(func) {
    var output = template.replace(/(__a__|__j__)/g, func);
    outputFile(func, output);
    fs.appendFile(path.join(outputdir, ".gitignore"), func + ext + "\n", function (err) { });
});

// Handle all functions that need translation
functionsDiff.forEach(function(func) {
    var output = template.replace(/(__a__)/g, func.accel).replace(/(__j__)/g, func.js);
    outputFile(func.accel, output);
    fs.appendFile(path.join(outputdir, ".gitignore"), func + ext + "\n", function (err) { });
});