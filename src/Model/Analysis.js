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

define(["underscore"], /** @lends Model */ function(_) {

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

        /**
         * The script that this class will analyse.
         */
        this.script;

        /**
         * The number of iterations, or points that should be plot
         * for a normal comparison plot.
         */
        this.numIterations = 50;
    }

    /**
     * Sets the script to analyse.
     *
     * @param {Script} script The script that needs to be analysed.
     */
    Analysis.prototype.setScript = function(script) {
        this.script = script;
    };

    /**
     * Sets a target interval to source interval.
     * An example input would be: setRange(this.range, {min: 5, max:10}).
     *
     * @throws {Error} An invalid range, meaning min >= max.
     * @param {Object} The source interval object.
     * @param {Object} The target interval object.
     */
    Analysis.prototype.setInterval = function(target, source) {
        if (_.isNumber(source.min)) {
            if (_.isNumber(source.max)) {
                if (source.min >= source.max) {
                    throw new Error("[" + range.min + ", " + range.max + "] is not a valid range.");
                } else {
                    target.min = source.min;
                    target.max = source.max;
                }
            } else {
                if (source.min >= target.max) {
                    throw new Error("[" + range.min + ", " + target.max + "] is not a valid range.");
                } else {
                    target.min = source.min;
                }
            }
        } else if (_.isNumber(source.max)) {
            if (target.min >= source.max) {
                throw new Error("[" + target.min + ", " + range.max + "] is not a valid range.");
            } else {
                target.max = source.max;
            }
        }
    }

    /**
     * Sets the range of the plot window.
     * An example input would be: setRange({min: 5, max:10}).
     *
     * @throws {Error} An invalid range, meaning min >= max.
     * @param A range object, containing a min or max property, or both.
     */
    Analysis.prototype.setRange = function (range) {
        this.setInterval(this.range, range);
    };

    /**
     * @return The range of the plot window.
     */
    Analysis.prototype.getRange = function() {
        return this.range;
    };

    /**
     * Sets the domain of the plot window.
     * An example input would be: setRange({x: {min: 5, max:10}}).
     * There are two domains possible, the horizontal axis x,
     * and the vertical axes y (in case of contour plots).
     *
     * @throws {Error} An invalid range, meaning min >= max.
     * @param A range object, containing a min or max property, or both.
     */
    Analysis.prototype.setDomain = function (domain) {
        if (domain.x) {
            this.setInterval(this.domain.x, domain.x);
        }

        if (domain.y) {
            this.setInterval(this.domain.y, domain.y);
        }
    };

    /**
     * @return The domain of the plot window.
     */
    Analysis.prototype.getDomain = function() {
        return this.domain;
    };

    /**
     * Set the number of iterations, or points that should be plot
     * for a normal comparison plot.
     *
     * @pre num > 0.
     * @param {Number} The number of points that should be evaluated.
     */
    Analysis.prototype.setNumIterations = function(num) {
        if (num > 0) {
            this.numIterations = num;
        }
    };

    /**
     * @return the number of iterations, or points that should be plot for a normal comparison plot.
     */
    Analysis.prototype.getNumIterations = function() {
        return this.numIterations;
    };

    // Exports are needed, such that other modules may invoke methods from this module file.
    return Analysis;
});
