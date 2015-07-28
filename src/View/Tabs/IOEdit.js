require.config({
    baseUrl: "scripts"
});

define(["View/HTMLBuffer", "react-addons", "View/React/DebugConsole", "Model/DebugMessage", "cm/lib/codemirror", "cm/addon/edit/matchbrackets", "cm/mode/ACCEL/ACCEL"], /**@lends View*/ function(HTMLBuffer, React, DebugConsole, DebugMessage, CodeMirror) {
    /**
     * @class
     * @classdesc The IOEdit tab.
     */
    function IOEdit() {
        /**
         * An instance of the advanced (CodeMirror) editor currently being used, if any.
         *
         * @type {CodeMirror}
         */
        this.editor = null;

        /**
         * The saved width of the standard editor. Used to determine the width to
         * give to the advanced editor, when switched on. Also saved in a cookie on
         * the client.
         *
         * @type {Number}
         */
        this.editorWidth = 0;

        /**
         * Whether to show the values of the quantities inside the editor.
         *
         * @type {Boolean}
         */
        this.showValues = false;

        /**
         * The line inside which the cursor is currently placed.
         *
         * @type {Number}
         */
        this.currentLine = null;

        /**
         * Property of quantities by which to sort them in the editor.
         *
         * @type {String}
         */
        this.sortby = "linenum";

        /**
         * All currently displayed line widgets in the advanced editor.
         *
         * @type {[LineWidget]}
         */
        this.lineWidgets = {};

        this.lastJumpedToQuantity = null;

        // Setup CodeMirror instance and also setup advanced editor in IO/edit tab
        // when preference in localStorage is set as such
        this.cm = CodeMirror;
        if (localStorage.useAdvancedEditor === 'false') {
            this.toggleCM(false);
        } else {
            this.toggleCM(true);
        }

        /**
         * Object containing tools to modify the contents of the todo list
         *
         * @type {Object}
         */
        this.report = {
            /**
             * Generates HTML for an item in the list of todos
             *
             * @param {String} quantity Quantity which is to be implemented
             */
            getTodoListHTML: function(quantity) {
                return '' +
                    '<div onclick = "view.tabs.ioedit.report.onclickTodo(\'' + quantity + '\')" class = "hoverbold">' +
                        '<div class="ellipsis max128w">' + quantity + '</div>' +
                    '</div>';
            },

            /**
             * Called when the user clicks on a quanitty name in the todo list
             *
             * @param  {String} quantity Name of the quantity that was clicked on
             */
            onclickTodo: function(quantity) {
                // Ready quantity input field to begin defining this quantity
                $('#ioedit_scriptline').html(quantity + ' =&nbsp;');
            },

            /**
             * Buffer to contain updated #todolist content
             * @type {HTMLBuffer}
             */
            todoListBuffer: new HTMLBuffer("#ioedit_todolist"),

            /**
             * Adds a quantity that still has to be defined to the #todo element
             *
             * @param {String} quantity Todo quantity
             */
            addTodo: function(quantity) {
                view.tabs.ioedit.report.todoListBuffer.append(this.getTodoListHTML(quantity));
            },

            /**
             * Generates HTML for an item with a certain property, in a list of quantities. The property
             * can be e.g. a standard function.
             *
             * @param  {String} quantity Quantity of which a property is being displayed
             * @param  {String} property Property of the associated quantity.
             */
            getPropertyListHTML: function(quantity, property) {
                var html = '';
                if (property === 'std func.') {
                    html = 'view.tabs.ioedit.report.onclickStdFunc(\'' + quantity + '\')" style="color:#55CACA;"';
                } else {
                    html = 'view.tabs.ioedit.report.onclickProperty(\'' + quantity + '\')"';
                }

                return '' +
                    '<div onclick="' + html + ' class="propname_row">' +
                        '<div class="ellipsis max128w propname">' + quantity + '</div>' +
                        '<div class="property">' + property + '</div>' +
                    '</div>';
            },

            /**
             * Called when the user clicks on a quantity name in the report
             *
             * @param  {String} quantity The name of the quantity that was clicked on
             */
            onclickProperty: function(quantity) {
                // Remove all current highlighting of other lines
                $(".CodeMirror-linebackground").removeClass("editor_line_highlight");
                view.tabs.ioedit.scrollToQuantity(quantity);
            },

            /**
             * Called when the user clicks on a standard function name in the report
             *
             * @param {String} name The name of the standard function that was clicked on
             * @post The help article of the clicked on function is displayed
             */
            onclickStdFunc: function(name) {
                // Open help article of the clicked-on function
                view.setState({'tab': 'helpdemo', 'help': name});
            },

            /**
             * Buffer to contain updated #arglist content
             * @type {HTMLBuffer}
             */
            argListBuffer: new HTMLBuffer("#ioedit_arglist"),

            /**
             * Adds the given quantity with the given property to the list of arguments of the currently
             * selected quantity.
             *
             * @param {String} quantity Quantity which is an argument for the selected quantity
             * @param {String} property [description]
             */
            addArg: function(quantity, property) {
                view.tabs.ioedit.report.argListBuffer.append(this.getPropertyListHTML(quantity, property));
            },

            /**
             * Buffer to contain updated #argtolist content
             * @type {HTMLBuffer}
             */
            argToListBuffer: new HTMLBuffer("#ioedit_argtolist"),

            /**
             * Adds the given quantity with the given property to the list of arguments to the currently
             * selected quantity.
             *
             * @param {String} quantity Quantity of which the selected quantity is an argument
             * @param {String} property [description]
             */
            addArgto: function(quantity, property) {
                view.tabs.ioedit.report.argToListBuffer.append(this.getPropertyListHTML(quantity, property));
            }
        };

        /**
         * The debugconsole of this tab. This is a ReactJS component
         *
         * @type {DebugConsole}
         */
        this.debugconsole = null;
        this.showdebug = true;

        this.registerCallbacks();

        $("#ioedit_qtysort").css({'margin-right': $("#ioedit_tododiv").outerWidth()+15});
    }

    /**
     * Sets up all callbacks for events within this tab.
     */
    IOEdit.prototype.registerCallbacks = function() {
        // Called when the script has been modified
        $(document).on("onModifiedQuantity", function(event, quantities) {
            view.tabs.ioedit.onModifiedQuantity(quantities);
        });

        // Called when a new script has been compiled
        $(document).on("onNewScript", function(event, quantities) {
            view.tabs.ioedit.onNewScript(quantities);
        });
    };

    /**
     * Event that gets called when this tab gets opened.
     */
    IOEdit.prototype.onEnterTab = function(state) {
        if (this.debugconsole === null) {
            this.debugconsole = React.render(<DebugConsole controller={controller} prefix="ioedit" />, document.getElementById('debugconsole_container_io'));
        }

        // Set sorting to linenumber as the script as it is now will be processed
        // in the inputted order and thus the linenumbers will be updated to their
        // current position as well
        $("#ioedit_qtyselector").val("");
        this.sortby = "linenum";
        $("#ioedit_qtysort").val("linenum");
        this.sortQuantities(this.sortby);

        view.hasPlot = false;
        this.report.todoListBuffer.empty();
        this.report.todoListBuffer.flip();

        // Determine which script source to display in editor
        if (state.script) {
            // Display source of demoscript that contained an error
            var script = controller.library.getDemoScript(state.script);
            this.setEditorContents(script);
            this.saveScript();
        } else if (state.loadLocal) {
            // Display source of script in localStorage that contained an error
            if (controller.autoSaveStore.hasScript()) {
                var script = controller.autoSaveStore.loadScript();
                this.setEditorContents(script);
                this.saveScript();
            }
        } else {
            // Just obtain the current script from the controller and display it
            var script = this.getCurrentScript();
            this.setEditorContents(script);
            this.updateTodoList();
        }
    };

    /**
     * Event that gets called when this tab gets closed.
     */
    IOEdit.prototype.onLeaveTab = function() {
        // Build script from inputted source when leaving IO/edit
        var ok = this.saveScript();
        if (!ok) {
            alert("There are errors in the script. Please fix them first");
        }

        return ok;
    };

    IOEdit.prototype.toggleDebugConsole = function() {
        $("#debugconsole_container_io").toggle();

        if (this.showdebug === true) {
            $("#er_debugtoggle_io").text("Show");
        } else {
            $("#er_debugtoggle_io").text("Hide");
        }

        this.showdebug = !this.showdebug;
    };

    /**
     * Saves the current contents of the editor to the controller.
     *
     * @return {Boolean} Whether the script has been succesfully saved. False
     * if for example a syntax error occured.
     */
    IOEdit.prototype.saveScript = function() {
        // Save contents to underlying textarea input
        if (this.editor) {
            this.editor.save();
        }

        // Check script for syntax errors
        var script = $('#ioedit_scriptarea').val();
        if (this.checkScript(script)) {
            controller.setScriptFromSource(script);

            this.showValues = false;
            $('#ioedit_showvalues').val('Show values');
            return true;
        } else {
            return false;
        }
    };

    /**
     * Sets the contents of the editor to the given source, updates
     * the editor and focusses it
     *
     * @param {String} source The new contents for the editor.
     */
    IOEdit.prototype.setEditorContents = function(source) {
        $('#ioedit_scriptarea').val(source);

        // Let the advanced editor update itself too, if in use
        if (this.usingEditor()) {
            this.editor.setValue(source);
            this.editor.refresh();
            this.cm.signal(this.editor, "changes");
            this.focusEditor();
            this.updateQuantitySelector();
        }
    };

    /**
     * Updates the combobox for selecting a quantity to go to
     */
    IOEdit.prototype.updateQuantitySelector = function() {
        var quantities = controller.getScript().quantities;
        var qties = _.sortBy(quantities, "name");
        var qtynames = [];
        for (var elem in qties) {
            var qtyname = qties[elem].name;
            qtynames.push(qtyname);
        }

        $("#ioedit_qtyselector").quickselect({
            'minChars': 0,
            'matchCase': false,
            'matchMethod': 'startsWith',
            'data': qtynames,
            'autoSelectFirst': false,
            'onItemSelect': function() {
                var jumpto = $("#ioedit_qtyselector").val();
                if (jumpto != view.tabs.ioedit.lastJumpedToQuantity) {
                    // Remove all current highlighting of other lines
                    $(".CodeMirror-linebackground").removeClass("editor_line_highlight");
                    view.tabs.ioedit.scrollToQuantity(jumpto);
                    view.tabs.ioedit.lastJumpedToQuantity = jumpto;
                }
            }
        });
    };

    /**
     * Scrolls the editor so that the given quantity is visible inside the viewport.
     *
     * @param  {String} qty The name of the quantity to scroll to
     */
    IOEdit.prototype.scrollToQuantity = function(qty) {
        // Get line number of given quantity
        var quantity;
        try {
            quantity = controller.getScript().getQuantity(qty);
        } catch (e) {
            return;
        }

        var linenum = quantity.linenum;

        // Scroll to the line at which it is currently located
        var t = this.editor.charCoords({line: linenum, ch: 0}, "local").top;
        var middleHeight = this.editor.getScrollerElement().offsetHeight / 2;
        this.editor.scrollTo(null, t - middleHeight - 5);

        // Highlight line and place cursor in it
        this.updateReport(quantity.name);
        if (!this.lineWidgets.hasOwnProperty(linenum)) {
            this.editor.addLineClass(linenum, "background", "editor_line_highlight");
        }
    };

    /**
     * Sets by which attribute to sort the quantities in the script.
     * @param  {[type]} sort [description]
     * @return {[type]}      [description]
     */
    IOEdit.prototype.sortQuantities = function(sort) {
        this.sortby = sort;
        this.setEditorContents(this.getCurrentScript());
    };

    /**
     * Updates the todo list based on the given set of quantities
     *
     * @param  {Object} quantities Set of quantities
     */
    IOEdit.prototype.updateTodoList = function() {
        var quantities = controller.getScript().quantities;
        this.report.todoListBuffer.empty();

        // Loop through all quantities in script and add TODO quantities
        // to the todo list
        for (var q in quantities) {
            var quantity = quantities[q];
            if (quantity.todo) {
                this.report.addTodo(quantity.name);
            }
        }

        this.report.todoListBuffer.flip();
    };

    /**
     * Checks the script for syntax errors, and handles
     * displaying of any errors that might be present.
     *
     * @return {Boolean} Whether the given script is error-free
     */
    IOEdit.prototype.checkScript = function(script) {
        if (this.usingEditor()) {
            var lines = script.split("\n");
            var scriptOK=true;

            // Check syntax of every line separately, and save errors
            this.editor.eachLine((function(lineHandle) {
                if (!this.checkLine(lineHandle)) {
                    scriptOK = false;
                }
            }).bind(this));

            // Return whether the script was error-free
            return scriptOK;
        }
    };

    /**
     * Checks the given line for syntax errors, and handles
     * displaying of any errors that might be present.
     *
     * @return {Boolean} Whether the given line is error-free
     */
    IOEdit.prototype.checkLine = function(lineHandle) {
        // Clear any existing line widget and remove
        // error styling
        var i = this.editor.getLineNumber(lineHandle);
        this.clearLineErrors(i);

        try {
            controller.checkSyntax(lineHandle.text);
            return true;
        } catch (e) {
            this.setLineError(lineHandle, e);
            var msg = new DebugMessage(e.toReadable(), "ERROR_SYNTAX");
            $(document).trigger("DEBUGLOG_POST_MESSAGE", [msg]);
            return false;
        }
    };

    /**
     * Sets the given error for the given line.
     *
     * @param {CodeMirror.LineHandle} lineHandle The line on which to set the error
     * @param {SyntaxError} error The error to display
     */
    IOEdit.prototype.setLineError = function(lineHandle, error) {
        // Construct line widget DOM element from error message
        var i = this.editor.getLineNumber(lineHandle);
        var lineWidget = $("<div class='editor_line_widget'>" + error.toReadable() + "</div>")[0];

        // Add error line widget below current line, and save the widget so we
        // can clear it later
        this.editor.addLineClass(lineHandle, "background", "editor_line_syntaxerror");
        this.editor.addLineClass(lineHandle, "text", "editor_text_syntaxerror");
        this.lineWidgets[i] = this.editor.addLineWidget(lineHandle, lineWidget);
        this.editor.markText({'line': i, 'ch': error.endPos}, {'line': i, 'ch': error.endPos+1}, {'className': 'editor_error_token'});
    };

    /**
     * Clears the given line number of any errors that might
     * be displayed at the moment
     *
     * @param {Number} line The line number which to clear from errors
     */
    IOEdit.prototype.clearLineErrors = function(line) {
        // Remove error styling
        this.editor.removeLineClass(line, "background", "editor_line_syntaxerror");
        this.editor.removeLineClass(line, "text", "editor_text_syntaxerror");

        // Delete line widget
        if (this.lineWidgets.hasOwnProperty(line)) {
            this.lineWidgets[line].clear();
            delete this.lineWidgets[line];
        }
    };

    /**
     * Called when the script is modified.
     *
     * @param {Object} quantities All quantities in the current script
     */
    IOEdit.prototype.onModifiedQuantity = function(quantities) {
        // Do nothing for now, we do not respond to events of changed scripts
        // here as the user is busy editing the script in this tab himself.
    };

    /**
     * Called when the controller has compiled a new script.
     *
     * @param {Object} quantities All quantities in the current script
     */
    IOEdit.prototype.onNewScript = function(quantities) {
        // Clear all displayed error messages
        for (var elem in this.lineWidgets) {
            delete this.lineWidgets[elem];
        }
    };

    /**
     * Toggles between showing and not showing the values of quantities inside
     * the editor.
     */
    IOEdit.prototype.toggleValues = function() {
        var shouldShowValues = !this.showValues;

        // First save the current contents of the textarea to the script,
        // so that any changes that might have been made won't be lost
        this.saveScript();  // This sets this.showValues to false!
        this.showValues = shouldShowValues;

        if (shouldShowValues) {
            try {
                var script = this.getCurrentScript({'includeValues': true});
                this.setEditorContents(script);
                $('#ioedit_showvalues').val('Hide values');
            } catch (e) {
                // Catch any syntax error messages, or messages thrown when the script
                // cannot be compiled because it's not complete yet
                alert(e.message);
            }
        } else {
            var script = this.getCurrentScript({'includeValues': false});
            this.setEditorContents(script);
            $('#ioedit_showvalues').val('Show values');
        }
    };

    /**
     * Constructs an advanced (CodeMirror) editor and replaces the standard textarea with it.
     */
    IOEdit.prototype.constructAdvancedEditor = function() {
        // Construct editor
        var advEditor = this.cm.fromTextArea(document.getElementById('ioedit_scriptarea'), {
            mode: 'ACCEL',
            theme: 'default',
            matchBrackets: true,
            lineNumbers: true,
            lineWrapping: false,
            undoDepth: 50,             // Try to save some memory
            viewportMargin: Infinity    // Always render entire document, so that text search and e.g. added event handlers work correctly
            //gutters: []
        });

        /**--- Register events ---*/
        // When a piece of text is 'dropped' into the editor, clear the current contents
        // first
        advEditor.on("drop", function(instance, e) {
            // Do not prevent the default and just clear the contents of the editor.
            // Let the event propagate further and let CodeMirror handle the rest
            this.editor.setValue('');
        });

        // Add event handlers to all built-in functions for showing help
        advEditor.on("changes", this.setupFunctionClickEvents);

        // Add event handler to detect when the cursor changes line number
        advEditor.on("cursorActivity", (function(cm) {
            this.onCursorActivity(cm);
        }).bind(this));

        setTimeout((function() {
            this.cm.signal(advEditor, "changes");
        }).bind(this), 100);

        return advEditor;
    };

    /**
     * Registers event handlers for all built-in function names
     * currently present in the contents of the editor.
     */
    IOEdit.prototype.setupFunctionClickEvents = function(instance, changes) {
        // Start looking in the dom tree only from the CodeMirror div down
        $(".cm-builtin","div.CodeMirror").on("dblclick", function(e) {
            e.preventDefault();

            view.setState({'tab': 'helpdemo', 'help': e.target.innerHTML});
            e.stopPropagation();
            e.cancelBubble = true;
        });
    };

    /**
     * Called when the cursor position in the editor changes
     *
     * @param {CodeMirror} cm The CodeMirror instance that fired the event
     */
    IOEdit.prototype.onCursorActivity = function(cm) {
        var newLineNum = cm.getCursor().line;
        if (this.currentLine !== newLineNum && !this.editor.somethingSelected()) {
            // Clear highlighting of any quantities
            $(".CodeMirror-linebackground").removeClass("editor_line_highlight");

            // Retrieve current cursor position to restore it later
            var cursor = this.editor.getCursor();

            // Check script syntax, let controller analyse, parse and optionally compile
            // it and update editor with the parsed script
            if (this.saveScript()) {
                var script = this.getCurrentScript();
                this.setEditorContents(script);

                // Update todo list and report, and restore cursor position
                this.updateTodoList();
                this.editor.setCursor(cursor);
            }

            var quantityname = this.editor.getLine(cursor.line).split("=")[0];
            this.updateReport(quantityname);

            this.currentLine = newLineNum;
        }
    };

    /**
     * Updates the argument-of and -to lists based on the
     * given quantity
     *
     * @param  {String} quantityname The name of the quantity
     */
    IOEdit.prototype.updateReport = function(quantityname) {
        // Update argument-of of and argument-to lists
        this.report.argListBuffer.empty();
        this.report.argToListBuffer.empty();

        var quantity;
        try {
            quantity = controller.getQuantity(quantityname);

            // list parameters (type = dummy)
            for (var p in quantity.parameters) {
                this.report.addArg(quantity.parameters[p], 'dummy');
            }

            // list dependencies (type = regular)
            for (var d in quantity.dependencies) {
                this.report.addArg(quantity.dependencies[d], 'regular');
            }

            // list used standard functions (type = standard function)
            for (var s in quantity.stdfuncs) {
                this.report.addArg(quantity.stdfuncs[s], 'std func.');
            }

            // list reverse dependencies (type = regular)
            for (var r in quantity.reverseDeps) {
                this.report.addArgto(quantity.reverseDeps[r], 'regular');
            }
        } catch (e) {
            quantityname = "";
        }

        $('.quantityname').text(quantityname);

        this.report.argListBuffer.flip();
        this.report.argToListBuffer.flip();

        // Update position of dropdown sort input
        $("#ioedit_qtysort").css({'margin-right': $("#ioedit_tododiv").outerWidth()+15});
    };

    /**
     * Toggles between the advanced and basic editor, based on the
     * value of the corresponding checkbox in the UI.
     *
     * @param {Boolean} onload Whether this function is called on tab load.
     */
    IOEdit.prototype.toggleCM = function(onload) {
        var use;
        if (this.usingEditor()) {
            // Get width of current editor, set advanced editor
            // to be the same size
            var currentWidth = parseInt(localStorage.getItem("advancedEditorWidth"));
            if (currentWidth === null || isNaN(currentWidth)) {
                currentWidth = $("#ioedit_scriptarea").width();
            }

            // Construct CodeMirror editor from textarea
            this.editor = this.constructAdvancedEditor();
            this.editor.setSize(currentWidth, 400);
            this.editor.refresh();
            use = true;
        } else {
            // Revert back to standard textarea
            if (this.editor) {
                this.editor.save();
                this.editor.toTextArea();
                this.editor = null;
            }
            use = false;
        }

        // Save preference to localStorage
        localStorage.useAdvancedEditor = use;
        if (use) {
            localStorage.advancedEditorWidth = currentWidth;
        }
    };


    /**
     * Returns whether the advanced editor is currently being used
     *
     * @return {Boolean} Whether the advanced editor is currently being used
     */
    IOEdit.prototype.usingEditor = function() {
        return true;
    };

    /**
     * Gives focus to the advanced editor when in use, causing it to redraw.
     */
    IOEdit.prototype.focusEditor = function() {
        if (this.usingEditor()) {
            this.editor.focus();
        }
    };

    /**
     * Performs a one-time check of the units of the quantities in the script
     * and displays them after the quantities inside the editor
     */
    IOEdit.prototype.checkUnits = function() {
        $('#ioedit_checkUnitsMsg').css({'color':'white', 'visibility':'visible', 'display':'block'});
        $('#ioedit_checkUnitsMsg').text('Checking units...');
        $('#ioedit_showvalues').val('Show values');
        this.showValues = false;
        $('#ioedit_clearerrors').css({'visibility':'hidden'});

        if (this.usingEditor()) {
            this.editor.save();
        }

        setTimeout((function() {
            var uniterrors = [];
            try {
                var source = $('#ioedit_scriptarea').val();
                controller.checkUnits(source);
                $('#ioedit_checkUnitsMsg').css({'color':'rgb(31,212,60)'});
                $('#ioedit_checkUnitsMsg').text('Units OK');
                var msg = new DebugMessage("Units OK!", "NOTICE");
                msg.style = {color: "#50BD2E", fontWeight: 'bold'};
                $(document).trigger("DEBUGLOG_POST_MESSAGE", [msg]);
            } catch (e) {
                // If the script wasn't simply incomplete but actual unit errors occured...
                if (!e.incomplete) {
                    $('#ioedit_checkUnitsMsg').css({'color':'red'});
                    $('#ioedit_checkUnitsMsg').text('Unit error(s)!');
                    $('#ioedit_clearerrors').css({'visibility':'visible'});

                    uniterrors = e.message;
                } else {
                    // Script incomplete, hide progress message but don't indicate unit errors
                    $('#ioedit_checkUnitsMsg').hide();
                }
                // var msg = new DebugMessage(e.message, "ERROR_SYNTAX");
                // $(document).trigger("DEBUGLOG_POST_MESSAGE", [msg]);
                //alert(e.message);
            } finally {
                var script = this.getCurrentScript({'includeCheckedUnits':true});
                this.setEditorContents(script);
                for (var elem in uniterrors) {
                    var err = uniterrors[elem];
                    var linenum = controller.script.getQuantity(err.quantity).linenum;
                    var lh = this.editor.getLineHandle(linenum);
                    this.setLineError(lh, err);
                }
                setTimeout(function() {$('#ioedit_checkUnitsMsg').fadeOut(400);}, 2500);
            }
        }).bind(this), 100);
    };

    /**
     * Hides all unit errors in the script, if any.
     */
    IOEdit.prototype.clearUnitErrors = function() {
        // First save the current contents so any changes won't be lost
        if (this.usingEditor()) {
            this.editor.save();
        }
        var source = $('#ioedit_scriptarea').val();
        controller.setScriptFromSource(source);

        var script = this.getCurrentScript({'includeCheckedUnits':false});
        this.setEditorContents(script);
        $('#ioedit_clearerrors').css({'visibility':'hidden'});
    };

    /**
     * Retrieves and returns the current script source from the controller
     *
     * @param {Object} options Object containing parameters which determine
     * what is included in the returned source.
     */
    IOEdit.prototype.getCurrentScript = function(options) {
        // Set defaults options object if none is given
        if (typeof options === 'undefined') {
            options = {};
        }

        // Set options
        options.includeComments = true;
        options.includeUnits = true;
        options.sort = this.sortby;

        // Retrieve and return current source of the script
        var script = controller.scriptToString(options);

        return script;
    };

    return IOEdit;
});
