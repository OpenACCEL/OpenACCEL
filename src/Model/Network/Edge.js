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

        /**
         * The type of the edge. For example, an edge may be a 'regular' edge, if
         * it just connects two normal dependencies. It can also be 'delay', in case
         * the dependency is actually a time dependency.
         */
        this.type = "regular";

        /**
         * No idea what these two variables mean.
         */
        this.stream = {
            up: 0,
            down: 0
        };
    }

    // Exports are needed, such that other modules may invoke methods from this module file.
    return Edge;
});
