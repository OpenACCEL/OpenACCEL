/* Browser vs. Node ***********************************************/
inBrowser = typeof window !== 'undefined';
inNode = !inBrowser;

if (inNode) {
    require = require('requirejs');
} else {
    require.config({
        baseUrl: "scripts"
    });
}
/*******************************************************************/

// If all requirements are loaded, we may create our 'class'.
define(["lodash", "View/Graphics/AbstractDescartesHandler", "Model/Network/Network"],
    /** @lends View.Graphics */
    function(_, AbstractDescartesHandler, Network) {

        /**
         * @class
         * @classdesc The NetworkDescartesHandler class handles the drawing of Network objects.
         */
        function NetworkDescartesHandler(modelElement) {
            /**
             * The initial Network object this handler will be drawing.
             *
             * @type {Network}
             */
            this.modelElement = modelElement;

            this.propagatables.push({
                name: "getNetwork",
                func: this.getNetwork.bind(this)
            });
        }

        NetworkDescartesHandler.prototype = new AbstractDescartesHandler();

        /**
         * Returns whether this handler is capable of drawing the given object.
         *
         * @param modelElement {Object} The object of which we want to know if it can be drawn.
         * @return {boolean} modelElement instance of Network
         */
        NetworkDescartesHandler.prototype.canHandle = function(modelElement) {
            return modelElement instanceof Network;
        };

        /**
         * Returns a new instance of this object, accomodating for the given object.
         *
         * @param modelElement {Network} The object to be accomodated.
         * @return {NetworkDescartesHandler} The handler assigned to draw modelElement.
         */
        NetworkDescartesHandler.prototype.getInstance = function(modelElement) {
            return new NetworkDescartesHandler(modelElement);
        };

        /**
         * @return The Network model element.
         */
        NetworkDescartesHandler.prototype.getNetwork = function() {
            return this.modelElement;
        };

        /**
         * Adds a new descartes object to the array of descartes objects to be drawn to.
         * This handler also includes a click callback.
         *
         * @param div {String} The div in the html file in which the new descartes object must draw.
         * @param width {float} The width in pixels over which the new descartes object must draw.
         * @param height {float} The height in pixels over which the new descartes object must draw.
         * @modifies descartesInstances {Array<descartes>} The new descartes object gets appended to this.
         */
        NetworkDescartesHandler.prototype.addDescartes = function(div, width, height) {
            var click = this.clickCallback.bind(this);
            var move  = this.moveCallback.bind(this);
            this.descartesInstances[div] = new descartes({
                dN: div,
                cW: width,
                cH: height,
                cB: click,
                cMove: move
            });

            this.descartesInstances[div].setUpGraph();
        };

        /**
         * The click callback to be used by descartes when the mouse is clicked over it.
         *
         * @param x {float} The mouse position on the x axis, normalised to [0...1].
         * @param y {float} The mouse position on the y axis, normalised to [0...1].
         */
        NetworkDescartesHandler.prototype.clickCallback = function(x, y) {
            var point = this.mapPoint({
                'x': x * this.coordinateScale,
                'y': y * this.coordinateScale
            });

            var network = this.getNetwork();
            var nodes = network.getNodes();

            if (_.size(nodes) === 0) {
                return;
            }

            var xx = x * network.unitLength;
            var yy = y * network.unitLength;
            var closestNode = null;
            var closestDist = Infinity;
            var thisDist    = 0;

            var node;
            for (node in nodes){
                thisDist = Math.pow(xx - nodes[node].x, 2) + Math.pow(yy - nodes[node].y, 2);

                if (thisDist < closestDist) {
                    closestNode = nodes[node];
                    closestDist = thisDist;
                }
            }

            if (closestNode === network.recentlyClickedNode) {
                network.recentlyClickedNode = null;
                var edge;
                for (node in nodes) {
                    nodes[node].hops.up = 0;
                    nodes[node].hops.down = 0;
                }

                var edges = network.getEdges();
                for (edge in edges) {
                    edges[edge].stream.up = 0;
                    edges[edge].stream.down = 0;
              }

              // Empty quantity description
              $("#nw_qtyDefinition").text("No node selected");
              $("#nw_qtyComment").html("&nbsp;");
            } else {
              network.recentlyClickedNode = closestNode;
              network.streams();
              $("#nw_qtyDefinition").text(closestNode.quantity.source);
              $("#nw_qtyComment").text(closestNode.quantity.getComment());
            }

            this.drawInstances();
        };

        /**
         * The move callback to be used by descartes when the mouse moves over the canvas.
         *
         * @param x {float} The mouse position on the x axis, normalised to [0...1].
         * @param y {float} The mouse position on the y axis, normalised to [0...1].
         */
        NetworkDescartesHandler.prototype.moveCallback = function(x, y) {
            var network = this.getNetwork();
            var nodes = network.getNodes();
            var xx = x * network.unitLength;
            var yy = y * network.unitLength;

            if (network.recentlyClickedNode) {
                network.recentlyClickedNode.x  = xx;
                network.recentlyClickedNode.y  = yy;
                network.recentlyClickedNode.xn = xx;
                network.recentlyClickedNode.yn = yy;
            }
        };

        /**
         * Returns the drawing of the network.
         *
         * @return {Object[]} The descartes drawing based on this.modelElement
         */
        NetworkDescartesHandler.prototype.getDrawing = function() {
            var network = this.getNetwork();

            // If the network has a script, it has been build, otherwise GTFO.
            if (!network.script) {
                return;
            }

            // Update locations of the nodes and edges.
            network.calcForces();
            network.updateLocations();

            var nodes = network.getNodes();
            var edges = network.getEdges();

            var nodesData = [];
            var edgesData = [];
            var nodesShadowData = [];

            var i;
            for (i in nodes) {
                nodesData.push({
                    x:          nodes[i].x,
                    y:          nodes[i].y,
                    tag:        i,
                    fcol_r:     240 * nodes[i].hops.up + 16,
                    fcol_b:     240 * nodes[i].hops.down + 16,
                    fcol_g:     0,
                    pointSize:  2 * Math.max(nodes[i].hops.down, nodes[i].hops.up) + 1.2
                });

                nodesShadowData.push({
                    x:          nodes[i].x,
                    y:          nodes[i].y,
                    tag:        i,
                    pointSize:  2 * Math.max(nodes[i].hops.down, nodes[i].hops.up) + 1.2
                });
            }

            for (i in edges) {
                edgesData.push({
                    b:          edges[i].end.id,
                    e:          edges[i].start.id,
                    thickness:  Math.max(edges[i].stream.down, edges[i].stream.up) + 0.1,
                    col_r:      edges[i].type === 'regular' ? (edges[i].stream.down > edges[i].stream.up ? 255 : 0) : 0,
                    col_b:      edges[i].type === 'regular' ? (edges[i].stream.down <= edges[i].stream.up ? 255 : 0) : 0,
                    col_g:      edges[i].type === 'regular' ? 0 : 255
                  });
            }

            var drawing = [
                {
                    locations: {
                        data: nodesData,
                        icon: "bubble",
                        tagy: -3,
                        tcol_r: 0,
                        tcol_g: 0,
                        tcol_b: 0,
                        rad: 1
                    },
                    edges: {
                        data: edgesData
                    }
                },
                {
                    locations: {
                        data: nodesShadowData,
                        icon: "none",
                        tagy: -2.6,
                        tagx: 0.3,
                        tcol_r: 255,
                        tcol_g: 255,
                        tcol_b: 255
                    }
                }
            ];

            return drawing;
        };

        // Exports are needed, such that other modules may invoke methods from this module file.
        return NetworkDescartesHandler;
    });
