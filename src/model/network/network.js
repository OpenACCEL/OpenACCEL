/*
 * File containing the Network class.
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
     * @classdesc Main class for the network of a script.
     */
    function Network () {

        /**
         * The quantities to be displayed in the network.
         *
         * @type {Quantity[]}
         */
        var quantities;
    }

    /**
     * Set the quantities to be displayed in the network.
     *
     * @param {Quantity[]} quantities the quantities to be displayed in the network.
     */
    Network.prototype.setQuantities = function(quantities) {};

    /**
     * Getter for the nodes in the network.
     *
     * @return {Node} the nodes in the network.
     */
    Network.prototype.getNodes = function() {};

    /**
     * Getter for the edges in the network.
     *
     * @return {Edge} the edges in the network.
     */
    Network.prototype.getEdges = function() {};

    /**
     * Set the positions of the node in the network.
     *
     * @param {Node} node the node to be updated.
     * @param {int}  x    the x-position of the node.
     * @param {int}  y    the y-position of the node.
     */
    Network.prototype.SetNodePosition = function(node, x, y) {};

    // Exports are needed, such that other modules may invoke methods from this module file.
    return Network;
});
