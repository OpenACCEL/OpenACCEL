function __if__(condition, ifTrue, ifFalse) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    // Convert to UnitObjects
    if (!(condition instanceof UnitObject)) {
        condition = new UnitObject(condition);
    }
    if (!(ifTrue instanceof UnitObject)) {
        ifTrue = new UnitObject(ifTrue);
    }

    if (!(ifFalse instanceof UnitObject)) {
        ifFalse = new UnitObject(ifFalse);
    }

    // Check for errors first
    var std_if = exe.lib.std.__if__;
    var error = UnitObject.prototype.propagateError(std_if, condition, ifTrue, ifFalse);
    if (error) {
        return error;
    }

    var ans;
    var ifResult;
    if(!condition.isNormal()) {
        ans = new UnitObject(std_if(condition.value, ifTrue.value, ifFalse.value), {}, "unitError");
        ans.errorString = "First argument to \"if\" function must be unit-less. Current unit is: <" + condition.toString() + ">.";
    } else if ((ifResult = std_if(condition.value, ifTrue.value, ifFalse.value)) === ifTrue.value) {
        // Clone and return the right UnitObject, depending on the return value of the standard library __if__ function
        ans = ifTrue.clone();
        ans.value = ifResult;
    } else {
        ans = ifFalse.clone();
        ans.value = ifResult;
    }

    return ans;
}
