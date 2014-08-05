function log(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return unaryZip(x, function(a) {
        var std_log = exe.lib.std.log;
        var error = UnitObject.prototype.propagateError(std_log, a);
        if (error) {
            return error;
        }

        if (a.hasUnit()) {
            return new UnitObject(std_log(a.value), {}, "unitError",
                "Argument of the \"log\" function must be unit-less. Current unit is <" + a.toString() + ">.");
        } else {
            return a.clone(std_log(a.value));
        }
    });
}

