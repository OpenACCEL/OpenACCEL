function __if__(condition, ifTrue, ifFalse) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    // Handle error(s) (propagation)
    var std_if = exe.lib.std.__if__;
    var error = UnitObject.prototype.propagateError(std_if, condition, ifTrue, ifFalse);
    if (error) {
        return error;
    }

    // Check for normality of condition and return error or computed result
    var cValues = UnitObject.prototype.toArray(condition);
    var ans;
    if(!UnitObject.prototype.isNormal(condition)) {
        var tValues = UnitObject.prototype.toArray(ifTrue);
        var fValues = UnitObject.prototype.toArray(ifFalse);
        ans = new UnitObject(std_if(cValues, tValues, fValues), {}, "unitError",
            "First argument of \"if\" function must be unit-less. Current unit is: <" + condition.toString() + ">.");
    } else {
        ans = std_if(cValues, ifTrue, ifFalse);
    }

    return ans;
}
