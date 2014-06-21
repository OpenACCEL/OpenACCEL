/*
 * File containing the Command Class
 *
 * @author Edward
 */

/* Browser vs. Node ***********************************************/
inBrowser = typeof window !== 'undefined';
inNode = !inBrowser;

if (inNode) {
    require = require('requirejs');
} else {
    require.config({
        shim: {
            'underscore': {
                exports: '_'
            }
        },
        baseUrl: 'scripts'
    });
}
/*******************************************************************/

// If all requirements are loaded, we may create our 'class'.
define([], /**@lends Operation*/ function() {
    /**
     * @class
     * @classdesc An operation that the Controller can perform
     * and undo.
     *
     * @param {Function} execute The operation to perform
     * @param {Function} undo The operation to perform in order to
     * undo this operation.
     * @param {Array} args Array of arguments to pass to execute
     * @param {Array} undoArgs Array of arguments to pass to undo
     */
    function Operation(execute, undo, args, undoArgs) {
        this.execute = execute;
        this.undo = undo;
        this.args = args;
        this.undoArgs = undoArgs;
    }

    /**
     * Resets this object to empty values.
     *
     * @post All class variables have been set to null.
     */
    Operation.prototype.reset = function() {
        this.execute = null;
        this.undo = null;
        this.args = null;
        this.undoArgs = null;
    };

    return Operation;
});
