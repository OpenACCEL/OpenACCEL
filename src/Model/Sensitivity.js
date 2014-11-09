/*
 * File containing the Sensitivity class.
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

define(["Model/Script", "View/Input", "View/HTMLBuffer", "lodash"], /** @lends Model */ function(Script, Input, HTMLBuffer, _) {
    /**
     * @class
     * @classdesc Class responsible for performing sensitivity analysis on a set of quantities.
     */
    function Sensitivity(htmlelem) {
        /**
         * The sensitivity analysis html table buffer.
         *
         * @type {HTMLBuffer}
         */
        this.analysisTable = htmlelem;

        /**
         * Whether to use percentages or absolute spreading in the sensitivity analysis.
         *
         * @type {String}
         */
        this.calcmode = 'p';

        /**
         * The quantities in the script that can be plotted. These are the quantities
         * that have atomic numeric values. Keyed by quantity name, value is an object
         * {'quantity': Quantity, 'value': value}.
         *
         * @type {Object}
         */
        this.compareQuantities = {};

        /**
         * The category 2 quantities that will be shown in the sensitivity table
         *
         * @type {Array}
         */
        this.senscat2 = [];

        /**
         * The category 1 and 3 quantities that will be shown in the sensitivity table
         *
         * @type {Array}
         */
        this.senscat13 = [];

        /**
         * Datastructure holding the information in the sensitivity table. It is actually a 2d-array
         * with as first index the category 1 or 3 quantity (row) and as second index the cat 2
         * quantity (column). The value is the computed sensitivity, absolute or relative.
         *
         * @type {Object}
         */
        this.senstbl = {};

        /**
         * Same structure as senstbl, but with the reverse order of the 2 indices.
         * Used to calculate the variances.
         */
        this.pseudoPDs = {};

        /**
         * The percentual or absolute deviations with which the sensitivity will be computed
         * for a cat 1 or 3 quantity. Keyed by quantity name.
         *
         * @type {Object}
         */
        this.percs = {};
    }

    /**
     * Returns the given value except when the given quantity is a cat 1 slider: in that
     * case the value is clipped to the range of the slider.
     *
     * @param  {String} q The name of the quantity of which to carefully set the value
     * @param  {Number} v The value to try to set
     * @return {Number} The given value, clipped to the appropriate range if nessecary.
     */
    Sensitivity.prototype.carefullySetValue = function(q, v) {
        var qty = controller.getScript().getQuantity(q);
        var cat = qty.category;

        if (cat === 1) {
            var inp = qty.input;
            if (inp.type === 'slider') {
                if (v < inp.parameters[1]) {
                    v = inp.parameters[1];
                }

                if (v > inp.parameters[2]) {
                    v = inp.parameters[2];
                }
            }
        }

        return v;
    };

    /**
     * Performs the sensitivity analysis and constructs and displays the results table for it.
     */
    Sensitivity.prototype.analyse = function(quantities) {
        this.compareQuantities = quantities;
        this.senstbl = {};
        this.pseudoPDs = {};
        this.senscat2 = [];
        this.senscat13 = [];

        var script = controller.getScript();
        if (script.isCompiled() === false) {
            alert("Unable to do sensitivity analysis: the script has not been compiled yet.");
        } else {
            // Determine all category 2 and category (1 or 3) quantities that have a numeric,
            // atomic value
            var elem;
            for (elem in this.compareQuantities) {
                var q = this.compareQuantities[elem].quantity;
                if (q.category === 2) {
                    this.senscat2.push(q.name);
                } else if (q.category === 1 || q.category === 3) {
                    this.senscat13.push(q.name);
                }
            }

            // Fill in default percentage values
            for (var elem in this.senscat13) {
                var q = this.senscat13[elem];
                this.percs[q] = 1.0;
            }

            // Create 2d arrays
            for (var elem in this.senscat13) {
                var q = this.senscat13[elem];
                this.senstbl[q] = {};
            }
            for (var elem in this.senscat2) {
                var q = this.senscat2[elem];
                this.pseudoPDs[q] = {};
            }

            /*----- Calculate table values -----*/
            for (elem in this.senscat13) {
                var q13 = this.senscat13[elem];
                this.calcSensitivity(q13, (this.calcmode === 'p'));
            }

            // Draw table
            this.drawTable();
        }
    };

    /**
     * Calculates the sensitivities of all cat 2 quantities relative to the given
     * cat 1 or 3 (q13) quantity, absolute or relative, and updates the values in the
     * table datastructure. Also updates the entries in the pseudo partial derivatives
     * table.
     *
     * @param  {String} q13 The name of the cat 1 or 3 quantity of which to
     * update the sensitivities
     * @param {Boolean} relative Whether to compute the relative sensitivities, as
     * opposed to the absolute ones.
     * @post this.senstbl[q13] and this.pseudoPDs have been recalculated based on the current
     * value of the given q13 quantity.
     * @modifies this.senstbl
     * @modifies this.pseudoPDs
     */
    Sensitivity.prototype.calcSensitivity = function(q13, relative) {
        var script = controller.getScript();
        var nul = []
        var plus = [];
        var min = [];

        var value;
        for (el in this.compareQuantities) {
            if (this.compareQuantities[el].quantity.name === q13) {
                value = this.compareQuantities[el].value;
                break;
            }
        }

        // Determine the delta to use, as specified by the user or if not, the default of 1.0
        var delta;
        if (relative === true) {
            delta = this.percs[q13] * value / 100;
        } else {
            delta = this.percs[q13];
        }

        // Get current values of all cat2 quantities, and prepare pos and neg objects
        // with same values for now
        for (elem in this.senscat2) {
            var q2 = this.senscat2[elem];
            var q2val;
            for (el in this.compareQuantities) {
                if (this.compareQuantities[el].quantity.name === q2) {
                    q2val = this.compareQuantities[el].value;
                    break;
                }
            }

            nul.push({'name': q2, 'value': q2val});
            plus.push({'name': q2, 'value': q2val});
            min.push({'name': q2, 'value': q2val});
        }

        // Get value of current+delta and current-delta for all cat2 quantities
        // We cannot simply increment and decrement the current value with delta
        // because we have to take into account quantities that are input sliders
        // which have upper and lower bounds
        var plusval = this.carefullySetValue(q13, value+delta)
        var minusval = this.carefullySetValue(q13, value-delta);

        var err = false;
        try {
            script.exe.executeQuantities([{'name': q13, 'value': plusval}], plus, 0);
            script.exe.executeQuantities([{'name': q13, 'value': minusval}], min, 0);
        } catch (e) {
            // Fill in error message. We do not add something to the this.pseudoPDs array
            // so this value will just be ignored when computing the variances.
            for (elem in this.senscat2) {
                var q2 = this.senscat2[elem];
                this.senstbl[q13][q2] = e.message;
            }
            err = true;
        } finally {
            // Make sure to reset the value!
            script.exe.setValue(q13, value);
        }
        if (err === true) {
            return;
        }

        // Convert arrays which now hold the result values to indexed objects, for convenience
        var plusres = {};
        var minres = {};
        var nulres = {};
        for (var el in plus) {
            var obj = plus[el];
            plusres[obj.name] = obj.value;
        }
        for (var el in min) {
            var obj = min[el];
            minres[obj.name] = obj.value;
        }
        for (var el in nul) {
            var obj = nul[el];
            nulres[obj.name] = obj.value;
        }

        // Determine all sensitivity results and store them in the table
        for (elem in nul) {
            var q2 = nul[elem].name;
            if (isNumeric(nulres[q2]) && isNumeric(plusres[q2]) && isNumeric(minres[q2])) {
                // First store the pseudo-partial derivative
                var pd = (Math.abs(plusres[q2]-nulres[q2]) + Math.abs(minres[q2]-nulres[q2]))/(2*delta);
                this.pseudoPDs[q2][q13] = pd;

                // Now compute the actual sensitivity for display in the table
                var sens = (Math.abs(plusres[q2]-nulres[q2]) + Math.abs(minres[q2]-nulres[q2]))/2.0;
                if (!relative) {
                    this.senstbl[q13][q2] = sens.toPrecision(2);
                } else {
                    // Relative sensitivity
                    if (nulres[q2] != 0) {
                        this.senstbl[q13][q2] = (sens / (0.01 * nulres[q2] * this.percs[q13])).toPrecision(2);
                    } else {
                        // Division by zero
                        if (plusres[q2] === minres[q2]) {
                            this.senstbl[q13][q2] = '0/0';
                        } else {
                            this.senstbl[q13][q2] = '.../0';
                        }
                    }
                }
            } else {
                // Results of plus, min or nul not numeric
                this.senstbl[q13][q2] = 'NaN';
            }
        }
    };

    /**
     * Draws and displays the table with the sensitivity information
     * from this.senstbl and this.pseudoPDs. Call this.sensAnalysis first
     * to compute those values.
     */
    Sensitivity.prototype.drawTable = function() {
        var script = controller.getScript();

        this.analysisTable.empty();

        /*--- Table heading ---*/
        var head = '<div class="an_senstblhdrow"><div class="an_senstblhd" style="text-align: left">Name</div>';
        head += '<div class="an_senstblhd">Delta</div>';

        var qName;
        for (elem in this.senscat2) {
            head += '<div class="an_senstblhd">' + this.senscat2[elem] + '</div>';
        }

        head += '</div>';
        this.analysisTable.append(head);


        /*--- Standard deviation row ---*/
        var stdev = '<div class="an_senstblstdrow"><div class="tblcell" style="text-align: left;">Std. dev:</div>';
        var btnvalue = (this.calcmode === 'a') ? "Absolute:" : "Percentage:";
        stdev += '<div class="tblcell"><input id="sens_modebutton" type="button" class="buttonin" value="' + btnvalue + '" onclick="view.tabs.analysis.sensitivity.toggleMode();" title="Toggle between absolute and relative sensitivity" /></div>';

        for (elem in this.senscat2) {
            stdev += '<div class="tblcell">' + this.computeVariance(this.senscat2[elem]) + '</div>';
        }

        stdev += '</div>';
        this.analysisTable.append(stdev);


        /*--- Table body ---*/
        // First all category 1 quantities
        for (row in this.senstbl) {
            if (script.getQuantity(row).category !== 1) {
                continue;
            }

            var tbody = '<div class="an_senstblrow">';
            var column = this.senstbl[row];

            // Cat 1 or 3 quantity name
            tbody += '<div class="tblcell_qty1name">' + row + '</div>';
            // Absolute or relative deviation used
            tbody += '<div class="tblcell"><input id="perc_' + row + '" type="number" class="percinput" value="' + this.percs[row] + '" /></div>';
            // Make sure to display the sensitivities of the cat 2 quantities in the same order
            // as the quantities are displayed in the column heading
            for (col in this.senscat2) {
                var v = column[this.senscat2[col]];
                if (isNumeric(v)) {
                    tbody += '<div class="tblcell_qty1val" style="' + this.getStyleForValue(v, 1) + '">' + v + '</div>';
                } else {
                    tbody += '<div class="tblcell_error" title="' + v + '">err</div>';
                }
            }

            tbody += '</div>';
            this.analysisTable.append(tbody);
        }

        // Then all category 3 quantities
        for (row in this.senstbl) {
            if (script.getQuantity(row).category !== 3) {
                continue;
            }

            var tbody = '<div class="an_senstblrow">';
            var column = this.senstbl[row];

            // Cat 1 or 3 quantity name
            tbody += '<div class="tblcell_qty3name">' + row + '</div>';
            // Absolute or relative deviation used
            tbody += '<div class="tblcell"><input id="perc_' + row + '" type="number" class="percinput" value="' + this.percs[row] + '" /></div>';
            // Make sure to display the sensitivities of the cat 2 quantities in the same order
            // as the quantities are displayed in the column heading
            for (col in this.senscat2) {
                var v = column[this.senscat2[col]];
                if (isNumeric(v)) {
                    tbody += '<div class="tblcell_qty3val" style="' + this.getStyleForValue(v, 3) + '">' + v + '</div>';
                } else {
                    tbody += '<div class="tblcell_error" title="' + v + '">err</div>';
                }
            }

            tbody += '</div>';
            this.analysisTable.append(tbody);
        }

        this.analysisTable.flip();

        // Attach event handlers to deviation inputs
        $('.percinput').on('keydown', function(e) {
            if (e.which === 13) {
                e.preventDefault();

                var q13 = e.target.id.substring(5);
                var calcmode = view.tabs.analysis.sensitivity.calcmode;
                view.tabs.analysis.sensitivity.percs[q13] = parseFloat($(e.target).val());
                view.tabs.analysis.sensitivity.calcSensitivity(q13, (calcmode === 'p'));
                view.tabs.analysis.sensitivity.drawTable();

                e.stopPropagation();
                e.cancelBubble = true;
            }
        }).on("change", function(e) {
            var q13 = e.target.id.substring(5);
            var calcmode = view.tabs.analysis.sensitivity.calcmode;
            view.tabs.analysis.sensitivity.percs[q13] = parseFloat($(e.target).val());
            view.tabs.analysis.sensitivity.calcSensitivity(q13, (calcmode === 'p'));
            view.tabs.analysis.sensitivity.drawTable();

            e.stopPropagation();
            e.cancelBubble = true;
        });

        // Click on error messages
        $('.tblcell_error').on('click', function(e) {
            var msg = $(this).attr('title');
            alert(msg);

            e.stopPropagation();
            e.cancelBubble = true;
        });
    };

    Sensitivity.prototype.getStyleForValue = function(val, cat) {
        if (this.calcmode === 'p') {
            if (val > 1.5) {
                return "color: #ff0000";
            } else {
                if (cat === 1) {
                    return "color: #ffffff";
                } else {
                    return "color: #aaaaaa";
                }
            }
        } else {
            if (cat === 1) {
                return "color: #ffffff";
            } else {
                return "color: #aaaaaa";
            }
        }
    };

    /**
     * Changes the mode from relative to absolute, or the other way around,
     * depending on the current value.
     *
     * @post this.calcmode has been toggled from 'p' to 'a' or the other way around.
     */
    Sensitivity.prototype.toggleMode = function() {
        if (this.calcmode === 'a') {
            this.calcmode = 'p';
            $("#sens_modebutton").attr("value", "Percentage:");
            this.analyse(this.compareQuantities);
        } else {
            this.calcmode = 'a';
            $("#sens_modebutton").attr("value", "Absolute:");
            this.analyse(this.compareQuantities);
        }
    };

    /**
     * Computes the standard deviation of the given category 2 quantity
     *
     * @param  {String} q2 The name of the category 2 quantity of wich to
     * compute the standard deviation.
     * @return {Number} The standard deviation of q2.
     */
    Sensitivity.prototype.computeVariance = function(q2) {
        // First check whether the value isn't zero!
        var value;
        for (el in this.compareQuantities) {
            if (this.compareQuantities[el].quantity.name === q2) {
                value = this.compareQuantities[el].value;
                break;
            }
        }
        if (value === 0) {
            return ".../0";
        }

        var sum = 0;
        for (elem in this.pseudoPDs[q2]) {
            var pd = this.pseudoPDs[q2][elem];

            var sig = 0.0;
            if (this.calcmode === 'a') {
                sig = this.percs[elem];
            } else {
                var val;
                for (el in this.compareQuantities) {
                    if (this.compareQuantities[el].quantity.name === elem) {
                        val = this.compareQuantities[el].value;
                        break;
                    }
                }
                sig = this.percs[elem] * val / 100.0;
            }

            sum += Math.pow(pd*sig, 2);
        }

        var rSig = Math.sqrt(sum) * (100/value);
        return rSig.toPrecision(2);
    };

    // Exports are needed, such that other modules may invoke methods from this module file.
    return Sensitivity;
});
