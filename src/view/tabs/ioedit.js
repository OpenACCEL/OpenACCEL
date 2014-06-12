

//------------------------------------------------------------------------------

function editScript(script) {
	try {
		controller.setScriptFromSource(script);
	} catch (e) {
		console.log(e.message);
	}
}

var showValues = false;
var checkUnits = false;

function toggleValues() {
	showValues = !showValues;
	if (showValues) {
		$('#showvalues').val('Hide values');
	} else {
		$('#showvalues').val('Show values');
	}
}

function toggleUnitChecking() {
	checkUnits = !checkUnits;
	if (checkUnits) {
		$('#checkunits').val('Do not check units');
	} else {
		$('#checkunits').val('Check units');
	}
}

//------------------------------------------------------------------------------

function synchronizeScriptArea() {
	var script = controller.scriptToString(true, true);
	$('#scriptarea').val(script);
}
