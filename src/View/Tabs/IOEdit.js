require.config({
    baseUrl: "scripts"
});

define(["cm/lib/codemirror", "cm/addon/edit/matchbrackets", "cm/mode/ACCEL/ACCEL"], /**@lends View*/ function(CodeMirror) {
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

        // Setup CodeMirror instance and also setup advanced editor in IO/edit tab
        // when preference in localStorage is set as such
        this.cm = CodeMirror;
        if (localStorage.useAdvancedEditor === 'true') {
            $('#ioedit_useCM').prop("checked", true);
            this.toggleCM(true);
        }

        this.registerCallbacks();
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
    IOEdit.prototype.onEnterTab = function() {
        view.hasPlot = false;
        this.synchronizeScriptArea();

        setTimeout((function() {
            this.updateAdvancedEditor();
            this.focusAdvancedEditor();
        }).bind(this), 100);
    };

    /**
     * Event that gets called when this tab gets closed.
     */
    IOEdit.prototype.onLeaveTab = function() {
        // Build script from inputted source when leaving IO/edit
        try {
            if (this.editor) {
                this.editor.save();
            }
            controller.setScriptFromSource($('#ioedit_scriptarea').val());
            this.showValues = false;
            $('#ioedit_showvalues').val('Show values');
        } catch (e) {
            if (typeof(e) === 'SyntaxError') {
                alert(e.message);
                console.log(e.message);
            } else {
                console.log(e);
            }
        }
    };

    /**
     * Called when the script is modified.
     *
     * @param  {Object} quantities All quantities in the current script
     */
    IOEdit.prototype.onModifiedQuantity = function(quantities) {
        this.synchronizeScriptArea();
    };

    /**
     * Called when the controller has compiled a new script.
     *
     * @param  {Object} quantities All quantities in the current script
     */
    IOEdit.prototype.onNewScript = function(quantities) {
        this.synchronizeScriptArea();
    };

    /**
     * Toggles between showing and not showing the values of quantities inside
     * the editor.
     */
    IOEdit.prototype.toggleValues = function() {
        this.showValues = !this.showValues;

        // First save the current contents of the textarea to the script,
        // so that any changes that might have been made won't be lost
        if (this.usingAdvancedEditor()) {
            this.editor.save();
        }

        var source = $('#ioedit_scriptarea').val();
        controller.setScriptFromSource(source);

        if (this.showValues) {
            try {
                this.synchronizeScriptArea({'includeValues': true});
                $('#ioedit_showvalues').val('Hide values');
            } catch (e) {
                // Catch any syntax error messages, or messages thrown when the script
                // cannot be compiled because it's not complete yet
                alert(e.message);
            }
        } else {
            this.synchronizeScriptArea({'includeValues': false});
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
     * Toggles between the advanced and basic editor, based on the
     * value of the corresponding checkbox in the UI.
     *
     * @param {Boolean} onload Whether this function is called on tab load.
     */
    IOEdit.prototype.toggleCM = function(onload) {
        var use;
        if (this.usingAdvancedEditor()) {
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
    IOEdit.prototype.usingAdvancedEditor = function() {
        return $('#ioedit_useCM').is(':checked');
    };

    /**
     * Causes the advanced editor, when in use, to update it's contents
     * based on the contents of the underlying textarea.
     */
    IOEdit.prototype.updateAdvancedEditor = function() {
        if (this.usingAdvancedEditor()) {
            this.editor.setValue($('#ioedit_scriptarea').val());
            //this.editor.setSize(645, 400);
            this.editor.refresh();
            this.cm.signal(this.editor, "changes");
        }
    };

    /**
     * Gives focus to the advanced editor when in use, causing it to redraw.
     */
    IOEdit.prototype.focusAdvancedEditor = function() {
        if (this.usingAdvancedEditor()) {
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
        if (this.usingAdvancedEditor()) {
            this.editor.save();
        }

        setTimeout((function() {
            try {
                var source = $('#ioedit_scriptarea').val();
                controller.checkUnits(source);
                $('#ioedit_checkUnitsMsg').css({'color':'rgb(31,212,60)'});
                $('#ioedit_checkUnitsMsg').text('Units OK');
            } catch (e) {
                // If the script wasn't simply incomplete but actual unit errors occured...
                if (!e.incomplete) {
                    $('#ioedit_checkUnitsMsg').css({'color':'red'});
                    $('#ioedit_checkUnitsMsg').text('Unit error(s)!');
                    $('#ioedit_clearerrors').css({'visibility':'visible'});
                } else {
                    // Script incomplete, hide progress message but don't indicate unit errors
                    $('#ioedit_checkUnitsMsg').hide();
                }
                alert(e.message);
            } finally {
                this.synchronizeScriptArea({'includeCheckedUnits':true});
                setTimeout(function() {$('#ioedit_checkUnitsMsg').fadeOut(400);}, 2500);
            }
        }).bind(this), 100);
    };

    /**
     * Hides all unit errors in the script, if any.
     */
    IOEdit.prototype.clearUnitErrors = function() {
        // First save the current contents so any changes won't be lost
        if (this.usingAdvancedEditor()) {
            this.editor.save();
        }
        var source = $('#ioedit_scriptarea').val();
        controller.setScriptFromSource(source);

        this.synchronizeScriptArea({'includeCheckedUnits':false});
        $('#ioedit_clearerrors').css({'visibility':'hidden'});
    };

    /**
     * Retrieves the current script source from the controller and displays it in the edit area
     * @param  {Boolean} includeUnits Whether to also display checked units
     */
    IOEdit.prototype.synchronizeScriptArea = function(options) {
        if (typeof options === 'undefined') {
            options = {};
        }

        // Set options
        options.includeComments = true;
        options.includeUnits = true;

        // Retrieve current contents of the script and update the textarea
        var script = controller.scriptToString(options);
        $('#ioedit_scriptarea').val(script);

        // Let the advanced editor update itself too, if in use
        this.updateAdvancedEditor();
    };

    return IOEdit;
});
