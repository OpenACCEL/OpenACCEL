function greaterThan(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return zip([x, y], function(a, b) {
        var std_gt = exe.lib.std.greaterThan;
        var error = UnitObject.prototype.propagateError(std_gt, a, b);
        if (error) {
            return error;
        }

        if(!a.equals(b)) {
            return new UnitObject(std_gt(a.value, b.value), {}, "unitError",
                "Both arguments of > must be the same. Current units are <" + a.toString() + "> and <" + b.toString() + ">.");
        } else {
            return new UnitObject(std_gt(a.value, b.value));
        }
    });
}
