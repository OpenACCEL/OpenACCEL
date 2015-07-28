/*
 * An error that occured while checking units.
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

define([], /**@lends Model.Error*/ function() {
    /**
     * @class
     * @classdesc An error that occured while checking units
     */
    function UnitError(quantity, msg) {
        /**
         * A description of the error that occured.
         *
         * @type {String}
         */
        if (typeof(msg) === 'undefined') {
            this.message = "";
        } else {
            this.message = msg;
        }

        this.quantity = quantity;
    }

    UnitError.prototype.toReadable = function() {
        return "Unit error: " + this.message;
    };

    // Exports are needed, such that other modules may invoke methods from this module file.
    return UnitError;
});
