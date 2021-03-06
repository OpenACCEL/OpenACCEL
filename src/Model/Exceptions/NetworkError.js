/*
 * An error that occured while performing a network request.
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
     * @classdesc An error that occured while performing a network request
     */
    function NetworkError(msg) {
        /**
         * A description of the error that occured.
         *
         * @type {String}
         */
        if (typeof msg !== 'undefined') {
            this.message = msg;
        } else {
            this.message = "";
        }
    }

    // Exports are needed, such that other modules may invoke methods from this module file.
    return NetworkError;
});
