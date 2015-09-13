/* Browser vs. Node ***********************************************/
inBrowser = typeof window !== 'undefined';
inNode = !inBrowser;

if (inNode) {
    require = require('requirejs');
    globalScope = process;
} else {
    globalScope = window;
    require.config({
        baseUrl: "scripts"
    });
}
/*******************************************************************/

define(["../Controller/AbstractView",
        "../View/Tooltip",
        "../View/Tabs/IntroTab",
        "../View/Tabs/EditRun",
        "../View/Tabs/Help",
        "../View/Tabs/Scripts",
        "../View/Tabs/Analysis",
        "../View/Tabs/IOEdit",
        "../View/Tabs/Optimisation",
        "../View/Tabs/Simulation",
        "../View/Tabs/Network",
        "../View/Graphics/CanvasCreator",
        ],
        /**@lends View*/
        function(AbstractView, Tooltip, IntroTab, EditRun, Help, Scripts, Analysis, IOEdit, Optimisation, Simulation, Network, CanvasCreator, deparam) {
    /**
     * @class
     * @classdesc The webview is the view class for webbrowsers.
     */
    function WebView() {
        /**
         * The CanvasCreator is responsible for creating drawable canvases for e.g. the Network tab and
         * script visualizations.
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
            // Set default tab to Edit/run
            this.state.tab = 'intro';
        }

        /**
         * The various tabs that this view has to offer.
         */
        this.tabs = {};
        this.tabs.intro = new IntroTab();
        this.tabs.editrun = new EditRun(this.canvasCreator);
        this.tabs.help = new Help();
        this.tabs.scripts = new Scripts();
        this.tabs.ioedit = new IOEdit();
        this.tabs.analysis = new Analysis(this.canvasCreator);
        this.tabs.optimisation = new Optimisation(this.canvasCreator);
        this.tabs.simulation = new Simulation(this.canvasCreator);
        this.tabs.network = new Network(this.canvasCreator);

        /**
         * The tab that is currently open.
         */
        this.currentTab = "";

        /**
         * Datastructure holding all currently active tooltips
         * for every tab.
         *
         * @type {Object}
         */
        this.tooltips = {};

        /**
         * Number of current errors.
         *
         * @type {Number}
         */
        this.errorCount = 0;


        // --- Setup event handlers --- //
        $(window).on('hashchange', this.onHashChange.bind(this));

        // Display reason of disabled buttons when clicked
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
    }

    WebView.prototype = new AbstractView();

    /**
     * Replaces the current application state with the given one.
     *
     * @param {Object} state The state object to set the application state to
     * @post The application state has been set to the parameters of the given
     * state object, overwriting the previous state
     */
    WebView.prototype.setState = function(state) {
        location.hash = $.param.fragment(location.hash, state, 2);
    };

    /**
     * Merges the attributes in the given object into the
     * current state, only overriding any existing attributes *with
     * the same name*.
     *
     * @param {Object} state The state object with attributes to
     * merge into the current state.
     * @post The attributes of the given object are merged into the current
     * application state.
     */
    WebView.prototype.addState = function(state) {
        location.hash = $.param.fragment(location.hash, state, 0);
    };

    /**
     * Clears the plot canvas of the current tab, if there is any
     */
    WebView.prototype.clearCanvas = function() {
        if (typeof this.tabs[this.currentTab].clearCanvas === "function") {
            this.tabs[this.currentTab].clearCanvas();
        }
    };

    /**
     * Updates the plot canvas of the current tab, if there is any
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
            newState.tab = "intro";
        }

        // Make "tab" variable consistent with possible other variables in hash
        if (newState.script || newState.userscript) {
            newState.tab = "editrun";
        } else if (newState.help) {
            newState.tab = "help";
        }

        // Activate other tab when nessecary
        if ((newState.tab && (newState.tab !== this.state.tab)) || initial === true) {
            // Show contents of newly activated tab and trigger events
            if (this.state.tab) {
                if (!this.onLeaveTab(this.state.tab)) {
                    // Abort tab switch
                    this.setState(this.state);
                    return;
                }

                $(".tabcontent").hide();
            }

            // Make correct tab active
            $("li.navtab").removeClass("ui-tabs-active");
            $("li#" + newState.tab + ".navtab").addClass("ui-tabs-active");

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
        if (typeof this.tabs[newState.tab].onEnterTab === "function") {
            this.tabs[newState.tab].onEnterTab(newState);
        }

        // Restore and show tooltips for this tab
        try {
            this.tooltips[newState.tab].toggle(true);
        } catch(e) {}

        this.currentTab = newState.tab;
        this.resizeContainer();
    };

    /**
     * Called just before a tab is left and made hidden. Returns
     * whether the tab switch should be executed (true) or aborted (false)
     *
     * @param  {Event} event The jQuery event that was fired
     * @param  {string} tab The identifier of the tab that will be hidden
     * @return {Boolean} Whether to proceed with tab switching
     */
    WebView.prototype.onLeaveTab = function(tab) {
        var switchTab = true;
        $('.tooltipcontainer > .datamessage').filter(":visible").trigger('click');
        if (typeof this.tabs[tab].onLeaveTab === "function") {
            switchTab = this.tabs[tab].onLeaveTab();
            if (switchTab === undefined) {
                switchTab = true;
            }
        }

        // Store currently visible tooltips for this tab, so they can be shown
        // again when switching back to this tab
        this.tooltips[tab] = $('.tooltipcontainer').filter(":visible");
        this.tooltips[tab].toggle(false);

        return switchTab;
    };

    /**
     * Event that gets called when one of the quantity definitions has been modified.
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

        // Disable analysis tab. Will be re-enabled again when/if the script is compiled
        if (!$('#analysis').hasClass('disabled')) {
            $('#analysis').addClass('disabled').children("a").removeAttr('href');
        }

        // Signal tabs
        jQuery.event.trigger("onModifiedQuantity", [script.getQuantities()]);
    };

    /**
     * Event that gets called when the controller has issued a new iteration of the script.
     */
    WebView.prototype.onNextStep = function() {
        var script = controller.getScript();

        // Signal tabs
        jQuery.event.trigger("onNextStep", [script.getOutputQuantities()]);

        // Draw a plot if one is visible in the current view tab.
        this.drawPlot();
    };

    /**
     * Event that gets called when the controller has compiled a new script.
     *
     * @param {Boolean} empty Whether the new script is an empty script.
     */
    WebView.prototype.onNewScript = function(empty) {
        var script = controller.getScript();
        this.resetAllPlots();

        // Set models for view canvases
        this.tabs.editrun.canvas.setModel(script);
        this.tabs.simulation.canvas.setModel(script);
        this.tabs.optimisation.canvas.setModel(controller.getGeneticOptimisation());

        // Check whether to disable the genetic optimisation tab
        if (!controller.hasOptimisation()) {
            if (!$('#optimisation').hasClass('disabled')) {
                $('#optimisation').addClass('disabled').children("a").removeAttr('href');
            }
        } else {
            $('#optimisation').removeClass('disabled').children("a").attr('href', '#tab=optimisation');
        }

        // Enable the analysis tab if needed
        if (!empty) {
            if ($('#analysis').hasClass('disabled')) {
                $('#analysis').removeClass('disabled').children("a").attr('href', '#tab=analysis');
            }
        } else {
            if (!$('#analysis').hasClass('disabled')) {
                $('#analysis').addClass('disabled').children("a").removeAttr('href');
            }
        }

        // Signal tabs
        jQuery.event.trigger("onNewScript", [script.getQuantities()]);
    };

    /**
     * Event that gets called when the genetic algorithm has generated a new generation.
     */
    WebView.prototype.onNewGeneration = function() {
        this.tabs.optimisation.drawPlot();
    };

    /**
     * Resets all canvasses and plots
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
        this.tabs.simulation.setExecuting(executing);
    };

    /**
     * Handles the given runtime error.
     *
     * @param {RuntimeError} err The error that occured during runtime.
     */
    WebView.prototype.runtimeError = function(error) {
        console.log(error);
        this.handleError(error);
    };

    /**
     * Resizes the view container in response to viewport changes and
     * tab switches.
     *
     * @post The view container has been resized if nessecary.
     */
    WebView.prototype.resizeContainer = function() {
        var windowWidth = $(window).innerWidth();

        var widthPercentage = 0.8;
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

    /**
     * Returns an appropriate error message for syntax errors.
     *
     * @param  {Number} id [description]
     * @param  {SyntaxError} error The SyntaxError object
     * @param  {String} selector The jQuery selector of the element in which to
     * display the error
     */
    WebView.prototype.syntaxErrorMessage = function(id, error, selector) {
        this.id = id;

        var errorContainer = $(selector);
        var editor = view.tabs.editrun.editor;
        var errorlocation = $('span.editor_error_token').first();
        var pos = errorlocation.offset();

        // Ensure the popup is never displayed outside of the input field
        var minX = errorContainer.offset().left;
        var maxX = errorContainer.offset().left + errorContainer.outerWidth();
        this.x = (pos.left-3 < minX) ? minX+errorlocation.outerWidth()/2 : ((pos.left-3 > maxX) ? maxX : pos.left-3+errorlocation.outerWidth()/2);
        this.y = 16 + pos.top;
        this.text = '';
        var errormsg = ''
        if (error.type === 'lexical') {
            errormsg = 'Unexpected \"' + error.found + '\" at position ' + (error.startPos+1);
        } else if (error.found === '') {
            errormsg = 'Expected expression or operator at position ' + error.endPos;
        } else {
            errormsg = 'Unexpected \"' + error.found + '\" at position ' + error.startPos + ' to ' + error.endPos; /*' in line ' + error.firstLine;*/
        }

        $(document).trigger("ERROR_SYNTAX", [errormsg]);

        this.text = '<span style = "color: #FF1144;">Syntax Error</span> ' + errormsg + '.'
    };

    /**
     * Returns an appropriate error message for runtime errors.
     *
     * @param  {Number} id [description]
     * @param  {RuntimeError} error The RuntimeError object
     * @param  {String} selector The jQuery selector of the element in which to
     * display the error
     */
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
            $(document).trigger("ERROR_SYNTAX", [error.message]);
        } else {
            this.text = '<span style = "color: #FF1144;">Runtime Error</span> ' + error.message;
            $(document).trigger("ERROR_RUNTIME", [error.message]);
        }
    };

    /**
     * Called when an error occured during script execution or compilation.
     *
     * @param {Object} error The error that occured.
     */
    WebView.prototype.handleError = function(error) {
        var errormsg = null;
        this.errorCount++;

        switch(error.constructor.name) {
            case 'SyntaxError':
                // Can be either a lexical scanner or parsing error. Handle appropriately
                errormsg = new this.syntaxErrorMessage(this.errorCount, error, '#editrun_scriptline');
                break;

            case 'RuntimeError':
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
                $(document).trigger("ERROR_UNKNOWN");
                break;
        }

        $('.tooltipcontainer > .errormessage').filter(":visible").trigger('click');
        var errorTooltip = new Tooltip(this.errorCount++, 'errormessage', errormsg.x, errormsg.y);
        errorTooltip.set(errormsg.text);
    };

    /**
     * Removes the focus of any selected element(s).
     */
    WebView.prototype.deselect = function() {
        var sel = window.getSelection();
        sel.removeAllRanges();
    };

    /**
     * Removes any existing selection and selects the
     * contents of the given selector.
     *
     * @param  {Node} selector The HTML element of which to select the contents.
     */
    WebView.prototype.selectContent = function(selector) {
        var element = $(selector)[0];
        var range = document.createRange();
        range.selectNodeContents(element);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    };

    /**
     * Encodes/escapes HTML entities that disturb the layout when used unescaped.
     * Currently the characters "&", "<" and ">" are escaped.
     *
     * @param  {String} string The string to escape
     * @return {String} The escaped string.
     */
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
