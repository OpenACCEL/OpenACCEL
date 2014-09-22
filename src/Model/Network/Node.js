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

define([], /** @lends Model.Network */ function() {

    /**
     * @class
     * @classdesc Defines a node in the network.
     */
    function Node () {

        /**
         * The quantity that this node represents.
         *
         * @type {Quantity}
         */
        this.quantity = undefined;

        /**
         * The x-position of the node.
         *
         * @type {Number}
         */
        this.x = 0;

        /**
         * The y-position of the node.
         *
         * @type {Number}
         */
        this.y = 0;

        /**
         * The force of a node that pushes it into its correct position.
         */
        this.force = {
            x: 0,
            y: 0
        }
    }

    // Exports are needed, such that other modules may invoke methods from this module file.
    return Node;
});
