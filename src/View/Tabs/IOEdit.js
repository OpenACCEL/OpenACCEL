/**
 * File containing the user interface code for the IO/edit tab
 */

/**
 * An instance of the advanced (CodeMirror) editor currently being used, if any.
 *
 * @type {CodeMirror}
 */
var editor = null;

/**
 * Whether to show the values of the quantities inside the editor.
 *
 * @type {Boolean}
 */
var showValues = false;


/**
 * Toggles between showing and not showing the values of quantities inside
 * the editor.
 */
function toggleValues() {
	showValues = !showValues;

	// First save the current contents of the textarea to the script,
	// so that any changes that might have been made won't be lost
	if (usingAdvancedEditor()) {
		editor.save();
	}
	var source = $('#scriptarea').val();
	controller.setScriptFromSource(source);

	if (showValues) {
		try {
			synchronizeScriptArea({'includeValues': true});
			$('#showvalues').val('Hide values');
		} catch (e) {
			// Catch any syntax error messages, or messages thrown when the script
			// cannot be compiled because it's not complete yet
			alert(e.message);
		}
	} else {
		synchronizeScriptArea({'includeValues': false});
		$('#showvalues').val('Show values');
	}
}

/**
 * Constructs an advanced (CodeMirror) editor and replaces the standard textarea with it.
 */
function constructAdvancedEditor() {
	// Construct editor
	var advEditor = cm.fromTextArea(document.getElementById('scriptarea'), {
		mode: 'ACCEL',
		theme: 'default',
		lineNumbers: true,
		lineWrapping: false,
		undoDepth: 100,				// Try to save some memory
		viewportMargin: Infinity	// Always render entire document, so that text search and e.g. added event handlers work correctly
		//gutters: []
	});

	/**--- Register events ---*/
	// When a piece of text is 'dropped' into the editor, clear the current contents
	// first
	advEditor.on("drop", function(instance, e) {
		// Do not prevent the default and just clear the contents of the editor.
		// Let the event propagate further and let CodeMirror handle the rest
		editor.setValue('');
	});

	// Add event handlers to all built-in functions for showing help
	advEditor.on("changes", setupFunctionClickEvents);

	setTimeout(function() { cm.signal(advEditor, "changes"); }, 100);

	return advEditor;
}

/**
 * Registers event handlers for all built-in function names
 * currently present in the contents of the editor.
 */
function setupFunctionClickEvents(instance, changes) {
	// Start looking in the dom tree only from the CodeMirror div down
	$(".cm-builtin","div.CodeMirror").on("click", function(e) {
		e.preventDefault();

		alert(e.target.innerHTML);
		e.stopPropagation();
		e.cancelBubble = true;
	});
}

/**
 * Toggles between the advanced and basic editor, based on the
 * value of the corresponding checkbox in the UI.
 */
function toggleCM() {
	var use;
	if (usingAdvancedEditor()) {
		// Construct CodeMirror editor from textarea
		editor = constructAdvancedEditor();
		editor.setSize(645, 400);
		editor.refresh();
		use = true;
	} else {
		// Revert back to standard textarea
		if (editor) {
			editor.save();
			editor.toTextArea();
			editor = null;
		}
		use = false;
	}

	// Save preference to localStorage
	localStorage.useAdvancedEditor = use;
}

/**
 * Returns whether the advanced editor is currently being used
 *
 * @return {Boolean} Whether the advanced editor is currently being used
 */
function usingAdvancedEditor() {
	return $('#useCM').is(':checked');
}

/**
 * Causes the advanced editor, when in use, to update it's contents
 * based on the contents of the underlying textarea.
 */
function updateAdvancedEditor() {
	if (usingAdvancedEditor()) {
		editor.setValue($('#scriptarea').val());
		editor.setSize(645, 400);
		editor.refresh();
		cm.signal(editor, "changes");
	}
}

/**
 * Gives focus to the advanced editor when in use, causing it to redraw.
 */
function focusAdvancedEditor() {
	if (usingAdvancedEditor()) {
		editor.focus();
	}
}

/**
 * Shows autocomplete suggestions inside the given editor instance
 *
 * @param {CodeMirror} editor The CodeMirror editor instance for which to return suggestions
 * @return {Object} (???)
 */
function autoComplete(editor, options) {
	// Return:
	// list: array of strings or objects containing the suggestions
	// from: {line, ch} object that denotes the start of the token being autocompleted
	// to: {line, ch} object that denotes the end of the token being autocompleted
}

/**
 * Performs a one-time check of the units of the quantities in the script
 * and displays them after the quantities inside the editor
 */
function checkUnits() {
	$('#checkUnitsMsg').css({'color':'white', 'visibility':'visible', 'display':'block'});
	$('#checkUnitsMsg').text('Checking units...');
	$('#showvalues').val('Show values');
	showValues = false;
	$('#clearerrors').css({'visibility':'hidden'});
	if (usingAdvancedEditor()) {
		editor.save();
	}

	setTimeout(function() {
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
		synchronizeScriptArea({'includeCheckedUnits':true});
		setTimeout(function() {$('#checkUnitsMsg').fadeOut(400);}, 2500);
	}}, 100);
}

/**
 * Hides all unit errors in the script, if any.
 */
function clearUnitErrors() {
	// First save the current contents so any changes won't be lost
	if (usingAdvancedEditor()) {
		editor.save();
	}
	var source = $('#scriptarea').val();
	controller.setScriptFromSource(source);

	synchronizeScriptArea({'includeCheckedUnits':false});
	$('#clearerrors').css({'visibility':'hidden'});
}

/**
 * Retrieves the current script source from the controller and displays it in the edit area
 * @param  {Boolean} includeUnits Whether to also display checked units
 */
function synchronizeScriptArea(options) {
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
	updateAdvancedEditor();
}
