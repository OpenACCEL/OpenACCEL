function or(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return zip([x, y], function(a, b) {
        var std_or = exe.lib.std.or;
        var error = UnitObject.prototype.propagateError(std_or, a, b);
        if (error) {
            return error;
        }

        var ans;
        if (!a.isNormal() || !b.isNormal()) {
            return new UnitObject(std_or(a.value, b.value), {}, "unitError",
                "Both arguments of the \"or\" function must be unit-less. Current units are <" + a.toString() + "> and <" + b.toString() + ">.");
        } else {
            return a.clone(std_or(a.value, b.value));
        }
    });
}

or.base = new UnitObject(false);
