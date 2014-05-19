/*
 * File containing the Edge class.
 */

/* Browser vs. Edge ***********************************************/
inBrowser = typeof window !== 'undefined';
inNode    = !inBrowser;

if (inNode) {
    require = require('requirejs');
} else {
    require.config({
        baseUrl: "scripts"
    });
}
/*******************************************************************/

define([], /** @lends Edge */ function() {

    /**
     * @class
     * @classdesc Defines a edge in the network.
     */
    function Edge () {

        /**
         * The name of the Edge.
         *
         * @type {Node}
         */
        var start;

        /**
         * The name of the Edge.
         *
         * @type {Node}
         */
        var end;

    }

    // Exports are needed, such that other modules may invoke methods from this module file.
    return Edge;
});
