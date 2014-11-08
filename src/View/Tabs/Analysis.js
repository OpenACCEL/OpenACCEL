require.config({
    baseUrl: "scripts"
});

define(["View/Input", "View/HTMLBuffer", "Model/Analysis", "lodash"], /**@lends View*/ function(Input, HTMLBuffer, AnalysisModel, _) {
    /**
     * @class
     * @classdesc The Analysis tab.
     */
    function Analysis(canvasCreator) {
        /**
         * The plot windopw where one quantity can be plotted against the other,
         * in case they are dependant on each other.
         */
        this.canvas = canvasCreator.createCanvas(new AnalysisModel(), "analysis_plot", 300, 300);

        /**
         * Which mode to use for plotting the graphs: graph or contour.
         *
         * @type {String}
         */
        this.mode = "graph";
        this.setPlotType(this.mode);

        /**
         * Whether to use percentages or absolute spreading in the sensitivity analysis.
         *
         * @type {String}
         */
        this.calcmode = 'p';

        /**
         * The percentual or absolute deviations with which the sensitivity will be computed
         * for a cat 1 or 3 quantity. Keyed by quantity name.
         *
         * @type {Object}
         */
        this.percs = {};

        /**
         * The HTML buffers for the list of argument and result quantities
         *
         * @type {HTMLBuffer}
         */
        this.argList = new HTMLBuffer('#an_arguments');
        this.resultList = new HTMLBuffer('#an_results');

        /**
         * The sensitivity analysis html table buffer.
         *
         * @type {HTMLBuffer}
         */
        this.analysisTable = new HTMLBuffer('#an_senscontainer');

        /**
         * The quantities in the script that can be plotted. These are the quantities
         * that have atomic numeric values. Keyed by quantity name, value is an object
         * {'quantity': Quantity, 'value': value}.
         *
         * @type {Object}
         */
        this.compareQuantities = {};

        this.analysis = undefined;
    }

    /**
     * Event that gets called when this tab gets opened.
     */
    Analysis.prototype.onEnterTab = function(state) {
        this.analysis = this.canvas.getAnalysis();
        if (this.analysis) {
            this.analysis.setScript(controller.getScript());
            this.analysis.setDomain({x: {min:0, max: 10}, y: {min:0, max: 10}});
            this.clearCanvas();
        }

        // Hide error messages for graph
        this.canvas.clearError();

        // Disable/enable sensitivity analysis button
        var script = controller.getScript();
        if (script.isCompiled() === false) {
            $('#dosensan').addClass('disabled');
        } else {
            $('#dosensan').removeClass('disabled');
        }

        // Determine whether to use a contour or graph plot
        if (state.mode === 'graph' || (state.argument && state.mode === undefined)) {
            // When there is an argument parameter, this overrides the rest and
            // leads to the "default": a graph plot
            this.mode = "graph";
        } else if (state.argH || state.argV || state.mode === 'contour') {
            this.mode = "contour";
        } else {
            this.mode = "graph";
        }

        // Set option element to correct value
        this.setPlotType(this.mode);

        // Construct the lists with the current atomic integer quantities
        this.setupLists();

        // Select appropriate quantities in the list, based on the hash
        if (state.argument && this.mode === 'graph') {
            this.updateArgument(state);
        } else {
            if (state.argH && this.mode === 'contour') {
                this.updateArgH(state);
            }
            if (state.argV && this.mode === 'contour') {
                this.updateArgV(state);
            }
        }

        if (state.result) {
            this.updateResult(state);
        }

        // Finally, update the plot to show its latest status.
        this.drawPlot();
    };

    /**
     * Gets called when the hash changes while in the analysis tab
     *
     * @param  {Object} oldState The previous hash state
     * @param  {Object} newState The new hash state
     */
    Analysis.prototype.onHashChange = function(oldState, newState) {
        // Determine whether to use a contour or graph plot
        if (oldState.mode !== newState.mode) {
            // Set option element to correct value
            this.setPlotType(newState.mode);

            // Construct the lists with the current atomic integer quantities
            this.setupLists();
        }

        // New argument selected
        if ((oldState.argument !== newState.argument) && newState.argument !== undefined && view.tabs.analysis.mode === 'graph') {
            view.tabs.analysis.updateArgument(newState);
        } else {
            if ((oldState.argH !== newState.argH) && newState.argH !== undefined && view.tabs.analysis.mode === 'contour') {
                view.tabs.analysis.updateArgH(newState);
            }
            if ((oldState.argV !== newState.argV) && newState.argV !== undefined && view.tabs.analysis.mode === 'contour') {
                view.tabs.analysis.updateArgV(newState);
            }
        }

        // New result selected
        if ((oldState.result !== newState.result) && newState.result !== undefined) {
            view.tabs.analysis.updateResult(newState);
        }
    };

    /**
     * Calculates the sensitivity of the given cat 1 or 3 quantity w.r.t. all
     * cat 2 quantities
     *
     * @param  {String} qname the name of the quantity of which to compute the sensitivity
     * @return {Number} The calculated sensitivity for each cat 2 quantity
     */
    Analysis.prototype.calcSensitivity = function(q) {
        // body...
    };

    /**
     * Returns the given value except when the given quantity is a cat 1 slider: in that
     * case the value is clipped to the range of the slider and rounded if nessecary.
     *
     * @param  {String} q The name of the quantity of which to carefully set the value
     * @param  {Number} v The value to try to set
     * @return {Number} The given value, clipped to appropriate range and rounded if nessecary.
     */
    Analysis.prototype.carefullySetValue = function(q, v) {
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
    Analysis.prototype.sensAnalysis = function() {
        var script = controller.getScript();

        if (script.isCompiled() === false) {
            alert("Unable to do sensitivity analysis: the script has not been compiled yet.");
        } else {
            this.analysisTable.empty();

            // Arrays of the category 2 and category 1 or 3 quantities, respectively
            var cat2qs = [];
            var cat13qs = [];

            // Datastructure holding the information in the sensitivity table. It is actually a 2d-array
            // with as first index the category 1 or 3 quantity (row) and as second index the cat 2
            // quantity (column). The value is the computed sensitivity, absolute or relative.
            var senstbl = {};

            // Same structure as senstbl, but with the reverse order of the 2 indices.
            // Used to calculate the variances.
            var pseudoPDs = {};

            // Determine all category 2 and category (1 or 3) quantities that have a numeric, atomic value
            var elem;
            for (elem in this.compareQuantities) {
                var q = this.compareQuantities[elem].quantity;
                if (q.category === 2) {
                    cat2qs.push(q.name);
                } else if (q.category === 1 || q.category === 3) {
                    cat13qs.push(q.name);
                }
            }

            // Fill in default percentage values
            for (var elem in cat13qs) {
                var q = cat13qs[elem];
                this.percs[q] = 1.0;
            }

            // Create 2d arrays
            for (var elem in cat13qs) {
                var q = cat13qs[elem];
                senstbl[q] = {};
            }
            for (var elem in cat2qs) {
                var q = cat2qs[elem];
                pseudoPDs[q] = {};
            }

            /*----- Calculate table values -----*/
            for (elem in cat13qs) {
                var nul = [];
                var plus = [];
                var min = [];

                var q13 = cat13qs[elem];
                var value;
                for (el in this.compareQuantities) {
                    if (this.compareQuantities[el].quantity.name === q13) {
                        value = this.compareQuantities[el].value;
                        break;
                    }
                }

                // Determine the delta to use, as specified by the user or if not, the default of 1.0
                var delta;
                if (this.calcmode === 'p') {
                    delta = this.percs[q13] * value / 100;
                } else {
                    delta = this.percs[q13];
                }

                // Get current values of all cat2 quantities, and prepare pos and neg objects
                // with same values for now
                for (elem in cat2qs) {
                    var q2 = cat2qs[elem];
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
                script.exe.executeQuantities([{'name': q13, 'value': plusval}], plus, 1);
                script.exe.executeQuantities([{'name': q13, 'value': minusval}], min, 1);
                script.exe.setValue(q13, value);

                // Convert arrays which now hold the values to indexed objects for convenience
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
                        pseudoPDs[q2][q13] = pd;

                        // Now compute the actual sensitivity for display in the table
                        var sens = (Math.abs(plusres[q2]-nulres[q2]) + Math.abs(minres[q2]-nulres[q2]))/2.0;
                        if (this.calcmode === 'a') {
                            senstbl[q13][q2] = sens.toPrecision(2);
                        } else {
                            // Relative sensitivity
                            if (nulres[q2] != 0) {
                                senstbl[q13][q2] = (sens / (0.01 * nulres[q2] * this.percs[q13])).toPrecision(2);
                            } else {
                                // Division by zero
                                if (plusres[q2] === minres[q2]) {
                                    senstbl[q13][q2] = '0/0';
                                } else {
                                    senstbl[q13][q2] = '.../0';
                                }
                            }
                        }
                    } else {
                        // Results of plus, min or nul not numeric
                        senstbl[q13][q2] = 'NaN';
                    }
                }
            }

            /*--- Table heading ---*/
            var head = '<div class="an_senstblhdrow"><div class="an_senstblhd" style="text-align: left">Name</div>';
            head += '<div class="an_senstblhd">Delta</div>';

            var qName;
            for (elem in cat2qs) {
                head += '<div class="an_senstblhd">' + cat2qs[elem] + '</div>';
            }

            head += '</div>';
            this.analysisTable.append(head);


            /*--- Standard deviation row ---*/
            var stdev = '<div class="an_senstblstdrow"><div class="tblcell" style="text-align: left;">Std. dev:</div>';
            stdev += '<div class="tblcell">Percent:</div>';

            for (elem in cat2qs) {
                stdev += '<div class="tblcell">' + this.analysis.calcStdDev(cat2qs[elem]).toString() + '</div>';
            }

            stdev += '</div>';
            this.analysisTable.append(stdev);


            /*--- Table body ---*/
            // First all category 1 quantities
            for (row in senstbl) {
                if (script.getQuantity(row).category !== 1) {
                    continue;
                }

                var tbody = '<div class="an_senstblrow">';
                var column = senstbl[row];

                // Cat 1 or 3 quantity name
                tbody += '<div class="tblcell_qty1name">' + row + '</div>';
                // Absolute or relative deviation used
                tbody += '<div class="tblcell"><input id="perc_' + row + '" type="number" class="percinput" value="1" /></div>';
                // Make sure to display the sensitivities of the cat 2 quantities in the same order
                // as the quantities are displayed in the column heading
                for (col in cat2qs) {
                    tbody += '<div class="tblcell_qty1val">' + column[cat2qs[col]] + '</div>';
                }

                tbody += '</div>';
                this.analysisTable.append(tbody);
            }

            // Then all category 3 quantities
            for (row in senstbl) {
                if (script.getQuantity(row).category !== 3) {
                    continue;
                }

                var tbody = '<div class="an_senstblrow">';
                var column = senstbl[row];

                // Cat 1 or 3 quantity name
                tbody += '<div class="tblcell_qty3name">' + row + '</div>';
                // Absolute or relative deviation used
                tbody += '<div class="tblcell"><input id="perc_' + row + '" type="number" class="percinput" value="1" /></div>';
                // Make sure to display the sensitivities of the cat 2 quantities in the same order
                // as the quantities are displayed in the column heading
                for (col in cat2qs) {
                    tbody += '<div class="tblcell_qty3val">' + column[cat2qs[col]] + '</div>';
                }

                tbody += '</div>';
                this.analysisTable.append(tbody);
            }

            this.analysisTable.flip();
        }
    };

    Analysis.prototype.updateArgument = function(state) {
        this.canvas.clearError();
        $('#an_arguments a.an_qtyname').removeClass("an_greyedout").removeClass("help_current");
        $('#an_arguments a.an_qtyname[value="' + state.argument + '"]').addClass("help_current");

        // Grey-out all non-reversereachable quantities in the results table
        // var reachables = view.tabs.analysis.compareQuantities[state.argument].quantity.reverseReachables;
        var script = controller.getScript();
        $('#an_results a.an_qtyname').removeClass("an_greyedout");
        $('#an_results a.an_qtyname').each(function() {
            var qty = $(this).text();
            if (script.isReachable(qty, state.argument) === false) {
                $(this).addClass('an_greyedout');
            }
        });

        if (state.result !== undefined) {
            var script = controller.getScript();
            if (script.hasHistory() === true && controller.numIterations === 0) {
                this.setError("Cannot draw graph: script uses history operator and iterations are set to 0.");
            } else {
                if (script.isReachable(state.result, state.argument) === true) {
                    this.analysis.setX(state.argument);
                    this.analysis.setY(state.result);
                    this.drawPlot();
                } else {
                    this.setError("Quantity " + state.result + " does not depend on " + state.argument);
                }
            }
        }
    };

    Analysis.prototype.updateArgH = function(state) {
        this.canvas.clearError();
        $('#an_arguments .an_qtyHarg').removeClass("an_current").html("&nbsp;&nbsp;");
        $('#an_arguments div[data-quantity="' + state.argH + '"]').find(".an_qtyHarg").addClass("an_current").text("H");

        // Grey-out all non-reversereachable quantities in the results table
        // var reachables = view.tabs.analysis.compareQuantities[state.argH].quantity.reverseReachables;
        /*if (state.argV) {
            // Take into account the reachables of the argV parameter!
            var reachV = view.tabs.analysis.compareQuantities[state.argV].quantity.reverseReachables;
            reachables = _.intersection(reachables, reachV);
        }*/

        var script = controller.getScript();

        $('#an_results a.an_qtyname').removeClass("an_greyedout");
        $('#an_results a.an_qtyname').each(function() {
            var qty = $(this).text();
            if (script.isReachable(qty, state.argH) === false || (state.argV && script.isReachable(qty, state.argV) === false)) {
                $(this).addClass('an_greyedout');
            }
        });

        if (state.result !== undefined) {
            var script = controller.getScript();
            if (script.hasHistory() === true && controller.numIterations === 0) {
                this.setError("Cannot draw graph: script uses history operator and iterations are set to 0.");
            } else {
                if (script.isReachable(state.result, state.argH) === true) {
                    if (state.argV) {
                        if (script.isReachable(state.result, state.argV) === true) {
                            // Draw contour plot
                            this.analysis.setX(state.argH);
                            this.analysis.setY(state.argV);
                            this.analysis.setZ(state.result);
                            this.drawPlot();
                        } else {
                            // Result not reachable from argV
                            this.setError("Quantity " + state.result + " does not depend on " + state.argV);
                        }
                    }

                    // No argV selected yet: do nothing now

                } else {
                    // Result not reachable from argH
                    this.setError("Quantity " + state.result + " does not depend on " + state.argH);
                }
            }
        }
    };

    Analysis.prototype.updateArgV = function(state) {
        this.canvas.clearError();
        $('#an_arguments .an_qtyVarg').removeClass("an_current").html("&nbsp;&nbsp;");
        $('#an_arguments div[data-quantity="' + state.argV + '"]').find(".an_qtyVarg").addClass("an_current").text("V");

        // Grey-out all non-reversereachable quantities in the results table
        /*var reachables = view.tabs.analysis.compareQuantities[state.argV].quantity.reverseReachables;
        if (state.argH) {
            // Take into account the reachables of the argH parameter!
            var reachH = view.tabs.analysis.compareQuantities[state.argH].quantity.reverseReachables;
            reachables = _.intersection(reachables, reachH);
        }*/

        var script = controller.getScript();

        $('#an_results a.an_qtyname').removeClass("an_greyedout");
        $('#an_results a.an_qtyname').each(function() {
            var qty = $(this).text();
            if (script.isReachable(qty, state.argV) === false || (state.argH && script.isReachable(qty, state.argH) === false)) {
                $(this).addClass('an_greyedout');
            }
        });

        if (state.result !== undefined) {
            var script = controller.getScript();
            if (script.hasHistory() === true && controller.numIterations === 0) {
                this.setError("Cannot draw graph: script uses history operator and iterations are set to 0.");
            } else {
                if (script.isReachable(state.result, state.argV) === true) {
                    if (state.argH) {
                        if (script.isReachable(state.result, state.argH) === true) {
                            // Draw contour plot
                            this.analysis.setX(state.argH);
                            this.analysis.setY(state.argV);
                            this.analysis.setZ(state.result);
                            this.drawPlot();
                        } else {
                            // Result not reachable from argV
                            this.setError("Quantity " + state.result + " does not depend on " + state.argH);
                        }
                    }

                    // No argH selected yet: do nothing now

                } else {
                    // Result not reachable from argV
                    this.setError("Quantity " + state.result + " does not depend on " + state.argV);
                }
            }
        }
    };

    Analysis.prototype.updateResult = function(state) {
        this.canvas.clearError();
        $('#an_results a.an_qtyname').removeClass("help_current");
        $('#an_results a.an_qtyname[value="' + state.result + '"]').addClass("help_current");

        // Grey-out all non-reachable quantities in the arguments table
        // var reachables = view.tabs.analysis.compareQuantities[state.result].quantity.reachables;
        // $('#an_arguments a.an_qtyname').removeClass("an_greyedout");
        // $('#an_arguments a.an_qtyname').each(function() {
        //     var qty = $(this).text();
        //     if (reachables.indexOf(qty) === -1) {
        //         $(this).addClass('an_greyedout');
        //         /*if ($(this).hasClass("help_current")) {
        //             $(this).removeClass("help_current");
        //         }*/
        //     }
        // });

        var script;
        if (state.argument !== undefined) {
            // Ready to draw graph plot
            script = controller.getScript();
            if (script.hasHistory() === true && controller.numIterations === 0) {
                this.setError("Cannot draw graph: script uses history operator and iterations are set to 0.");
            } else {
                if (script.isReachable(state.result, state.argument) === true) {
                    this.analysis.setX(state.argument);
                    this.analysis.setY(state.result);
                    this.drawPlot();
                } else {
                    this.canvas.clearError();
                    this.setError("Quantity " + state.result + " does not depend on " + state.argument);
                }
            }
        } else if (state.argH !== undefined && state.argV !== undefined) {
            // Ready to draw contour plot
            script = controller.getScript();
            if (script.hasHistory() === true && controller.numIterations === 0) {
                this.setError("Cannot draw graph: script uses history operator and iterations are set to 0.");
            } else {
                if (script.isReachable(state.result, state.argH) === true) {
                    if (script.isReachable(state.result, state.argV) === true) {
                        this.analysis.setX(state.argH);
                        this.analysis.setY(state.argV);
                        this.analysis.setZ(state.result);
                        this.drawPlot();
                    } else {
                        this.setError("Quantity " + state.result + " does not depend on " + state.argV);
                    }
                } else {
                    this.setError("Quantity " + state.result + " does not depend on " + state.argH);
                }
            }
        }
    };

    /**
     * Determines the quantities in the script that can be plotted.
     */
    Analysis.prototype.setupLists = function() {
        this.compareQuantities = {};
        var script = controller.getScript();

        if (script.isCompiled()) {
            var quantities = script.getQuantities();
            var exe = script.exe;

            // Take values in current execution state. Take all quantities
            // that have atomic integer values and add them to the lists
            for (var elem in quantities) {
                var qty = quantities[elem];
                var qname = qty.name;
                var val = exe.getValue(qname);

                if (isNumeric(val) && !(val instanceof Array) && val !== false && val !== true && val !== '') {
                    this.compareQuantities[qname] = {'quantity': qty, 'value': val};
                }
            }

            // Sort the quantities alphabetically by name
            this.compareQuantities = _.sortBy(this.compareQuantities, function(elem) {
                return elem.quantity.name;
            });

            // Now actually construct the HTML for the lists and populate them
            this.makeLists();
        } else {
            // Reset to empty lists
            this.argList.empty();
            this.argList.flip();
            this.argList.hideIfEmpty();

            this.resultList.empty();
            this.resultList.flip();
            this.resultList.hideIfEmpty();
        }
    };

    Analysis.prototype.makeLists = function() {
        if (this.mode === 'graph') {
            this.makeGraphList();
            $("#an_arguments").css("width", "");
            $("#an_arguments").parent().css("min-width", "150px");
        } else {
            this.makeContourList();
            $("#an_arguments").css("width", "165px");
            $("#an_arguments").parent().css("min-width", "190px");
        }

        this.makeResultsList();
    };

    Analysis.prototype.makeGraphList = function() {
        this.argList.empty();

        // Make table heading
        this.argList.append('<div style="display: table-row"><div class="inline an_tblhead">Name</div><div class="inline an_tblhead" title="Description of quantity">?</div><div class="inline an_tblhead">Value</div></div>');

        // Fill table with quantities
        for (var elem in this.compareQuantities) {
            var obj = this.compareQuantities[elem];
            var qtyName = obj.quantity.name;
            var comment = obj.quantity.getComment();
            var value = obj.value.toPrecision(2);

            var html = '<div style="display: table-row">';
            html += '<a class="inline an_qtyname" id="arg_' + qtyName + '" value="' + qtyName + '">' + qtyName + '</a>';
            html += '<div class="inline an_qtycomment" title="' + comment + '">?</div>';
            html += '<div class="inline an_qtyvalue">' + value + '</div></div>';

            this.argList.append(html);
        }

        // Show contents
        this.argList.flip();

        // Attach event handlers
        $('#an_arguments .an_qtycomment').on('click', function(e) {
            var comment = $(this).attr('title');
            if (comment === '') {
                alert("No comment found for this quantity");
            } else {
                alert(comment);
            }

            e.stopPropagation();
            e.cancelBubble = true;
        });

        // Attach event handlers
        $('#an_arguments a.an_qtyname').on('click', function(e) {
            var argument = e.target.text;
            view.addState({'argument': argument});
        });
    };

    Analysis.prototype.makeContourList = function() {
        this.argList.empty();

        // Make table heading
        this.argList.append('<div style="display: table-row"><div class="inline an_tblhead">Name</div><div class="inline an_tblhead" title="Description of quantity">?</div><div class="inline an_tblhead">Value</div><div class="inline an_tblhead" style="text-align: center;">H</div><div class="inline an_tblhead" style="text-align: center;">V</div></div>');

        // Fill table with quantities
        for (var elem in this.compareQuantities) {
            var obj = this.compareQuantities[elem];
            var qtyName = obj.quantity.name;
            var comment = obj.quantity.getComment();
            var value = obj.value.toPrecision(2);

            var html = '<div style="display: table-row" data-quantity="' + qtyName + '">';
            html += '<a class="inline an_qtyname" id="arg_' + qtyName + '" value="' + qtyName + '">' + qtyName + '</a>';
            html += '<div class="inline an_qtycomment" title="' + comment + '">?</div>';
            html += '<div class="inline an_qtyvalue">' + value + '</div>';
            html += '<div class="inline an_qtyHarg">&nbsp;&nbsp;</div>';
            html += '<div class="inline an_qtyVarg">&nbsp;&nbsp;</div></div>';

            this.argList.append(html);
        }

        // Show contents
        this.argList.flip();

        // Attach event handlers
        $('#an_arguments .an_qtycomment').on('click', function(e) {
            var comment = $(this).attr('title');
            if (comment === '') {
                alert("No comment found for this quantity");
            } else {
                alert(comment);
            }

            e.stopPropagation();
            e.cancelBubble = true;
        });

        // Attach event handlers
        $('#an_arguments .an_qtyHarg').on('click', function(e) {
            var argH = $(this).parent().data("quantity");
            view.addState({'argH': argH});
        }).hover(function(e) {
            $(this).text("H");
        }, function(e) {
            if (!$(this).hasClass("an_current")) {
                $(this).html("&nbsp;&nbsp;");
            }
        });

        $('#an_arguments .an_qtyVarg').on('click', function(e) {
            var argV = $(this).parent().data("quantity");
            view.addState({'argV': argV});
        }).hover(function(e) {
            $(this).text("V");
        }, function(e) {
            if (!$(this).hasClass("an_current")) {
                $(this).html("&nbsp;&nbsp;");
            }
        });
    };

    Analysis.prototype.makeResultsList = function() {
        this.resultList.empty();

        // Make table heading
        this.resultList.append('<div style="display: table-row"><div class="inline an_tblhead">Name</div><div class="inline an_tblhead" title="Description of quantity">?</div><div class="inline an_tblhead">Value</div></div>');

        // Fill table with quantities
        for (var elem in this.compareQuantities) {
            var obj = this.compareQuantities[elem];
            var qtyName = obj.quantity.name;
            var comment = obj.quantity.getComment().trim();
            var value = obj.value.toPrecision(2);

            var html = '<div style="display: table-row">';
            html += '<a class="inline an_qtyname" id="arg_' + qtyName + '" value="' + qtyName + '">' + qtyName + '</a>';
            html += '<div class="inline an_qtycomment" title="' + comment + '">?</div>';
            html += '<div class="inline an_qtyvalue">' + value + '</div></div>';

            this.resultList.append(html);
        }

        // Show contents
        this.resultList.flip();

        // Attach event handlers
        $('#an_results .an_qtycomment').on('click', function(e) {
            var comment = $(this).attr('title');
            if (comment === '') {
                alert("No comment found for this quantity");
            } else {
                alert(comment);
            }

            e.stopPropagation();
            e.cancelBubble = true;
        });

        // Attach event handlers
        $('#an_results a.an_qtyname').on('click', function(e) {
            var result = e.target.text;
            view.addState({'result': result});
        });
    };

    /**
     * Make the plot show an error message.
     *
     * @param {String} error The error message to show.
     */
    Analysis.prototype.setError = function(error) {
        this.canvas.setError(error);
        this.drawPlot();
    };

    /**
     * Clears any error from the graph.
     */
    Analysis.prototype.clearError = function() {
        this.canvas.clearError();
        this.drawPlot();
    };

    /**
     * @return The current plottype of the analysis tab.
     */
    Analysis.prototype.getPlotType = function() {
        return this.mode;
    };

    /**
     * Handles the switching between different kind of plot types.
     * Supported types are 'line' and 'contour'.
     *
     * @return The new plot type.
     */
    Analysis.prototype.setPlotType = function(type) {
        switch (type) {
            case "contour":
                $("#an_graphswitch_contour").removeClass("toggleswitchoption").addClass("toggleswitchoption_current");
                $("#an_graphswitch_graph").removeClass("toggleswitchoption_current").addClass("toggleswitchoption");
                $(".analysis_contourSettings").show();
                $(".analysis_lineSettings").hide();
                this.mode = "contour";
                break;
            default: // "line"
                $("#an_graphswitch_graph").removeClass("toggleswitchoption").addClass("toggleswitchoption_current");
                $("#an_graphswitch_contour").removeClass("toggleswitchoption_current").addClass("toggleswitchoption");
                $(".analysis_contourSettings").hide();
                $(".analysis_lineSettings").show();
                this.mode = "graph";
                break;
        }

        this.canvas.setPlotType(type);
    };

    /**
     * Clears the plot canvas
     */
    Analysis.prototype.clearCanvas = function() {
        this.canvas.clearCanvas();
    };

    /**
     * Updates the plot canvas
     */
    Analysis.prototype.drawPlot = function() {
        this.canvas.draw();

        // Update range values.
        var range = this.getRange();
        var rangeFrom = range.min.toFixed(4);
        var rangeTo = range.max.toFixed(4);
        $("#analysis_rangeFrom").val(rangeFrom);
        $("#analysis_rangeTo").val(rangeTo);

        // Update domain values.
        var domain = this.getDomain();

        var domainXFrom = domain.x.min.toFixed(4);
        var domainXTo = domain.x.max.toFixed(4);
        $("#analysis_domainXFrom").val(domainXFrom);
        $("#analysis_domainXTo").val(domainXTo);

        var domainYFrom = domain.y.min.toFixed(4);
        var domainYTo = domain.y.max.toFixed(4);
        $("#analysis_domainYFrom").val(domainYFrom);
        $("#analysis_domainYTo").val(domainYTo);
    };

    /**
     * Sets the range of the plot window.
     * An example input would be: setRange({min: 5, max:10}).
     *
     * @throws {Error} An invalid range, meaning min >= max.
     * @param A range object, containing a min or max property, or both.
     */
    Analysis.prototype.setRange = function(range) {
        var analysis = this.canvas.getAnalysis();

        if (analysis) {
            analysis.setRange(range);
            this.setClamp(false);
            $("#analysis_toClamp").prop("checked", false);
            this.drawPlot();
        }
    };

    /**
     * @return The range of the plot window.
     */
    Analysis.prototype.getRange = function() {
        var analysis = this.canvas.getAnalysis();

        if (analysis) {
            return analysis.getRange();
        }
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
    Analysis.prototype.setDomain = function(domain) {
        var analysis = this.canvas.getAnalysis();

        if (analysis) {
            analysis.setDomain(domain);
            this.drawPlot();
        }
    };

    /**
     * @return The range of the plot window.
     */
    Analysis.prototype.getDomain = function() {
        var analysis = this.canvas.getAnalysis();

        if (analysis) {
            return analysis.getDomain();
        }
    };

    /**
     * Sets whether the analysis plot should be clamped or not
     * If the plot should be clamped, it will be redrawn.
     *
     * @param {Boolean} Whether the plot window should be clamped or not.
     */
    Analysis.prototype.setClamp = function(bClamp) {
        this.canvas.handler.bClamp = bClamp;

        // If we were not clamped, we'll have to redraw the plot!
        if (bClamp) {
            this.drawPlot();
        }
    };

    /**
     * Sets the margin of clamping for the range.
     * The margin itself gets clamped between 0 and 95.
     *
     * @param {Number} The clamp margin.
     */
    Analysis.prototype.setClampMargin = function(margin) {
        if (margin < 0) {
            margin = 0;
        } else if (margin > 95) {
            margin = 95;
        }

        $("#analysis_clampMargin").val(margin.toFixed(4));
        this.canvas.handler.clampMargin = margin;

        // Redraw the plot if clamping was enabled.
        if (this.canvas.handler.bClamp) {
            this.drawPlot();
        }
    };

    Analysis.prototype.setNrContours = function(nr) {
        this.canvas.setNrContours(nr);
    };

    return Analysis;
});
