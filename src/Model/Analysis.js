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
         * The 2D and 3D quantities to use when requesting an analysis comparison.
         */
        this.x = undefined;
        this.y = undefined;
        this.z = undefined;

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
     * Sets the quantity for the horizontal axis.
     *
     * @param {String} The quantity for the horizontal axis.
     */
    Analysis.prototype.setX = function(x) {
        this.x = x;
    };

    /**
     * Sets the quantity for the vertical axis.
     *
     * @param {String} The quantity for the vertical axis.
     */
    Analysis.prototype.setY = function(y) {
        this.y = y;
    };

    /**
     * Sets the quantity for the upward axis.
     *
     * @param {String} The quantity for the upward axis.
     */
    Analysis.prototype.setZ = function(z) {
        this.z = z;
    };

    /**
     * Sets the script to analyse.
     *
     * @param {Script} script The script that needs to be analysed.
     */
    Analysis.prototype.setScript = function(script) {
        this.script = script;
    };

    /**
     * Calculates the standard deviation of the given quantity.
     *
     * @param  {String} qName The name of the quantity of which to calculate
     * the standard deviation
     * @return {Number} The standard deviation of qName
     */
    Analysis.prototype.calcStdDev = function(qName) {
        return 1;
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

    /**
     * Create a data set that allows the comparison of two quantities.
     * This is ideal for a line plot.
     *
     * @return {Object} An object containing the calculated (x, y) points, range and domain.
     */
    Analysis.prototype.compare2D = function() {
        if (this.script && this.script.isCompiled() && this.x && this.y) {
            // Check whether both quantities exist in the script.
            if (!this.script.hasQuantity(this.x) || !this.script.hasQuantity(this.y)) {
                throw new Error("One of the quantities, " + this.x + " or " + this.y + " is not an existing script quantity.");
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
            data.range = { min: Infinity, max: -Infinity };
            data.domain = domain;

            // Try to calculate the values.
            for (var i = domain.min; i < domain.max; i += step) {
                exe.setValue(this.x, i);
                var ans = exe.getValue(this.y);
                data.points.push({x: i, y: ans});
                exe.reset();

                // With the calculated answers, we can clamp the range of the plot.
                if (ans < data.range.min) {
                    data.range.min = ans;
                } else if (ans > data.range.max) {
                    data.range.max = ans;
                }
            }

            if (!_.isFinite(data.range.min) || !_.isFinite(data.range.max)) {
                throw new Error("Range is not finite: [" + range.min + ", " + range.max + "].");
            }

            return data;
        }

        return [];
    }

    /**
     * Create a data set that allows the comparison of three quantities.
     * This is ideal for a contour plot.
     *
     * @return {Object} An object containing the calculated (x, y, z) points, range and domain.
     */
    Analysis.prototype.compare3D = function() {
        if (this.script && this.script.isCompiled() && this.x && this.y && this.z) {
            // Check whether both quantities exist in the script.
            if (!this.script.hasQuantity(this.x) || !this.script.hasQuantity(this.y) || !this.script.hasQuantity(this.z)) {
                throw new Error("One of the quantities, " + this.x + ", " + this.y + " or " + this.z + " is not an existing script quantity.");
            }

            // Todo: dependency check.
            var exe = this.script.exe;
            var domainX = this.getDomain().x;
            if (!_.isFinite(domainX.min) || !_.isFinite(domainX.max)) {
                throw new Error("Horizontal domain is not finite: [" + domainX.min + ", " + domainX.max + "].");
            }

            var domainY = this.getDomain().y;
            if (!_.isFinite(domainY.min) || !_.isFinite(domainY.max)) {
                throw new Error("Vertical domain is not finite: [" + domainY.min + ", " + domainY.max + "].");
            }

            var intervalX = domainX.max - domainX.min;
            var intervalY = domainY.max - domainY.min;
            var stepX = intervalX / this.getNumIterations();
            var stepY = intervalY / this.getNumIterations();
            var data = {};
            data.points = [];
            data.range = { min: Infinity, max: -Infinity };
            data.domain = this.getDomain();

            // Try to calculate the values.
            var counter = 0;
            for (var i = domainX.min; i < domainX.max; i += stepX) {
                data.points[counter] = [];

                for (var j = domainY.min; j < domainY.max; j += stepY) {
                    exe.setValue(this.x, i);
                    exe.setValue(this.y, j);
                    var ans = exe.getValue(this.z);

                    // We're not pushing an object with x, y, z, but immediatly
                    // push the answer in a 2D array, for Descartes.
                    data.points[counter].push(ans);
                    exe.reset();

                    // With the calculated answers, we can clamp the range of the plot.
                    if (ans < data.range.min) {
                        data.range.min = ans;
                    } else if (ans > data.range.max) {
                        data.range.max = ans;
                    }
                }

                counter++;
            }

            if (!_.isFinite(data.range.min) || !_.isFinite(data.range.max)) {
                throw new Error("Range is not finite: [" + data.range.min + ", " + data.range.max + "].");
            }

            return data;
        }

        return [];
    }

    // Exports are needed, such that other modules may invoke methods from this module file.
    return Analysis;
});
