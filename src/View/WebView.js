require.config({
    baseUrl: "scripts"
});

define(["../Controller/AbstractView",
        "../View/Tooltip",
        "../View/Tabs/EditRun",
        "../View/Tabs/HelpDemo",
        "../View/Tabs/Analysis",
        "../View/Tabs/IOEdit",
        "../View/Tabs/Optimisation",
        "../View/Tabs/Simulation",
        "../View/Graphics/CanvasCreator"],
        /**@lends View*/
        function(AbstractView, Tooltip, EditRun, HelpDemo, Analysis, IOEdit, Optimisation, Simulation, CanvasCreator, deparam) {
    /**
     * @class
     * @classdesc The webview is the view class for webbrowsers.
     */
    function WebView() {
        /**
         * The CanvasCreator is responsible for creating drawable canvases for e.g. the Network tab and
         * script visualisations.
         *
         * @type {CanvasCreator}
         */
        this.canvasCreator = new CanvasCreator();

        /**
         * The various canvasses that the view will use to plot and draw.
         */
        this.canvasses = {};

        /**
         * Whether the current open tab has one or more plot canvasses.
         */
        this.hasPlot = false;

        /**
         * Object representing the current application state as stored in the hash fragment
         * of the URL.
         *
         * @type {Object}
         */
        this.state = $.deparam(location.hash, true);

        /**
         * The various tabs that this view has to offer.
         */
        this.tabs = {};
        this.tabs.editrun = new EditRun();
        this.tabs.helpdemo = new HelpDemo();
        this.tabs.ioedit = new IOEdit();
        this.tabs.analysis = new Analysis();
        this.tabs.optimisation = new Optimisation();
        this.tabs.simulation = new Simulation();

        /**
         * The tab that is currently open.
         */
        this.currentTab = "";

        this.tooltips = {};
        this.errorCount = 0;

        /**
         * Fired when the hash fragment of the URL changes.
         *
         * @param  {Event} e The jQuery event object.
         * @param  {Boolean} initial Whether this event was fired onpageload
         */
        $(window).on('hashchange', this.onHashChange.bind(this));

        $("#optimisation").on('click', function() {
            if ($(this).hasClass("disabled")) {
                alert("The script does not contain any quantities to be optimized.");
            }
        });

        // Loading should be done at this point.
        this.resizeContainer();
        $('#loading').toggle(false);

        $(window).on('resize',
            (function() {
                this.resizeContainer();
            }).bind(this)
        );

        //$('.disabled').attr('disabled', 'disabled').off('click');
        //$('.disabled').children().attr('disabled', 'disabled').off('click');
    }

    WebView.prototype = new AbstractView();

    /**
     * Merges the attributes in the given object into the
     * current state, overriding any existing attributes with
     * the same name.
     *
     * @param {Object} state The state object with attributes to
     * merge into the current state.
     * @post The attributes of the given object are merged into the current
     * application state
     */
    WebView.prototype.setState = function(state) {
        location.hash = $.param.fragment(location.hash, state);
    };

    /**
     * Displays the values of the given output quantities in the UI.
     *
     * @param cat2quantities {map<String, Quantity>} A map of all output
     * quantities in the script.
     */
    WebView.prototype.presentResults = function(cat2quantities) {
        this.tabs.editrun.synchronizeResults(cat2quantities);
    };

    /**
     * Creates the necessary plot canvases
     */
    WebView.prototype.setUpPlot = function() {
        /**
         * The small plot window that shows up in the Edit/Run tab.
         */
        this.canvasses.editrun = this.canvasCreator.createCanvas(controller.getScript(), 'plot', 300, 300);

        /**
         * This big plot window for the Simulation tab, which shows the same as the plot of Edit/Run.
         */
        this.canvasses.simulation = this.canvasCreator.createCanvas(controller.getScript(), 'plotSimulation', 800, 600);

        /**
         * The canvas that is used to plot individuals of the Genetic Optimization tab.
         */
        this.canvasses.optimisation = this.canvasCreator.createCanvas(controller.getGeneticOptimisation(), 'plotGO', 400, 400);
    };

    /**
     * Clears the plot canvas
     */
    WebView.prototype.clearPlot = function() {
        if (this.hasPlot) {
            this.canvasses[this.currentTab].clearCanvas();
        }
    };

    /**
     * Updates the plot canvas
     */
    WebView.prototype.drawPlot = function() {
        if (this.hasPlot) {
            this.canvasses[this.currentTab].draw();
        }
    };

    /**
     * Fired when the hash fragment of the URL changes.
     *
     * @param  {Event} e The jQuery event object.
     * @param  {Boolean} initial Whether this event was fired onpageload
     */
    WebView.prototype.onHashChange = function(e, initial) {
        var newState = $.deparam(e.fragment, true);

        // Activate other tab when nessecary
        if ((newState.tab && (newState.tab !== this.state.tab)) || initial === true || newState.help || newState.script || newState.link) {
            if (typeof newState.tab === 'undefined') {
                newState.tab = "editrun";
            }

            if (newState.script) {
                newState.tab = "editrun";
            } else if (newState.help) {
                newState.tab = "helpdemo";
            }

            // Make correct tab active
            $("li.navtab").removeClass("ui-tabs-active");
            $("li#" + newState.tab + ".navtab").addClass("ui-tabs-active");

            // Show contents of newly activated tab and trigger events
            this.onLeaveTab(this.state.tab);
            $(".tabcontent").hide();
            this.onEnterTab(newState.tab);
            $("#" + newState.tab + ".tabcontent").show();
        }

        // Update current help category if nessecary
        if (newState.helpcat && (newState.helpcat !== this.state.helpcat || initial === true)) {
            this.tabs.helpdemo.selectHelpCategory(newState.helpcat);
        }

        // Update shown help article if nessecary
        if (newState.help) {
            this.tabs.helpdemo.showHelpArticle(newState.help);
        }

        // Load requested demo script
        if (newState.script) {
            controller.loadDemoScript(newState.script);
        }

        // Update state variable
        this.state = newState;
    };

    /**
     * Called just before a tab is made active/shown
     *
     * @param  {Event} event The jQuery event that was fired
     * @param  {string} tab The identifier of the tab that will be made current.
     */
    WebView.prototype.onEnterTab = function(tab) {
        switch (tab) {
            case 'simulation':
            case 'editrun':
                this.hasPlot = true;

                // If autoexecute is true, resume script only when it has been paused
                // by the system, and start executing when it is not paused but compiled
                if (controller.autoExecute) {
                    if (controller.isPaused()) {
                        controller.resume(true);
                    } else {
                        controller.run();
                    }
                }
                break;
            case 'ioedit':
                this.hasPlot = false;
                setTimeout((function() {
                    this.tabs.ioedit.updateAdvancedEditor();
                    this.tabs.ioedit.focusAdvancedEditor();
                }).bind(this), 100);
                break;
            case 'helpdemo':
                this.hasPlot = false;
                this.tabs.helpdemo.setup();
                break;
            default:
                break;
        }

        //Tooltips loaded and shown
        try {
            this.tooltips[tab].toggle(true);
        } catch(e) {

        }

        this.currentTab = tab;
        this.resizeContainer();
    };

    /**
     * Called just before a tab is left and made hidden
     *
     * @param  {Event} event The jQuery event that was fired
     * @param  {string} tab The identifier of the tab that will be hidden
     */
    WebView.prototype.onLeaveTab = function(tab) {
        $('.tooltipcontainer > .datamessage').filter(":visible").trigger('click');

        switch (tab) {
            case 'editrun':
                // Pause script when leaving edit/run tab, indicating it has
                // been paused automatically by the system and not by the user
                controller.pause(true);
                break;
            case 'ioedit':
                // Build script from inputted source when leaving IO/edit
                try {
                    if (this.tabs.ioedit.editor) {
                        this.tabs.ioedit.editor.save();
                    }
                    controller.setScriptFromSource($('#scriptarea').val());
                    this.tabs.ioedit.showValues = false;
                    $('#showvalues').val('Show values');
                } catch (e) {
                    if (typeof(e) === 'SyntaxError') {
                        console.log(e.message);
                    } else {
                        console.log(e);
                    }
                }
                break;
            case 'simulation':
                controller.pause(true);
                break;
            default:
                break;
        }

        //Tooltips stored and hidden
        this.tooltips[tab] = $('.tooltipcontainer').filter(":visible");
        this.tooltips[tab].toggle(false);
    };

    /**
     * Event that gets called when one of the quantity definitions have been modified.
     */
    WebView.prototype.onModifiedQuantity = function() {
        var script = controller.getScript();

        // Check whether to disable the genetic optimisation tab
        if (!controller.hasOptimisation()) {
            if (!$('#optimisation').hasClass('disabled')) {
                $('#optimisation').addClass('disabled').children("a").removeAttr('href');
            }
        } else {
            if ($('#optimisation').hasClass('disabled')) {
                $('#optimisation').removeClass('disabled').children("a").attr('href', '#tab=optimisation');
            }
        }

        switch(this.currentTab) {
            case 'editrun':
                this.tabs.editrun.synchronizeScriptList(script.getQuantities());
                break;
            case 'ioedit':
                this.tabs.ioedit.synchronizeScriptArea();
                break;
        }
    }

    /**
     * Event that gets called when the controller has issued a new iteration for the script.
     */
    WebView.prototype.onNextStep = function() {
        var script = controller.getScript();

        switch(this.currentTab) {
            case 'editrun':
                this.tabs.editrun.synchronizeResults(script.getOutputQuantities());
                break;
        }

        // Draw a plot if one is visible on the current view tab.
        this.drawPlot();
    }

    /**
     * Event that gets called when the controller has compiled a new script.
     */
    WebView.prototype.onNewScript = function() {
        this.resetAllPlots();

        var script = controller.getScript();
        this.canvasses.editrun.setModel(script);
        this.canvasses.simulation.setModel(script);
        this.canvasses.optimisation.setModel(controller.getGeneticOptimisation());

        this.tabs.editrun.synchronizeScriptList(script.getQuantities());
        this.tabs.ioedit.synchronizeScriptArea();

        if (!controller.hasOptimisation) {
            if (!$('#optimisation').hasClass('disabled')) {
                $('#optimisation').addClass('disabled').children("a").removeAttr('href');
            }
        }
    }

    /**
     * Event that gets called when the genetic algorithm has generated a new generation.
     */
    WebView.prototype.onNewGeneration = function() {
        this.canvasses.optimisation.draw();
    }

    /**
     * Resets all canvasses and plots, such that they are as good as new!
     */
    WebView.prototype.resetAllPlots = function() {
        for (var key in this.canvasses) {
            this.canvasses[key].clearCanvas();
            this.canvasses[key].clearBuffers();
        }
    }

    /**
     * Changes UI elements depending on whether the OpenACCEL model is being executed.
     *
     * @param executing Boolean indicating whether the OpenACCEL model is being executed.
     */
    WebView.prototype.setExecuting = function(executing) {
        this.tabs.editrun.setExecuting(executing);
    };

    /**
     * Displays the passed runtime error to the user.
     *
     * @param {RuntimeError} err The error that occured during runtime.
     */
    WebView.prototype.runtimeError = function(error) {
        console.log(error);
        handleError(error);
    };

    WebView.prototype.resizeContainer = function() {
        var windowWidth = $(window).innerWidth();
        var fixedWidth = 900;
        var variableWidth = windowWidth * 0.8;
        var newMaxWidth = Math.max(fixedWidth, variableWidth);

        var container = $('#container');
        var content = $('#main');

        content.css(
            {
                'min-width': fixedWidth,
                'max-width': newMaxWidth
            }
        );

        container.css(
            {
                'left': Math.max(0, (windowWidth - newMaxWidth) / 2),
                'width': variableWidth
            }
        );
    };

    WebView.prototype.syntaxErrorMessage = function(id, error, selector) {
        this.id = id;

        var errorContainer = $(selector);
        var source = errorContainer.text();
        var errorLines = source.split('\n');

        var errorEnd = errorLines[error.lastLine - 1];

        errorLines[error.firstLine - 1] = errorEnd.substr(0, error.endPos) + '<span id = "errorlocation' + this.id + '"></span>' + errorEnd.substr(error.endPos);

        var newsource = errorLines.join('\n');
        errorContainer.html(newsource);

        var errorlocation = $('#errorlocation' + this.id);
        var pos = errorlocation.offset();

        errorContainer.children().remove();

        // Ensure the popup is never displayed outside of the input field
        var minX = errorContainer.offset().left;
        var maxX = errorContainer.offset().left + errorContainer.outerWidth();
        this.x = (pos.left-3 < minX) ? minX : ((pos.left-3 > maxX) ? maxX : pos.left-3)
        this.y = 16 + pos.top;
        this.text = '';
        if (error.type === 'lexical') {
            this.text = '<span style = "color: #FF1144;">Syntax Error</span> Unexpected \"' + error.found + '\" at position ' + (error.startPos+1) + '.';
        } else if (error.found === '') {
            this.text = '<span style = "color: #FF1144;">Syntax Error</span> Expected expression or operator at position ' + error.endPos + '.';
        } else {
            this.text = '<span style = "color: #FF1144;">Syntax Error</span> Unexpected \"' + error.found + '\" at position ' + error.startPos + ' to ' + error.endPos + '.'; /*' in line ' + error.firstLine;*/
        }
    };

    WebView.prototype.runtimeErrorMessage = function(id, error, selector) {
        this.x = 0;
        this.y = 0;

        if (false) { //TODO check if attributable to single quantity definition

        } else {
            //Default display location
            var errorlocation = $(selector);
            var pos = errorlocation.offset();
            console.log(pos);

            this.x = -92 + pos.left + errorlocation.width();
            this.y = 48 + pos.top;
        }

        if (error.type === 'lexical') {
            this.text = '<span style = "color: #FF1144;">Syntax Error</span> ' + error.message;
        } else {
            this.text = '<span style = "color: #FF1144;">Runtime Error</span> ' + error.message;
        }
    };

    WebView.prototype.handleError = function(error) {
        var errormsg = null;
        this.errorCount++;

        switch(error.constructor.name) {
            case 'SyntaxError':
                // Can be either a lexical scanner or parsing error. Handle appropriately
                errormsg = new this.syntaxErrorMessage(this.errorCount, error, '#scriptline');
                break;
            case 'TypeError':
                //previously thrown when excessive whitespace was input
                break;
            case 'RuntimeError':
                errormsg = new this.runtimeErrorMessage(this.errorCount, error, '#scriptoptions');
                break;
            case 'Error':
                errormsg = new this.runtimeErrorMessage(this.errorCount, error, '#scriptoptions');
                break;
            default:
                errormsg = {
                    id: this.errorCount,
                    x: 0,
                    y: 16,
                    text: '<span style = "color: #FF1144;">Unknown error</span> Something went wrong internally during compilation.'
                };
                break;
        }

        $('.tooltipcontainer > .errormessage').filter(":visible").trigger('click');
        var errorTooltip = new Tooltip(this.errorCount++, 'errormessage', errormsg.x, errormsg.y);
        errorTooltip.set(errormsg.text);
    };

    WebView.prototype.deselect = function() {
        var sel = window.getSelection();
        sel.removeAllRanges();
    };

    WebView.prototype.selectContent = function(selector) {
        var element = $(selector)[0];
        var range = document.createRange();
        range.selectNodeContents(element);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    };

    WebView.prototype.encodeHTML = function(string) {
        return String(string).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    };

    WebView.prototype.getPrecision = function(number) {
        //To compensate for javascript's floating point errors we use a correction variable which will temporarily convert floats to ints
        var correction = 100000;
        var numberdecimals = (number * correction - Math.floor(number) * correction) / correction;
        var precision = 0;

        while (numberdecimals % 1 !== 0) {
            numberdecimals *= 10;
            precision++;
        }
        return precision;
    };

    return WebView;
});
