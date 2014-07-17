

//------------------------------------------------------------------------------

function editScript(script) {
	try {
		controller.setScriptFromSource(script);
	} catch (e) {
		if (typeof(e) === 'SyntaxError') {
			console.log(e.message);
		} else {
			console.log(e);
		}
	}
}

var showValues = false;

function toggleValues() {
	showValues = !showValues;
	if (showValues) {
		$('#showvalues').val('Hide values');
	} else {
		$('#showvalues').val('Show values');
	}
}

/**
 * Performs a one-time check of the units of the quantities in the script
 * and displays them after the quantities
 */
function checkUnits() {
	try {
		var source = $('#scriptarea').val();
		controller.checkUnits(source);
		synchronizeScriptArea(true);
	} catch (e) {
		alert(e.message);
	}
}

//------------------------------------------------------------------------------

/**
 * Retrieves the current script source from the controller and displays it in the edit area
 * @param  {Boolean} includeUnits Whether to also display checked units
 */
function synchronizeScriptArea(includeCheckedUnits) {
	// Make parameter optional
	if (typeof includeCheckedUnits === 'undefined') {
		includeCheckedUnits = false;
	}

	var script = controller.scriptToString(true, true, includeCheckedUnits);
	$('#scriptarea').val(script);
}
