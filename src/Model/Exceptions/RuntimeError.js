/*
 * An error that occured while executing the model.
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
     * @classdesc An error that occured during model execution
     */
    function RuntimeError(msg) {
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
    }

    // Exports are needed, such that other modules may invoke methods from this module file.
    return RuntimeError;
});
