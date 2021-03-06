function imply(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return zip([x, y], function(a, b) {
        var std_imply = exe.lib.std.imply;
        var error = UnitObject.prototype.propagateError(std_imply, a, b);
        if (error) {
            return error;
        }

        if (!a.isNormal() || !b.isNormal()) {
            return new UnitObject(std_imply(a.value, b.value), {}, "unitError",
                "Both arguments of the \"imply\" function must be unit-less. Current units are <" + a.toString() + "> and <" + b.toString() + ">.");
        } else {
            return new UnitObject(std_imply(a.value, b.value));
        }
    });
}
