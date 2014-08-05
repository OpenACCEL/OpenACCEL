function __if__(condition, ifTrue, ifFalse) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    var std_if = exe.lib.std.__if__;
    var error = UnitObject.prototype.propagateError(std_if, condition, ifTrue, ifFalse);
    if (error) {
        return error;
    }

    var ifResult;
    if(!condition.isNormal()) {
        return new UnitObject(std_if(condition.value, ifTrue.value, ifFalse.value), {}, "unitError",
            "First argument of \"if\" function must be unit-less. Current unit is: <" + condition.toString() + ">.");
    } else if ((ifResult = std_if(condition.value, ifTrue.value, ifFalse.value)) === ifTrue.value) {
        // Clone and return the right UnitObject, depending on the return value of the standard library __if__ function
        return ifTrue.clone(ifResult);
    } else {
        return ifFalse.clone(ifResult);
    }
}
