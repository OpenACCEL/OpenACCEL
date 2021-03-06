require.config({
    baseUrl: "scripts"
});

define(["View/Input", "View/HTMLBuffer", "Model/Script", "react-addons", "View/React/DebugConsole", "cm/lib/codemirror", "cm/addon/edit/matchbrackets", "cm/mode/ACCEL/ACCEL"], /**@lends View*/ function(Input, HTMLBuffer, Script, React, DebugConsole, CodeMirror) {
    /**
     * @class
     * @classdesc The EditRun tab.
     */
    function EditRun(canvasCreator) {
        /**
         * An instance of the advanced (CodeMirror) editor currently being used, if any.
         *
         * @type {CodeMirror}
         */
        this.editor = null;

        /**
         * The CodeMirror text marker used to mark errors in the input field.
         *
         * @type {CodeMiror.TextMarker}
         */
        this.errorMarker = null;

        /**
         * The CodeMirror instance to use in this tab
         *
         * @type {CodeMirror}
         */
        this.cm = CodeMirror;

        /**
         * Number of object-elements the objectToString function
         * should generate before it is terminated.
         *
         * @memberof View
         * @type {Number}
         */
        this.maxPrintElements = 1000;

        /**
         * The main canvas where the user sees or her plot.
         */
        this.canvas = canvasCreator.createCanvas(new Script(), "editrun_plot", 300, 300);

        /**
         * Buffer to contain updated #scriptlist content
         * @memberof View
         * @type {HTMLBuffer}
         */
        this.scriptListBuffer = new HTMLBuffer("#editrun_scriptlist");

        /**
         * Buffer to contain updated #userinput content
         * @memberof View
         * @type {HTMLBuffer}
         */
        this.userInputBuffer = new HTMLBuffer("#editrun_userinput");

        /**
         * Input element creation class.
         */
        this.Input = new Input();

        /**
         * Array of input javascript objects
         * @memberof View
         * @type {Array}
         */
        this.inputs = [];

        /**
         * The maximum width of the quantity definition column in the quantity list.
         * @type {Number}
         */
        this.definitionWidth = '128';

        /**
         * Object containing tools to modify the contents of the todo list, argument lists and result list
         * @memberof View
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
                    '<div onclick = "view.tabs.editrun.report.onclickTodo(\'' + quantity + '\')" class = "hoverbold">' +
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
                view.tabs.editrun.editor.setValue(quantity + '=');
            },

            /**
             * Buffer to contain updated #todolist content
             * @type {HTMLBuffer}
             */
            todoListBuffer: new HTMLBuffer("#editrun_todolist"),

            /**
             * Adds a quantity that still has to be defined to the #todo element
             *
             * @param {String} quantity Todo quantity
             */
            addTodo: function(quantity) {
                view.tabs.editrun.report.todoListBuffer.append(this.getTodoListHTML(quantity));
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
                    html = 'view.tabs.editrun.report.onclickStdFunc(\'' + quantity + '\')" style="color:#55CACA;"';
                } else {
                    html = 'view.tabs.editrun.report.onclickProperty(\'' + quantity + '\')"';
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
                // Highlight clicked quantity in script list
                var i = view.tabs.editrun.lineNumber[quantity];
                view.tabs.editrun.selectScriptline(i, quantity);
                $('#editrun_line' + i).trigger('click');
            },

            /**
             * Called when the user clicks on a standard function name in the report
             *
             * @param {String} name The name of the standard function that was clicked on
             * @post The help article of the clicked on function is displayed
             */
            onclickStdFunc: function(name) {
                // Open help article of the clicked-on function
                view.setState({'tab': 'help', 'help': name});
            },

            /**
             * Buffer to contain updated #arglist content
             * @type {HTMLBuffer}
             */
            argListBuffer: new HTMLBuffer("#editrun_arglist"),

            /**
             * Adds the given quantity with the given property to the list of arguments of the currently
             * selected quantity.
             *
             * @param {String} quantity Quantity which is an argument for the selected quantity
             * @param {String} property [description]
             */
            addArg: function(quantity, property) {
                view.tabs.editrun.report.argListBuffer.append(this.getPropertyListHTML(quantity, property));
            },

            /**
             * Buffer to contain updated #argtolist content
             * @type {HTMLBuffer}
             */
            argToListBuffer: new HTMLBuffer("#editrun_argtolist"),

            /**
             * Adds the given quantity with the given property to the list of arguments to the currently
             * selected quantity.
             *
             * @param {String} quantity Quantity of which the selected quantity is an argument
             * @param {String} property [description]
             */
            addArgto: function(quantity, property) {
                view.tabs.editrun.report.argToListBuffer.append(this.getPropertyListHTML(quantity, property));
            },

            /**
             * List to allow for value updates without reconstruction of the HTML
             *
             * @type ValueList
             */
            resultList: new this.Input.ValueList('#editrun_result')
        };

        /**
         * Object containing the line numbers for all quantity definitions in the script list.
         * Keyed by quantity name, values are the line numbers.
         *
         * @type {Object}
         */
        this.lineNumber = {};

        /**
         * Dictionary holding the last obtained results of the output quantities.
         * Used for caching and preventing continous updating of the results div.
         * Keyed by quantity name, values are the most recent quantity values.
         *
         * @type {Object}
         */
        this.lastResults = {};

        /**
         * Whether to enable fast mode for the user inputs. Fast mode means only update
         * values of the sliders in the UI at the end of a slider drag event, disabled
         * means update continuously. Disabling this causes a significant performance slowdown
         * when interacting with sliders and plotting something.
         *
         * @type {Boolean}
         */
        this.fastmode = true;

        /**
         * The debugconsole of this tab. This is a ReactJS component
         *
         * @type {DebugConsole}
         */
        this.debugconsole = null;
        this.showdebug = true;

        this.setupCM();

        this.registerCallbacks();
    }

    /**
     * Sets up all callbacks for events within this tab.
     */
    EditRun.prototype.registerCallbacks = function() {
        // Enable the use of the enter key in the quantity input field
        $('#editrun_scriptline').keypress(
            function(e) {
                if (e.which === 13) {
                    $('#editrun_enterline').click();
                }
            }
        );

        // Make renderspeed div a slider and register callbacks
        $('#editrun_renderspeed').slider({
            range: "min",
            value: 19,
            min: 4,
            max: 20,
            step: 1,
            slide: (function(event, ui) {
                controller.setRenderSpeed(24-ui.value)
            }).bind(this),
            stop: (function(event, ui) {
                controller.setRenderSpeed(24-ui.value)
            }).bind(this)
        });

        // Called when the script has been modified
        $(document).on("onModifiedQuantity", function(event, quantities) {
            view.tabs.editrun.onModifiedQuantity(quantities);
        });

        // Called when a new script has been compiled
        $(document).on("onNewScript", function(event, quantities) {
            view.tabs.editrun.onNewScript(quantities);
        });

        // Called when the controller has issued a new iteration of the script
        $(document).on("onNextStep", function(event, quantities) {
            view.tabs.editrun.onNextStep(quantities);
        });
    };

    /**
     * Event that gets called when this tab gets opened.
     */
    EditRun.prototype.onEnterTab = function(newState) {
        if (this.debugconsole === null) {
            this.debugconsole = React.render(<DebugConsole controller={controller} prefix="editrun" />, document.getElementById('debugconsole_container'));
        }

        if (!this.errorMarker) {
            this.clearErrors();
        }

        // if a demo script should be loaded, load it
        if (newState.script) {
            controller.loadDemoScript(newState.script);
        } else if (newState.userscript) {
            controller.loadUserScript(newState.userscript);
        } else {
            // A new script may have been compiled/loaded, so synchronize
            // list of quantities
            view.hasPlot = true;
            var script = controller.getScript();
            this.synchronizeScriptList(script.getQuantities());

            // Display results if script is compiled
            if (script.isCompiled()) {
                try {
                    var outputQuantities = script.getOutputQuantities();
                    this.synchronizeResults();
                } catch (e) {
                    view.runtimeError(e);
                }
            }

            // If autoexecute is true, resume script only when it has been paused
            // by the system, and start executing when it is not paused but compiled
            if (controller.autoExecute) {
                if (controller.isPaused()) {
                    controller.resume(true);
                } else {
                    controller.run();
                }
            }

            // Restore render speed setting
            $('#editrun_renderspeed').val(controller.renderspeed);
        }
    };

    /**
     * Event that gets called when this tab gets closed.
     */
    EditRun.prototype.onLeaveTab = function() {
        if (!this.errorMarker) {
            this.clearErrors();
        }

        // Pause script when leaving edit/run tab, indicating it has
        // been paused automatically by the system and not by the user
        controller.pause(true);
    };

    /**
     * Called when the script is modified.
     *
     * @param  {Object} quantities All quantities in the current script
     */
    EditRun.prototype.onModifiedQuantity = function(quantities) {
        this.synchronizeScriptList(quantities);
    };

    /**
     * Called when the controller has issued a new iteration of the script.
     *
     * @param  {Object} quantities All output quantities in the current script
     */
    EditRun.prototype.onNextStep = function(quantities) {
        this.synchronizeResults(quantities);
    };

    /**
     * Called when the controller has compiled a new script.
     *
     * @param  {Object} quantities All quantities in the new (current) script
     */
    EditRun.prototype.onNewScript = function(quantities) {
        // Remove all old syntax error messages from log
        if (this.debugconsole) {
            this.debugconsole.filterMessages(function(m, i) {
                return (["ERROR_SYNTAX"].indexOf(m.type) === -1);
            });
        }

        this.resetEditRun();
        this.synchronizeScriptList(quantities);
    };

    EditRun.prototype.toggleDebugConsole = function() {
        $("#debugconsole_container").toggle();

        if (this.showdebug === true) {
            $("#er_debugtoggle").text("Show");
        } else {
            $("#er_debugtoggle").text("Hide");
        }

        this.showdebug = !this.showdebug;
    };

    /**
     * Constructs an advanced (CodeMirror) editor and replaces the standard textarea with it.
     */
    EditRun.prototype.setupCM = function() {
        // Construct editor
        this.editor = this.cm.fromTextArea(document.getElementById('editrun_scriptline'), {
            mode: 'ACCEL',
            theme: 'default',
            autofocus: true,
            matchBrackets: true,
            lineNumbers: false,
            lineWrapping: false,
            undoDepth: 50,             // Try to save some memory
            viewportMargin: Infinity    // Always render entire document, so that text search and e.g. added event handlers work correctly
            //gutters: []
        });

        /**--- Register events ---*/
        // When a piece of text is 'dropped' into the editor, clear the current contents
        // first
        this.editor.on("drop", function(instance, e) {
            // Do not prevent the default and just clear the contents of the editor.
            // Let the event propagate further and let CodeMirror handle the rest
            this.editor.setValue('');
        });

        // Add event handlers to all built-in functions for showing help
        this.editor.on("changes", this.setupFunctionClickEvents);

        // Disallow adding more lines than one
        // now disallow adding newlines in the following simple way
        this.editor.on("beforeChange", function(instance, change) {
            var newtext = change.text.join("").replace(/\n/g, ""); // remove ALL \n !
            change.update(change.from, change.to, [newtext]);
            return true;
        });

        // Submit quantity when user presses enter while the editor has focus
        this.editor.on("keyHandled", (function(instance, key) {
            if (key == "Enter") {
                this.submitQuantity();
            }
        }).bind(this));

        setTimeout((function() {
            this.cm.signal(this.editor, "changes");
        }).bind(this), 100);

        this.editor.setSize(600, this.editor.defaultTextHeight() + 8);
        this.editor.refresh();
    };

    /**
     * Registers event handlers for all built-in function names
     * currently present in the contents of the editor.
     */
    EditRun.prototype.setupFunctionClickEvents = function(instance, changes) {
        // Start looking in the dom tree only from the CodeMirror div down
        $(".cm-builtin").on("dblclick", function(e) {
            e.preventDefault();

            view.setState({'tab': 'help', 'help': e.target.innerHTML});
            e.stopPropagation();
            e.cancelBubble = true;
        });
    };

    /**
     * Takes the current value from the CodeMirror input line,
     * checks the syntax and if valid submits it to the controller.
     *
     * @return {Boolean} Whether the quantity was submitted
     */
    EditRun.prototype.submitQuantity = function() {
        // Remove all old syntax error messages from log
        if (this.debugconsole) {
            this.debugconsole.filterMessages(function(m, i) {
                return (["ERROR_SYNTAX"].indexOf(m.type) === -1);
            });
        }

        this.editor.save();
        var qty = $("#editrun_scriptline").val();

        if (this.check(qty)) {
            this.editor.setValue('');
            this.addQuantity(qty);
        } else {
            this.addQuantity(qty);
        }
    };

    /**
     * Checks the given quantity definition for syntax errors, and handles
     * displaying of any errors that might be present.
     *
     * @param {String} qty The quantity definition to check for errors
     * @return {Boolean} Whether the given line is error-free
     */
    EditRun.prototype.check = function(qty) {
        // Clear any existing line widget and remove
        // error styling
        this.clearErrors();

        try {
            controller.checkSyntax(qty);
            return true;
        } catch (e) {
            this.setError(e);
            return false;
        }
    };

    /**
     * Clears any displayed errors in the editor
     */
    EditRun.prototype.clearErrors = function() {
        // Clear error messages that might be currently visible
        $('.tooltipcontainer > .errormessage').filter(":visible").trigger('click');

        this.editor.removeLineClass(0, "background", "editor_line_syntaxerror");
        this.editor.removeLineClass(0, "text", "editor_text_syntaxerror");

        if (this.errorMarker) {
            this.errorMarker.clear();
            this.errorMarker = null;
        }

        $("#editrun_inputcontainer > .CodeMirror").css({"background-color": "white"});
        this.editor.focus();
    };

    /**
     * Sets the given error for the given line.
     *
     * @param {CodeMirror.LineHandle} lineHandle The line on which to set the error
     * @param {SyntaxError} error The error to display
     */
    EditRun.prototype.setError = function(error) {
        this.editor.addLineClass(0, "background", "editor_line_syntaxerror");
        this.editor.addLineClass(0, "text", "editor_text_syntaxerror");
        this.errorMarker = this.editor.markText({'line': 0, 'ch': error.endPos}, {'line': 0, 'ch': error.endPos+1}, {'className': 'editor_error_token'});

        $("#editrun_inputcontainer > .CodeMirror").css({"background-color": "rgb(255, 163, 163);"});
    };

    /**
     * Deletes a quantity from the script.
     *
     * @param {String} The quantity to delete.
     */
    EditRun.prototype.deleteQuantity = function(quantity) {
        controller.deleteQuantity(quantity);
    };

    /**
     * Adds a quantity to the script.
     *
     * @param {String} The quantity to add.
     */
    EditRun.prototype.addQuantity = function(string) {
        string = string.trim();
        if (string === '') {
            return;
        }

        setTimeout(
            (function() {
                // Clear error messages that might be currently visible
                $('.tooltipcontainer > .errormessage').filter(":visible").trigger('click');

                try {
                    controller.addQuantity(string);
                } catch (error) {
                    console.log(error);
                    view.handleError(error);
                }
            }).bind(this),
            10
        );
    };

    /**
     * Toggles the execution of the script.
     *
     * @param {String} 'Run' if the script should be ran, otherwise it will be paused.
     */
    EditRun.prototype.toggleExecution = function(action) {
        if ($('#editrun_runscript').hasClass('disabled')) {
            alert("The script is not complete yet. Please define all quantities in the to-do list.");
        } else {
            if (action === 'Run') {
                controller.run();
                $('#editrun_runscript').val('Pause');
            } else {
                controller.pause();
                $('#editrun_runscript').val('Run');
            }
        }
    };

    /**
     * Creates a new script if confirmed.
     */
    EditRun.prototype.newScript = function() {
        if (confirm("Are you sure you want to stop your current script and delete all existing script lines? It can not be undone.")) {
            controller.newScript();
        }
    };

    /**
     * Sets the amount of iterations the script should be ran.
     *
     * @param {Number} The amount of iterations the script will be ran.
     */
    EditRun.prototype.setIterations = function(iterations) {
        controller.setIterations(iterations);
        // controller.stop();
        // controller.run();
    };

    /**
     * Synchronize the content of the #scriptlist div with the model
     *
     * @memberof View
     * @param  {Object} quantities All quantities registered in the model
     */
    EditRun.prototype.synchronizeScriptList = function(quantities) {
        this.lastResults = {};
        var enableRun = true;
        var script = controller.getScript();
        var exe = script.exe;

        this.scriptListBuffer.empty();
        this.lineNumber = {};
        this.report.todoListBuffer.empty();
        this.resetInputs();

        var i = 0;
        for (var q in quantities) {
            var quantity = quantities[q];

            //TODOs
            if (quantity.todo) {
                this.report.addTodo(quantity.name);
                enableRun = false;
            } else {
                i++;
                this.lineNumber[quantity.name] = i;
                this.addScriptlistLine(i, quantity.name, quantity.LHS, quantity.definition, quantity.category);
            }

            //User Input
            if (quantity.category == 1) {
                switch (quantity.input.type) {
                    case 'slider':
                        if (script.isCompiled()) {
                            this.addInput(new this.Input.Slider(i, quantity.name, quantity.name, exe.getValue(quantity.name), parseFloat(quantity.input.parameters[1]), parseFloat(quantity.input.parameters[2]), quantity.input.round));
                        } else {
                            this.addInput(new this.Input.Slider(i, quantity.name, quantity.name, parseFloat(quantity.input.parameters[0]), parseFloat(quantity.input.parameters[1]), parseFloat(quantity.input.parameters[2]), quantity.input.round));
                        }

                        break;
                    case 'check':
                        if (script.isCompiled()) {
                            this.addInput(new this.Input.CheckBox(i, quantity.name, quantity.name, exe.getValue(quantity.name)));
                        } else {
                            this.addInput(new this.Input.CheckBox(i, quantity.name, quantity.name, quantity.input.parameters[0]));
                        }

                        break;
                    case 'button':
                        if (script.isCompiled()) {
                            this.addInput(new this.Input.Button(i, quantity.name, 'Click me', exe.getValue(quantity.name)));
                        } else {
                            this.addInput(new this.Input.Button(i, quantity.name, 'Click me', quantity.input.parameters[0]));
                        }

                        break;
                    case 'text':
                        if (script.isCompiled()) {
                            this.addInput(new this.Input.TextBox(i, quantity.name, quantity.name, exe.getValue(quantity.name)));
                        } else {
                            this.addInput(new this.Input.TextBox(i, quantity.name, quantity.name, quantity.input.parameters[0]));
                        }
                        break;
                    default:
                        //Unknown input type
                        console.log('Unknown input type');
                        break;
                }
            }
        }

        this.scriptListBuffer.flip();
        this.report.todoListBuffer.flip();
        this.initInputs();

        // Disable run button when script is incomplete, else enable (again)
        if (enableRun === false || quantities === null || Object.keys(quantities).length == 0) {
            this.synchronizeResults(null);
            if (!$('#editrun_runscript').hasClass('disabled')) {
                $('#editrun_runscript').addClass('disabled');
            }
            if (!$('#editrun_reset').hasClass('disabled')) {
                $('#editrun_reset').addClass('disabled');
            }
        } else {
            if ($('#editrun_runscript').hasClass('disabled')) {
                $('#editrun_runscript').removeClass('disabled');
            }
            if ($('#editrun_reset').hasClass('disabled')) {
                $('#editrun_reset').removeClass('disabled');
            }
        }
    };

    /**
     * Synchronize the content of the #result div with the model
     *
     * @memberof View
     * @param  {Object} quantities All category 2 quantities registered in the model
     */
    EditRun.prototype.synchronizeResults = function(quantities) {
        var needsUpdate = (quantities == null);

        // Remove deleted quantities
        for (var q in this.lastResults) {
            var quantity = quantities[q];
            if (!quantities.hasOwnProperty(q)) {
                delete this.lastResults[quantity.name];
                console.log("Deleted " + q);
                needsUpdate = true;
            }
        }

        var numResults = 0;
        for (var q in quantities) {
            var quantity = quantities[q];
            var val = objectToString(controller.getQuantityValue(quantity.name), this.maxPrintElements);

            if (!this.lastResults.hasOwnProperty(quantity.name)) {
                needsUpdate = true;
                this.lastResults[quantity.name] = val;
            } else if (this.lastResults[quantity.name] != val) {
                needsUpdate = true;
                this.lastResults[quantity.name] = val;
            }

            numResults++;
        }

        if (needsUpdate) {
            this.report.resultList.set(this.lastResults, numResults);
        }
    };

    /**
     * Selects indicated line and puts it's contents in the #scriptline element
     *
     * @memberof View
     * @param  {Number} line  Identifier of the to be selected line
     * @param  {String} value To be put in the #scriptline element
     */
    EditRun.prototype.selectScriptline = function(linenr, quantityname) {
        this.report.argListBuffer.empty();
        this.report.argToListBuffer.empty();

        if ($('#line' + linenr).length > 0) {
            var quantity = controller.getQuantity(quantityname);

            this.editor.setValue(quantity.source);

            $('.quantityname').text(quantityname);

            //list parameters (type = dummy)
            for (var p in quantity.parameters) {
                this.report.addArg(quantity.parameters[p], 'dummy');
            }

            //list dependencies (type = regular)
            for (var d in quantity.dependencies) {
                this.report.addArg(quantity.dependencies[d], 'regular');
            }

            //list used standard functions (type = standard function)
            for (var s in quantity.stdfuncs) {
                this.report.addArg(quantity.stdfuncs[s], 'std func.');
            }

            //list reverse dependencies (type = regular)
            for (var r in quantity.reverseDeps) {
                this.report.addArgto(quantity.reverseDeps[r], 'regular');
            }
        }

        this.report.argListBuffer.flip();
        this.report.argToListBuffer.flip();
    };

    /**
     * Deselects the previously selected line and hides the argument lists
     * @memberof View
     */
    EditRun.prototype.deselectScriptline = function() {
        this.selectScriptline(null, null);
        $('#editrun_scriptline').text('');
    };

    /**
     * Resets the edit/run tab to it's initial state
     * @memberof View
     */
    EditRun.prototype.resetEditRun = function() {
        this.synchronizeScriptList(null);
        this.synchronizeResults(null);
        this.selectScriptline(null, null);
        this.editor.setValue('');
        this.clearErrors();
    };

    EditRun.prototype.setExecuting = function(executing) {
        if (executing) {
            $('#editrun_runscript').val('Pause');
        } else {
            $('#editrun_runscript').val('Run');
        }
    };

    /**
     * Generates HTML for a line of ACCEL code to be added to the listing in the #scriptlist element
     *
     * @memberof View
     * @param {Number} line     Line number to identify this line of code
     * @param {String} left     Left-hand of the equation
     * @param {String} right    Right-hand side of the equation
     * @param {Number} category Category to which the left-hand side belongs
     */
    EditRun.prototype.getScriptlistLineHTML = function(linenr, quantity, left, right, category) {
        return '' +
            '<input type="radio" name="script" id="line' + linenr + '" value="' + left + ' = ' + right + '">' +
            '<label for="line' + linenr + '" onclick = "view.tabs.editrun.selectScriptline(' + linenr + ', \'' + quantity + '\');">' +
                '<div class="inline ellipsis qtyname" style="max-width: 110px;">' + left + '</div>' +
                '<div class="inline operator">=</div>' +
                '<div class="inline ellipsis" style="max-width: 240px;">' + right + '</div>' +
                '<div class="inline comment">(cat.=' + category + ')</div>' +
                '<a onclick="view.tabs.editrun.deleteQuantity(\'' + quantity + '\')" class="inline lineoption">delete</a>' +
            '</label>';
    };

    /**
     * Adds HTML for a line of ACCEL code to the buffer
     *
     * @memberof View
     * @param {Number} line     Line number to identify this line of code
     * @param {String} left     Left-hand of the equation
     * @param {String} right    Right-hand side of the equation
     * @param {Number} category Category to which the left-hand side belongs
     */
    EditRun.prototype.addScriptlistLine = function(linenr, quantity, left, right, category) {
        //Secure right hand from input
        right = view.encodeHTML(right);

        this.scriptListBuffer.append(this.getScriptlistLineHTML(linenr, quantity, left, right, category));
    };


    EditRun.prototype.setPendingScriptLine = function(line) {
        var pendingline = $('#editrun_pendingscriptline');

        if (line === null) {
            pendingline.animate({height: 0, opacity: 0}, 400,
                function() {
                    pendingline.toggle(false);
                    $('#editrun_pendingloader').toggle(false);
                }
            );
        } else {
            $('#editrun_pendingscriptline > div').first().html(line);
            pendingline.toggle(true);
            $('#editrun_pendingloader').toggle(true);
            pendingline.css({height: '20px', opacity: 1});
        }
    };

    /**
     * Removes the existing input elements and empties the associated buffer
     * @memberof View
     */
    EditRun.prototype.resetInputs = function() {
        this.userInputBuffer.empty();
        var fastmodeHTML = (this.fastmode) ? " checked='checked'" : "";
        this.userInputBuffer.append("<div id='editrun_inputheader'><input type='checkbox' id='editrun_input_fasttoggle'" + fastmodeHTML + " onclick='view.tabs.editrun.setFastmode()' /><span style='vertical-align: middle;'>Fast mode</span></div>");
        this.inputs = [];
    };

    EditRun.prototype.setFastmode = function() {
        this.fastmode = $('#editrun_input_fasttoggle').is(':checked');
        view.tabs.simulation.fastmode = $('#editrun_input_fasttoggle').is(':checked');
    };

    /**
     * Adds a dynamic input element to the #userinput element
     *
     * @memberof View
     * @param {Object} elements    Object with functions to generate the corresponding HTML to be put in #userinput
     */
    EditRun.prototype.addInput = function(element) {
        this.userInputBuffer.append(element.getHTML());
        this.inputs.push(element);
    };

    /**
     * Initializes the added input elements
     * @memberof View
     */
    EditRun.prototype.initInputs = function() {
        this.userInputBuffer.flip();

        for (var i = 0; i < this.inputs.length; i++) {
            this.inputs[i].initialize();
        }
    };

    /**
     * Clears the plot canvas
     */
    EditRun.prototype.clearCanvas = function() {
        this.canvas.clearCanvas();
    };

    /**
     * Updates the plot canvas
     */
    EditRun.prototype.drawPlot = function() {
        this.canvas.draw();
    };


    return EditRun;
});
