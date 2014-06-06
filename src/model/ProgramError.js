/*
 * An error that occured during program execution
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
     * @class Error
     * @classdesc An error that occured somewhere during program execution.
     */

    function ProgramError(errString) {

        /**
         * The name of the quantity as defined in the left hand side of a line.
         * In case of a function f(x), the name will be f.
         *
         * @type {String}
         */
        if (typeof errString !== 'undefined') {
            this.description = errString;
        } else {
            this.description = '';
        }

        /**
         * The type of this error.
         *
         * @type {String}
         */
        this.type = "ERROR_UNKNOWN";
    }

    // Exports are needed, such that other modules may invoke methods from this module file.
    return ProgramError;
});
