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
define(["controller/Operation"], /**@lends QuantityOperation*/ function(Operation) {
    /**
     * @class
     * @classdesc An operation on a Quantity that the Controller can perform
     * and undo.
     *
     * @param {Function} execute The operation to perform
     * @param {Function} undo The operation to perform in order to
     * undo this operation.
     * @param {Array} args Array of arguments to pass to execute
     * @param {Array} undoArgs Array of arguments to pass to undo
     * @param {String} description A textual description of the operation
     * @param {Quantity} quantity The quantity on which this operation is
     * performed
     */
    function QuantityOperation(execute, undo, args, undoArgs, description, quantity) {
        this.execute = execute;
        this.undo = undo;
        this.args = args;
        this.undoArgs = undoArgs;
        this.description = description;
        this.quantity = quantity;
    }

    QuantityOperation.prototype = new Operation();

    /**
     * Resets this object to empty values.
     *
     * @post All class variables have been set to null.
     */
    QuantityOperation.prototype.reset = function() {
        this.execute = null;
        this.undo = null;
        this.args = null;
        this.undoArgs = null;
        this.description = "";
        this.quantity = null;
    };

    return QuantityOperation;
});
