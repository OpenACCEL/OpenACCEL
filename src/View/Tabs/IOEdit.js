require.config({
    baseUrl: "scripts"
});

define(["cm/lib/codemirror", "cm/mode/ACCEL/ACCEL"], /**@lends View*/ function(CodeMirror) {
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
         * Whether to show the values of the quantities inside the editor.
         *
         * @type {Boolean}
         */
        this.showValues = false;

        // Setup CodeMirror instance and also setup advanced editor in IO/edit tab
        // when preference in localStorage is set as such
        this.cm = CodeMirror;
        if (localStorage.useAdvancedEditor === 'true') {
            $('#useCM').prop("checked", true);
            this.toggleCM();
        }
    }

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
            controller.setScriptFromSource($('#scriptarea').val());
            this.showValues = false;
            $('#showvalues').val('Show values');
        } catch (e) {
            if (typeof(e) === 'SyntaxError') {
                console.log(e.message);
            } else {
                console.log(e);
            }
        }
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

        var source = $('#scriptarea').val();
        controller.setScriptFromSource(source);

        if (this.showValues) {
            try {
                this.synchronizeScriptArea({'includeValues': true});
                $('#showvalues').val('Hide values');
            } catch (e) {
                // Catch any syntax error messages, or messages thrown when the script
                // cannot be compiled because it's not complete yet
                alert(e.message);
            }
        } else {
            this.synchronizeScriptArea({'includeValues': false});
            $('#showvalues').val('Show values');
        }
    };

    /**
     * Constructs an advanced (CodeMirror) editor and replaces the standard textarea with it.
     */
    IOEdit.prototype.constructAdvancedEditor = function() {
        // Construct editor
        var advEditor = this.cm.fromTextArea(document.getElementById('scriptarea'), {
            mode: 'ACCEL',
            theme: 'default',
            lineNumbers: true,
            lineWrapping: false,
            undoDepth: 100,             // Try to save some memory
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

            view.setState({'help': e.target.innerHTML});
            e.stopPropagation();
            e.cancelBubble = true;
        });
    };

    /**
     * Toggles between the advanced and basic editor, based on the
     * value of the corresponding checkbox in the UI.
     */
    IOEdit.prototype.toggleCM = function() {
        var use;
        if (this.usingAdvancedEditor()) {
            // Construct CodeMirror editor from textarea
            this.editor = this.constructAdvancedEditor();
            this.editor.setSize(645, 400);
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
    };


    /**
     * Returns whether the advanced editor is currently being used
     *
     * @return {Boolean} Whether the advanced editor is currently being used
     */
    IOEdit.prototype.usingAdvancedEditor = function() {
        return $('#useCM').is(':checked');
    };

    /**
     * Causes the advanced editor, when in use, to update it's contents
     * based on the contents of the underlying textarea.
     */
    IOEdit.prototype.updateAdvancedEditor = function() {
        if (this.usingAdvancedEditor()) {
            this.editor.setValue($('#scriptarea').val());
            this.editor.setSize(645, 400);
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
        $('#checkUnitsMsg').css({'color':'white', 'visibility':'visible', 'display':'block'});
        $('#checkUnitsMsg').text('Checking units...');
        $('#showvalues').val('Show values');
        this.showValues = false;
        $('#clearerrors').css({'visibility':'hidden'});
        if (this.usingAdvancedEditor()) {
            this.editor.save();
        }

        setTimeout((function() {
            try {
                var source = $('#scriptarea').val();
                controller.checkUnits(source);
                $('#checkUnitsMsg').css({'color':'rgb(31,212,60)'});
                $('#checkUnitsMsg').text('Units OK');
            } catch (e) {
                // If the script wasn't simply incomplete but actual unit errors occured...
                if (!e.incomplete) {
                    $('#checkUnitsMsg').css({'color':'red'});
                    $('#checkUnitsMsg').text('Unit error(s)!');
                    $('#clearerrors').css({'visibility':'visible'});
                } else {
                    // Script incomplete, hide progress message but don't indicate unit errors
                    $('#checkUnitsMsg').hide();
                }
                alert(e.message);
            } finally {
                this.synchronizeScriptArea({'includeCheckedUnits':true});
                setTimeout(function() {$('#checkUnitsMsg').fadeOut(400);}, 2500);
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
        var source = $('#scriptarea').val();
        controller.setScriptFromSource(source);

        this.synchronizeScriptArea({'includeCheckedUnits':false});
        $('#clearerrors').css({'visibility':'hidden'});
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
        $('#scriptarea').val(script);

        // Let the advanced editor update itself too, if in use
        this.updateAdvancedEditor();
    };

    return IOEdit;
});
