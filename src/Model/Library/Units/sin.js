function sin(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return unaryZip(x, function(a) {
        var std_sin = exe.lib.std.sin;
        var error = UnitObject.prototype.propagateError(std_sin, a);
        if (error) {
            return error;
        }

        if (a.hasUnit()) {
            return new UnitObject(std_sin(a.value), {}, "unitError",
                "The argument of the \"sin\" function must be unit-less. Current unit is: <" + a.toString() + ">.");
        } else {
            return a.clone(std_sin(a.value));
        }
    });
}
