/*
 * An error that occured while parsing ACCEL script.
 * Indicates that the script was not valid ACCEL script.
 * (or that the parser is broken ;))
 *
 * @author Edward Brinkmann
 */
/* Browser vs. Node ***********************************************/
inBrowser = typeof window !== 'undefined';
inNode = !inBrowser;

if (inNode) {
    require = require('requirejs');
} else {
    require.config({
        baseUrl: 'scripts'
    });
}
/*******************************************************************/

define([], /**@lends Model*/ function() {
    /**
     * @class SyntaxError
     * @classdesc An error that occured while parsing ACCEL script.
     */

    function SyntaxError() {
        this.firstLine = 0;
        this.lastLine = 0;
        this.startPos = 0;
        this.endPos = 0;
        this.found = '';
        this.expected = [];
    }

    // Exports are needed, such that other modules may invoke methods from this module file.
    return SyntaxError;
});
