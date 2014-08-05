function not(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return zip([x], function(a) {
        var std_not = exe.lib.std.not;
        var error = UnitObject.prototype.propagateError(std_not, x);
        if (error) {
            return error;
        }

        if(!a.isNormal()) {
            return new UnitObject(std_not(a.value), {}, "unitError",
                "The argument of the \"not\" function must be unit-less. Current unit is: <" + a.toString() + ">.");
        } else {
            return a.clone(std_not(a.value));
        }
    });
}
