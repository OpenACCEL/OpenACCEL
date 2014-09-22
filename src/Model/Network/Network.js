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
     * Builds the network from the script.
     */
    Network.prototype.buildNetwork = function() {
        if (!this.script) {
            return;
        }

        var quantities = this.script.getQuantities();
        var quantityName;

        // Create a node for each quantity.
        var node;
        var nodes = this.getNodes();

        for (quantityName in quantities) {
            node                = new Node();
            node.quantity       = quantities[quantityName];
            node.x              = this.unitLength * Math.random();
            node.y              = this.unitLength * Math.random();
            node.xn             = 0;
            node.xp             = node.x;
            node.yn             = 0;
            node.yp             = node.y;
            node.force.x        = 0;
            node.force.y        = 0;
            nodes[quantityName] = node;
        }

        // Create edges for all nodes.
        var edge;
        var edges = this.getEdges();

        for (quantityName in quantities) {
            // The quantity will be the start of the edge,
            // and the dependency will be the end.
            for (var dependency in quantities[quantityName].dependencies) {
                edge            = new Edge();
                edge.start      = this.findNode(quantityName);
                edge.end        = this.findNode(dependency);
                edge.upStr      = 0;
                edge.dnStr      = 0;

                if (dependency in quantities[quantityName].nonhistDeps) {
                    edge.type   = "regular";
                } else {
                    edge.type   = "delay";
                }

                edges.push(edge);
            }
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

    /**
     * Calculates the forces of each node, which makes the move into position.
     */
    Network.prototype.calcForces = function() {
        var nodes = this.getNodes();
        var edges = this.getEdges();

        // First, reset all forces to zero.
        for (var node in nodes) {
            nodes[node].force.x = 0;
            nodes[node].force.y = 0;
        }

        // See that the categories are positioned with respect to each other,
        // according to the conventional scheme. Copied from original ACCEL.
        var i, j;
        var catI, catJ;
        for (i in nodes) {
            for (j in nodes) {
                catI = nodes[i].quantity.category;
                catJ = nodes[j].quantity.category;

                if ((catI === 1 && catJ === 4) ||
                    (catI === 3 && catJ === 4) ||
                    (catI === 4 && catJ === 2) ||
                    (catI === 1 && catJ === 2) ||
                    (catI === 3 && catJ === 2))
                {
                    if (nodes[i].x > nodes[j].x) {
                        nodes[i].force.x -= 5 * this.spring;
                        nodes[j].force.x += 5 * this.spring;
                    }
                }

                if ((catI === 1 && catJ === 3) ||
                    (catI === 1 && catJ === 4) ||
                    (catI === 4 && catJ === 3) ||
                    (catI === 1 && catJ === 2) ||
                    (catI === 2 && catJ === 3))
                {
                    if (nodes[i].x > nodes[j].x) {
                        nodes[i].force.y -= 5 * this.spring;
                        nodes[j].force.y += 5 * this.spring;
                    }
                }
            }

            if (nodes[i].x <                   5) { nodes[i].force.x += 5 * this.spring; }
            if (nodes[i].x > this.unitLength - 5) { nodes[i].force.x -= 5 * this.spring; }
            if (nodes[i].y <                   5) { nodes[i].force.y += 5 * this.spring; }
            if (nodes[i].y > this.unitLength - 5) { nodes[i].force.y -= 5 * this.spring; }
        }

        // Next, we make sure that all edge starts are left of the edge tails.
        for (var edge in edges) {
            if (edges[edge].end.x < edges[edge].start.x) {
                if (edges[edge].type === "regular") {
                    edges[edge].end.force.x     += 5 * this.spring;
                    edges[edge].start.force.x   -= 5 * this.spring;
                }
            }
        }

        // Next, make sure nodes are not cluttered.
        var dx, dy, r, dux, duy;
        for (i in nodes) {
            for (j in nodes) {
                if (i !== j) {
                    dx  = nodes[i].x - nodes[j].x;
                    dy  = nodes[i].y - nodes[j].y;
                    r   = Math.sqrt(dx * dx + dy * dy + 0.00001);
                    dux = dx / r;
                    duy = dy / r;

                    if (r < this.tooCloseForComfort) {
                        nodes[i].force.x += 0.5 * this.spring * (this.tooCloseForComfort - r) * dux;
                        nodes[i].force.y += 0.5 * this.spring * (this.tooCloseForComfort - r) * duy;
                        nodes[j].force.x -= 0.5 * this.spring * (this.tooCloseForComfort - r) * dux;
                        nodes[j].force.y -= 0.5 * this.spring * (this.tooCloseForComfort - r) * duy;
                    }
                }
            }
        }
    };

    /**
     * Updates the location of the nodes, after the forces have been calculated.
     */
    Network.prototype.updateLocations = function() {
        var node;
        var nodes = this.getNodes();

        for (node in nodes) {
            if (nodes[node] !== this.recentlyClickedNode) {
                nodes[node].xn = (2 * nodes[node].x - nodes[node].xp + nodes[node].force.x) - this.damp * (nodes[node].x - nodes[node].xp);
                nodes[node].yn = (2 * nodes[node].y - nodes[node].yp + nodes[node].force.y) - this.damp * (nodes[node].y - nodes[node].yp);
            }
        }

        for(node in nodes){
            nodes[node].xp  = nodes[node].x;
            nodes[node].yp  = nodes[node].y;
            nodes[node].x   = nodes[node].xn;
            nodes[node].y   = nodes[node].yn;
        }
    };

    // Exports are needed, such that other modules may invoke methods from this module file.
    return Network;
});
