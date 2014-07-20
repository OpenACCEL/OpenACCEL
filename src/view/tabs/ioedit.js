

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
	$('#checkUnitsMsg').css({'color':'white', 'visibility':'visible', 'display':'block'});
	$('#checkUnitsMsg').text('Checking units...');
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
