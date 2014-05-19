/*
 * File containing the Node class.
 */

/* Browser vs. Node ***********************************************/
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

define([], /** @lends Node */ function() {

    /**
     * @class
     * @classdesc Defines a node in the network.
     */
    function Node () {

        /**
         * The name of the node.
         *
         * @type {String}
         */
        var name;

        /**
         * The x-position of the node.
         *
         * @type {int}
         */
        var x;

        /**
         * The y-position of the node.
         *
         * @type {int}
         */
        var y;
    }

    // Exports are needed, such that other modules may invoke methods from this module file.
    return Node;
});
