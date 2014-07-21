/**
 * Whether to show the values of quantities inside the editor.
 *
 * @type {Boolean}
 */
var showValues = false;

/**
 * An instance of the advanced (CodeMirror) editor currently being used, if any.
 *
 * @type {CodeMirror}
 */
var editor = null;


/**
 * Toggles between showing and not showing the values of quantities inside
 * the editor.
 */
function toggleValues() {
	showValues = !showValues;
	if (showValues) {
		$('#showvalues').val('Hide values');
	} else {
		$('#showvalues').val('Show values');
	}
}

/**
 * Constructs an advanced (CodeMirror) editor and replaces the standard textarea with it.
 */
function constructAdvancedEditor() {
	return cm.fromTextArea(document.getElementById('scriptarea'), {
		lineNumbers: true,
		mode: 'ACCEL',
		theme: 'default',
		lineWrapping: false,
		undoDepth: 100
		//gutters: []
	});
}

/**
 * Toggles between the advanced and basic editor, based on the
 * value of the corresponding checkbox in the UI.
 */
function toggleCM() {
	if (usingAdvancedEditor()) {
		// Construct CodeMirror editor from textarea
		editor = constructAdvancedEditor();
		editor.setSize(645, 400);
		editor.refresh();
	} else {
		// Revert back to standard textarea
		if (editor) {
			editor.save();
			editor.toTextArea();
			editor = null;
		}
	}
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
 * Performs a one-time check of the units of the quantities in the script
 * and displays them after the quantities inside the editor
 */
function checkUnits() {
	$('#checkUnitsMsg').css({'color':'white', 'visibility':'visible', 'display':'block'});
	$('#checkUnitsMsg').text('Checking units...');
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
		$('#checkUnitsMsg').css({'color':'red'});
		$('#checkUnitsMsg').text('Unit error(s)!');
		alert(e.message);
	} finally {
		synchronizeScriptArea(true);
		setTimeout(function() {$('#checkUnitsMsg').fadeOut(400)}, 2500);
	}}, 100);
}

/**
 * Retrieves the current script source from the controller and displays it in the edit area
 * @param  {Boolean} includeUnits Whether to also display checked units
 */
function synchronizeScriptArea(includeCheckedUnits) {
	// Make parameter optional
	if (typeof includeCheckedUnits === 'undefined') {
		includeCheckedUnits = false;
	}

	// Retrieve current contents of the script and update the textarea
	var script = controller.scriptToString(true, true, includeCheckedUnits);
	$('#scriptarea').val(script);

	// Let the advanced editor update itself too, if in use
	updateAdvancedEditor();
}
