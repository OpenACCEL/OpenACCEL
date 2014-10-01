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
         * The start of the edge, the "from" part.
         * This is the "tail" in the old version of ACCEL.
         *
         * @type {Node}
         */
        this.start = undefined;

        /**
         * End end of the edge, the "to" part.
         * This is the "head" in the old version of ACCEL.
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
