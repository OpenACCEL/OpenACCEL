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

    Analysis.prototype.compare = function(x, y) {
        if (this.script && this.script.isCompiled()) {
            // Check whether both quantities exist in the script.
            if (!this.script.hasQuantity(x) || !this.script.hasQuantity(y)) {
                throw new Error("One of the quantities, " + x + " or " + y + " is not an existing script quantity.");
            }

            // Todo: dependency check.
            var exe = this.script.exe;
            var domain = this.getDomain().x;
            if (!_.isFinite(domain.min) || !_.isFinite(domain.max)) {
                throw new Error("Domain is not finite: [" + domain.min + ", " + domain.max + "].");
            }

            var interval = domain.max - domain.min;
            var step = interval / this.getNumIterations();
            var data = {};
            data.points = [];

            // Try to calculate the values.
            for (var i = domain.min; i < domain.max; i += step) {
                exe.setValue(x, i);
                var ans = exe.getValue(y);
                data.points.push({x: i, y: ans});
                exe.reset();
            }

            // With the calculated answers, we can clamp the range of the plot.
            var range = {
                min: _.min(data.points, function(point) { return point.y; }).y,
                max: _.max(data.points, function(point) { return point.y; }).y
            };
            if (!_.isFinite(range.min) || !_.isFinite(range.max)) {
                throw new Error("Range is not finite: [" + range.min + ", " + range.max + "].");
            }
            this.setRange(range);

            data.range = range;
            data.domain = domain;

            return data;
        }

        return [];
    }

    // Exports are needed, such that other modules may invoke methods from this module file.
    return Analysis;
});
