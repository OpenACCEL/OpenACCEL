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
        "../View/Tabs/Network",
        "../View/Graphics/CanvasCreator"],
        /**@lends View*/
        function(AbstractView, Tooltip, EditRun, HelpDemo, Analysis, IOEdit, Optimisation, Simulation, Network, CanvasCreator, deparam) {
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
        if (!this.state.tab) {
            this.state.tab = 'editrun';
        }

        /**
         * The various tabs that this view has to offer.
         */
        this.tabs = {};
        this.tabs.editrun = new EditRun(this.canvasCreator);
        this.tabs.helpdemo = new HelpDemo();
        this.tabs.ioedit = new IOEdit();
        this.tabs.analysis = new Analysis(this.canvasCreator);
        this.tabs.optimisation = new Optimisation(this.canvasCreator);
        this.tabs.simulation = new Simulation(this.canvasCreator);
        this.tabs.network = new Network(this.canvasCreator);

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

        $("#analysis").on('click', function() {
            if ($(this).hasClass("disabled")) {
                alert("The script has not been compiled yet.");
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
     * Replaces the current application state with the new one.
     *
     * @param {Object} state The state object to set the application state to
     * @post The application state has been set to the parameters of the given
     * state object
     */
    WebView.prototype.setState = function(state) {
        location.hash = $.param.fragment(location.hash, state, 2);
    };

    /**
     * Merges the attributes in the given object into the
     * current state, overriding any existing attributes with
     * the same name
     *
     * @param {Object} state The state object with attributes to
     * merge into the current state.
     * @post The attributes of the given object are merged into the current
     * application state
     */
    WebView.prototype.addState = function(state) {
        location.hash = $.param.fragment(location.hash, state, 0);
    };

    /**
     * Clears the plot canvas
     */
    WebView.prototype.clearCanvas = function() {
        if (typeof this.tabs[this.currentTab].clearCanvas === "function") {
            this.tabs[this.currentTab].clearCanvas();
        }
    };

    /**
     * Updates the plot canvas
     */
    WebView.prototype.drawPlot = function() {
        if (typeof this.tabs[this.currentTab].drawPlot === "function") {
            this.tabs[this.currentTab].drawPlot();
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

        // Default
        if (typeof newState.tab === 'undefined') {
            newState.tab = "editrun";
        }

        // Make tab consistent with possible other variables in hash
        if (newState.script) {
            newState.tab = "editrun";
        } else if (newState.help) {
            newState.tab = "helpdemo";
        }

        // Activate other tab when nessecary
        if ((newState.tab && (newState.tab !== this.state.tab)) || initial === true) {
            // Make correct tab active
            $("li.navtab").removeClass("ui-tabs-active");
            $("li#" + newState.tab + ".navtab").addClass("ui-tabs-active");

            // Show contents of newly activated tab and trigger events
            if (this.state.tab) {
                this.onLeaveTab(this.state.tab);
                $(".tabcontent").hide();
            }

            $("#" + newState.tab + ".tabcontent").show();
            this.onEnterTab(newState);
        } else {
            // Hashchange within current tab
            if (this.tabs[newState.tab].onHashChange) {
                this.tabs[newState.tab].onHashChange(this.state, newState);
            }
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
    WebView.prototype.onEnterTab = function(newState) {
        if (this.tabs[newState.tab].onEnterTab) {
            this.tabs[newState.tab].onEnterTab(newState);
        }

        //Tooltips loaded and shown
        try {
            this.tooltips[newState.tab].toggle(true);
        } catch(e) {

        }

        this.currentTab = newState.tab;
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
        if (this.tabs[tab].onLeaveTab) {
            this.tabs[tab].onLeaveTab();
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
        if (controller.hasOptimisation()) {
            if ($('#optimisation').hasClass('disabled')) {
                $('#optimisation').removeClass('disabled').children("a").attr('href', '#tab=optimisation');
            }
        } else {
            if (!$('#optimisation').hasClass('disabled')) {
                $('#optimisation').addClass('disabled').children("a").removeAttr('href');
            }
        }

        // Disable analysis tab. Will be re-enabled again when the script is compiled
        if (!$('#analysis').hasClass('disabled')) {
            $('#analysis').addClass('disabled').children("a").removeAttr('href');
        }

        switch(this.currentTab) {
            case 'editrun':
                this.tabs.editrun.synchronizeScriptList(script.getQuantities());
                break;
            case 'ioedit':
                this.tabs.ioedit.synchronizeScriptArea();
                break;
        }
    };

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
    };

    /**
     * Event that gets called when the controller has compiled a new script.
     */
    WebView.prototype.onNewScript = function() {
        this.resetAllPlots();

        var script = controller.getScript();
        this.tabs.editrun.canvas.setModel(script);
        this.tabs.simulation.canvas.setModel(script);
        this.tabs.optimisation.canvas.setModel(controller.getGeneticOptimisation());

        // Synchronize edit/run and IO/edit tabs with new script
        this.tabs.editrun.resetEditRun();
        this.tabs.editrun.synchronizeScriptList(script.getQuantities());
        this.tabs.ioedit.synchronizeScriptArea();

        // Check whether to disable the genetic optimisation tab
        if (!controller.hasOptimisation()) {
            if (!$('#optimisation').hasClass('disabled')) {
                $('#optimisation').addClass('disabled').children("a").removeAttr('href');
            }
        } else {
            $('#optimisation').removeClass('disabled').children("a").attr('href', '#tab=optimisation');
        }

        // Enable the analysis tab if needed
        if ($('#analysis').hasClass('disabled')) {
            $('#analysis').removeClass('disabled').children("a").attr('href', '#tab=analysis');
        }
    };

    /**
     * Event that gets called when the genetic algorithm has generated a new generation.
     */
    WebView.prototype.onNewGeneration = function() {
        this.tabs.optimisation.drawPlot();
    };

    /**
     * Resets all canvasses and plots, such that they are as good as new!
     */
    WebView.prototype.resetAllPlots = function() {
        for (var key in this.tabs) {
            if (this.tabs[key].canvas) {
                this.tabs[key].canvas.clearCanvas();
                this.tabs[key].canvas.clearBuffers();
            }
        }
    };

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
        this.handleError(error);
    };

    WebView.prototype.resizeContainer = function() {
        var widthPercentage = 0.8;
        var windowWidth = $(window).innerWidth();
        var fixedWidth = 1600 * widthPercentage;
        var variableWidth = windowWidth * widthPercentage;
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
        this.x = (pos.left-3 < minX) ? minX : ((pos.left-3 > maxX) ? maxX : pos.left-3);
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
                errormsg = new this.syntaxErrorMessage(this.errorCount, error, '#editrun_scriptline');
                break;
            case 'TypeError':
                //previously thrown when excessive whitespace was input
                break;
            case 'RuntimeError':
                errormsg = new this.runtimeErrorMessage(this.errorCount, error, '#editrun_scriptoptions');
                break;
            case 'Error':
                errormsg = new this.runtimeErrorMessage(this.errorCount, error, '#editrun_scriptoptions');
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
