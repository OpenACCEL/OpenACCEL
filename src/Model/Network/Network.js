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

define(["Model/Script", "Model/Network/Node", "Model/Network/Edge"], /** @lends Model.Network */ function(Script, Node, Edge) {

    /**
     * @class
     * @classdesc Main class for the network of a script.
     */
    function Network () {

        /**
         * The script that contains the quantities to be displayed in the network.
         *
         * @type {Script}
         */
        this.script = undefined;

        /**
         * The nodes of the script / network. Each node represents a quantity.
         * This is a dictionary of quantities, defined by their name as a string.
         * Associated with each quantity is its node.
         *
         * @type {map<String, Node>}
         */
        this.nodes = [];

        /**
         * The edges of the script / network.
         *
         * @type {Edge[]}
         */
        this.edges = [];

        /**
         * Whether the network is currently 'running'.
         *
         * @type {Boolean}
         */
        this.running = false;

        /**
         * No idea what meaning behind this variable is.
         */
        this.unitLength = 100;

        /**
         * Various force parameters.
         */
        this.spring = 0.1;
        this.damp = 0.4;
        this.tooCloseForComfort = 0.05 * this.unitLength;

        /**
         * The most recently clicked node of the network.
         *
         * @type {Node}
         */
        this.recentlyClickedNode = undefined;
    }

    /**
     * Getter for the nodes in the network.
     *
     * @return {Node} the nodes in the network.
     */
    Network.prototype.getNodes = function() {
        return this.nodes;
    };

    /**
     * Getter for the edges in the network.
     *
     * @return {Edge} the edges in the network.
     */
    Network.prototype.getEdges = function() {
        return this.edges;
    };

    /**
     * Set The script that contains the quantities to be displayed in the network.
     *
     * @param {Script} The script that contains the quantities to be displayed in the network.
     */
    Network.prototype.setScript = function(script) {
        if (script instanceof Script) {
            this.script = script;
            this.buildNetwork();
        }
    };

    /**
     * Find a node by its name.
     *
     * @param  {String} The name of the node to find.
     * @return {Node} The node if one is found, null otherwise.
     */
    Network.prototype.findNode = function(name) {
        if (this.nodes[name]) {
            return this.nodes[name];
        }

        return null;
    };

    // Exports are needed, such that other modules may invoke methods from this module file.
    return Network;
});
