function and(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return zip([x, y], function(a, b) {
        var std_and = exe.lib.std.and;
        var error = UnitObject.prototype.propagateError(std_and, a, b);
        if (error) {
            return error;
        }

        if (!a.isNormal() || !b.isNormal()) {
            return new UnitObject(std_and(a.value, b.value), {}, "unitError",
                "Both arguments of the \"and\" function must be unit-less. Current units are <" + a.toString() + "> and <" + b.toString() + ">.");
        } else {
            return new UnitObject(std_and(a.value, b.value), {}, null);
        }
    });
}

and.base = new UnitObject(true);
