/*
 * @author Roel Jacobs
 */

/* Browser vs. Node ***********************************************/
inBrowser = typeof window !== 'undefined';
inNode    = !inBrowser;

if (inNode) { 
    require = require('requirejs');
    sweetModule = 'sweet.js';
} else {
    sweetModule = 'sweet';
    require.config({
        baseUrl: 'scripts'
    });
}
/*******************************************************************/

// If all requirements are loaded, we may create our 'class'.
define([], /**@lends Model*/ function() {
    /**
     * @class
     * @classdesc This class is needed for proper functioning of the preprocessor-passes, as nothing
     * about the strings should be modified by any of the passes.
     *  
     * The StringReplacer class has two functions.
     * 
     * replaceStrings() scans lines of script and replaces every
     * string by the SUBSTITUTE-symbol (cicled s) followed by a number. The string will be stored in an
     * array 'buffer', and the number that was placed after the symbol corresponds with the
     * position of the string in this array.
     *
     * restoreStrings() restores the strings back into the script lines, by looking up the numbers after
     * the SUBSTITUTE symbol in the buffer.
     *
     * replaceStrings() should be called BEFORE all passes,
     * restoreStrings() AFTER all passes.
     *
     * Strings are identified by ".." or '..'.
     */
    function StringReplacer() {
        /**
         * Buffer momorizing the replaced strings.
         * @type {String[]}
         */
        this.buffer = [];

        /**
         * Symbol that replaces the occurance of a string.
         *
         * CIRCLED LATIN SMALL LETTER S
         * 
         * @constant
         * @type {String}
         */
        this.SUBSTITUTE = '\u24E2';

        /**
         * Regex extracting string-definitions
         * @type {RegExp}
         */
        this.stringregex = /(['"])(.*?)(\1)/g;

        /**
         * Regex for extracting the places that should be restored,
         * and immediately assigns the index tot he first matching group.
         * @type {RegExp}
         */
        this.restoreregex = /(?:\u24E2)(\d+)/g;
    }

    /**
     * Replaces every string definition in the given script lines by {SUBSTITUTE}{INDEX},
     * and stores the strings in the buffer.
     *
     * Important: Replaces the content that may already be in the buffer.
     * 
     * @param  {String[]} scriptLines Array with lines of Accel script
     * @return {String[]}             Array of script lines in which the strings are replaced
     */
    StringReplacer.prototype.replaceStrings = function(scriptLines) {
        this.buffer = [];

        return scriptLines.map(this.replace);
    };

    /**
     * Restores the strings back into the given scriptlines.
     * For proper functioning, the method must be called with the
     * scriptLines that replaceString() was last called with.
     * 
     * @param  {String[]} scriptLines Array with lines of Accel script
     * @return {String[]}             Array of script lines in which the strings are restored.
     */
    StringReplacer.prototype.restoreStrings = function(scriptLines) {
        return scriptLines.map(this.restore);
    };

    /**
     * Replaces every string definition in a single line of script by {SUBSTITUTE}{INDEX},
     * and stores the strings in the buffer.
     * 
     * @param  {String} line line of Accel script
     * @return {String}             line in which the strings are replaced
     */
    StringReplacer.prototype.replace = function(line) {
        return line.replace(this.stringregex, function(match) {
            var index = this.buffer.length;
            this.buffer.push(match);

            return this.SUBSTITUTE + index;
        });
    };

    /**
     * Restores the strings back into the script line.
     * 
     * @param  {String} line line of Accel script
     * @return {String}             line in which the strings are replaced
     */
    StringReplacer.prototype.restore = function(line) {
        return scriptLines.replace(this.restoreregex, (function(match, index) {
            return this.buffer[index];
        }).bind(this));
    };


    // Exports are needed, such that other modules may invoke methods from this module file.
    return StringReplacer;
});
