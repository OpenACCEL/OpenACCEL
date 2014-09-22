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

define([], /** @lends Model.Network */ function() {

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
        this.start = undefined;

        /**
         * The name of the Edge.
         *
         * @type {Node}
         */
        this.end = undefined;

    }

    // Exports are needed, such that other modules may invoke methods from this module file.
    return Edge;
});
