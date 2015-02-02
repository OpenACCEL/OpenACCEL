require.config({
    baseUrl: "scripts"
});

define(["View/Input", "View/HTMLBuffer", "Model/Analysis", "Model/Sensitivity", "lodash"], /**@lends View*/ function(Input, HTMLBuffer, AnalysisModel, Sensitivity, _) {
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
         * The Sensitivity class used to perform sensitivity analysis on the script.
         *
         * @type {Sensitivity}
         */
        this.sensitivity = new Sensitivity(this.analysisTable);

        /**
         * The quantities in the script that can be plotted. These are the quantities
         * that have atomic numeric values. Keyed by quantity name, value is an object
         * {'quantity': Quantity, 'value': value}.
         *
         * @type {Object}
         */
        this.compareQuantities = {};

        /**
         * The Model.Analysis instance used by this view.
         *
         * @type {Model.Analysis}
         */
        this.analysis = undefined;

        /**
         * Whether the sensitivity table should be updated when the analysis tab is activated.
         * This is the case when e.g. user input controls have been changed.
         *
         * @type {Boolean}
         */
        this.shouldUpdate = false;

        $("#graphmode").on("change", function() {
            var mode = $(this).val();
            view.setState({"tab": "analysis", "mode": mode});
        });

        $("#analysis_domainXFrom, #analysis_domainXTo, #analysis_rangeFrom, #analysis_rangeTo").attr('disabled', true).css("background-color", "#ccc");
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

        // Update sensitivity table when needed
        if (this.shouldUpdate && !this.analysisTable.isEmpty()) {
            this.sensAnalysis();
        }
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

    Analysis.prototype.sensAnalysis = function() {
        this.sensitivity.analyse(this.compareQuantities);
        this.shouldUpdate = false;
    };

    Analysis.prototype.updateArgument = function(state) {
        var newarg = state.argument;
        this.canvas.clearError();
        $('#an_arguments a.an_qtyname').removeClass("an_greyedout").removeClass("help_current");
        $('#an_arguments a.an_qtyname[value="' + newarg + '"]').addClass("help_current");

        // Grey-out all non-reversereachable quantities in the results table
        // var reachables = view.tabs.analysis.compareQuantities[state.argument].quantity.reverseReachables;
        var script = controller.getScript();
        $('#an_results a.an_qtyname').removeClass("an_greyedout");
        $('#an_results a.an_qtyname').each(function() {
            var qty = $(this).text();
            if (script.isReachable(qty, newarg) === false) {
                $(this).addClass('an_greyedout');
            }
        });

        // Set margins. If the selected argument is a slider, use the slider range as domain.
        // Else, set the domain to be centered around the current value.
        var argVal, slider, slidmin=0, slidmax=0;
        for (var elem in this.compareQuantities) {
            var qty = this.compareQuantities[elem];
            if (qty.quantity.name === newarg) {
                argVal = qty.value;
                slider = (qty.quantity.category === 1 && qty.quantity.input.type === 'slider');
                if (slider) {
                    slidmin = qty.quantity.input[1];
                    slidmax = qty.quantity.input[2];
                    this.setDomain({'x': {'min':slidmin, 'max':slidmax} });
                } else {
                    if (argVal !== 0) {
                        this.setDomain({'x': {'min':argVal/2, 'max':argVal*2} });
                    } else {
                        this.setDomain({'x': {'min':-1, 'max':1} });
                    }
                }

                break;
            }
        }

        if (state.result !== undefined) {
            var script = controller.getScript();
            if (script.hasHistory() === true && controller.numIterations === 0) {
                this.setError("Cannot draw graph: script uses history operator and iterations are set to 0.");
            } else {
                if (script.isReachable(state.result, newarg) === true) {
                    this.analysis.setX(newarg);
                    this.analysis.setY(state.result);
                    this.drawPlot();
                } else {
                    this.setError("Quantity " + state.result + " does not depend on " + newarg);
                }
            }
        }
    };

    Analysis.prototype.updateArgH = function(state) {
        var newarg = state.argH;
        this.canvas.clearError();
        $('#an_arguments .an_qtyHarg').removeClass("an_current").html("&nbsp;&nbsp;");
        $('#an_arguments div[data-quantity="' + newarg + '"]').find(".an_qtyHarg").addClass("an_current").text("H");

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

        // Set margins. If the selected argument is a slider, use the slider range as domain.
        // Else, set the domain to be centered around the current value.
        var argVal, slider, slidmin=0, slidmax=0;
        for (var elem in this.compareQuantities) {
            var qty = this.compareQuantities[elem];
            if (qty.quantity.name === newarg) {
                argVal = qty.value;
                slider = (qty.quantity.category === 1 && qty.quantity.input.type === 'slider');
                if (slider) {
                    slidmin = qty.quantity.input[1];
                    slidmax = qty.quantity.input[2];
                    this.setDomain({'x': {'min':slidmin, 'max':slidmax} });
                } else {
                    if (argVal !== 0) {
                        this.setDomain({'x': {'min':argVal/2, 'max':argVal*2} });
                    } else {
                        this.setDomain({'x': {'min':-1, 'max':1} });
                    }
                }

                break;
            }
        }

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
        var newarg = state.argV;
        this.canvas.clearError();
        $('#an_arguments .an_qtyVarg').removeClass("an_current").html("&nbsp;&nbsp;");
        $('#an_arguments div[data-quantity="' + newarg + '"]').find(".an_qtyVarg").addClass("an_current").text("V");

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

        // Set margins. If the selected argument is a slider, use the slider range as domain.
        // Else, set the domain to be centered around the current value.
        var argVal, slider, slidmin=0, slidmax=0;
        for (var elem in this.compareQuantities) {
            var qty = this.compareQuantities[elem];
            if (qty.quantity.name === newarg) {
                argVal = qty.value;
                slider = (qty.quantity.category === 1 && qty.quantity.input.type === 'slider');
                if (slider) {
                    slidmin = qty.quantity.input[1];
                    slidmax = qty.quantity.input[2];
                    this.setDomain({'y': {'min':slidmin, 'max':slidmax} });
                } else {
                    if (argVal !== 0) {
                        this.setDomain({'y': {'min':argVal/2, 'max':argVal*2} });
                    } else {
                        this.setDomain({'y': {'min':-1, 'max':1} });
                    }
                }

                break;
            }
        }

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

        // Set margins. If the selected argument is a slider, use the slider range as domain.
        // Else, set the domain to be centered around the current value.
        var argVal, slider, slidmin=0, slidmax=0;
        for (var elem in this.compareQuantities) {
            var qty = this.compareQuantities[elem];
            if (qty.quantity.name === state.result) {
                argVal = qty.value;
                slider = (qty.quantity.category === 1 && qty.quantity.input.type === 'slider');
                if (slider) {
                    slidmin = qty.quantity.input[1];
                    slidmax = qty.quantity.input[2];
                    this.setRange({'min':slidmin, 'max':slidmax});
                } else {
                    if (argVal !== 0) {
                        this.setRange({'min':argVal/2, 'max':argVal*2});
                    } else {
                        this.setRange({'min':-1, 'max':1});
                    }
                }

                break;
            }
        }

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

                if (!qty.isUserFunction() &&
                    isNumeric(val) &&
                    !(val instanceof Array) &&
                    val !== false &&
                    val !== true &&
                    val !== '') {
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

        this.sensitivity.compareQuantities = this.compareQuantities;
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
            if (comment === '') {
                html += '<div class="inline an_qtynocomment" title="This quantity has no comment.">?</div>';
            } else {
                html += '<div class="inline an_qtycomment" title="' + comment + '">?</div>';
            }

            html += '<div class="inline an_qtyvalue">' + value + '</div></div>';
            this.argList.append(html);
        }

        // Show contents
        this.argList.flip();

        // Attach event handlers
        $('#an_arguments .an_qtycomment').on('click', function(e) {
            var comment = $(this).attr('title');
            alert(comment);

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
            if (comment === '') {
                html += '<div class="inline an_qtynocomment" title="This quantity has no comment.">?</div>';
            } else {
                html += '<div class="inline an_qtycomment" title="' + comment + '">?</div>';
            }
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
            alert(comment);

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
            if (comment === '') {
                html += '<div class="inline an_qtynocomment" title="This quantity has no comment.">?</div>';
            } else {
                html += '<div class="inline an_qtycomment" title="' + comment + '">?</div>';
            }
            html += '<div class="inline an_qtyvalue">' + value + '</div></div>';

            this.resultList.append(html);
        }

        // Show contents
        this.resultList.flip();

        // Attach event handlers
        $('#an_results .an_qtycomment').on('click', function(e) {
            var comment = $(this).attr('title');
            alert(comment);

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
                $("#analysis_domainXFrom, #analysis_domainXTo, #analysis_rangeFrom, #analysis_rangeTo").removeAttr('disabled').css("background-color", "white");
                $("#graphmode").val("contour");
                $(".analysis_contourSettings").show();
                $(".analysis_lineSettings").hide();
                this.mode = "contour";
                break;
            default: // "graph"
                $("#analysis_domainXFrom, #analysis_domainXTo, #analysis_rangeFrom, #analysis_rangeTo").attr('disabled', true).css("background-color", "#ccc");
                $("#graphmode").val("graph");
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
        var rangeFrom = range.min.toFixed(2);
        var rangeTo = range.max.toFixed(2);
        $("#analysis_rangeFrom").val(rangeFrom);
        $("#analysis_rangeTo").val(rangeTo);

        // Update domain values.
        var domain = this.getDomain();

        var domainXFrom = domain.x.min.toFixed(2);
        var domainXTo = domain.x.max.toFixed(2);
        $("#analysis_domainXFrom").val(domainXFrom);
        $("#analysis_domainXTo").val(domainXTo);

        var domainYFrom = domain.y.min.toFixed(2);
        var domainYTo = domain.y.max.toFixed(2);
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
            $("#analysis_domainXFrom, #analysis_domainXTo, #analysis_rangeFrom, #analysis_rangeTo").attr('disabled', true).css("background-color", "#ccc");
            this.drawPlot();
        } else {
            $("#analysis_domainXFrom, #analysis_domainXTo, #analysis_rangeFrom, #analysis_rangeTo").removeAttr('disabled').css("background-color", "white");
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
