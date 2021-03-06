function tan(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return unaryZip(x, function(a) {
        var std_tan = exe.lib.std.tan;
        var error = UnitObject.prototype.propagateError(std_tan, a);
        if (error) {
            return error;
        }

        if (a.hasUnit()) {
            return new UnitObject(std_tan(a.value), {}, "unitError",
                "The argument of the \"tan\" function must be unit-less. Current unit is: <" + a.toString() + ">.");
        } else {
            return a.clone(std_tan(a.value));
        }
    });
}
