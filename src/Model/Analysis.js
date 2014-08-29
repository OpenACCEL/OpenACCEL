/*
 * File containing the Analysis class.
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

define([], /** @lends Model */ function() {

    /**
     * @class
     * @classdesc Main class for the analysis of a script.
     */
    function Analysis () {
        /**
         * The range of the plot window.
         */
        this.range = {
            min: -Infinity,
            max: Infinity
        };

        /**
         * The domain of the plot window.
         *
         * Both the horizontal (x) and vertical (y) axes can have domains.
         * The vertical domain is neccessary for contour plots.
         */
        this.domain = {
            x: {
                min: -Infinity,
                max: Infinity
            },

            y: {
                min: -Infinity,
                max: Infinity
            }
        };

        /**
         * The grid that will serve as a plot background.
         */
        this.grid = {
            majX: 5,
            minX: 21,
            grMajX: 'line',
            grMinX: 'line',
            majY: 5,
            minY: 21,
            grMajY: 'line',
            grMinY: 'line'
        };
    }

    /**
     * Analyses the script.
     *
     * @param {Script} script The script that needs to be analysed.
     */
    Analysis.prototype.analyse = function(script) {};

    // Exports are needed, such that other modules may invoke methods from this module file.
    return Analysis;
});
