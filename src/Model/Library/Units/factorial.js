function factorial(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return unaryZip(x, function(a) {
        var std_factorial = exe.lib.std.factorial;
        var error = UnitObject.prototype.propagateError(std_factorial, a);
        if (error) {
            return error;
        }

        if (a.hasUnit()) {
            return new UnitObject(std_factorial(a.value), {}, "unitError",
                "Argument of the \"factorial\" function must be unit-less. Current unit is <" + a.toString() + ">.");
        } else {
            return a.clone(std_factorial(a.value));
        }
    });
}
