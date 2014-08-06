function min(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    
    return zip([x, y], function(a, b) {
        var std_min = exe.lib.std.min;
        var error = UnitObject.prototype.propagateError(std_min, a, b);
        if (error) {
            return error;
        }

        if (!a.equals(b)) {
            return new UnitObject(std_min(a.value, b.value), {}, "unitError",
                "Both arguments of the \"min\" function must be the same. Current units are <" + a.toString() + "> and <" + b.toString() + ">.");
        } else {
            return a.clone(std_min(a.value, b.value));
        }
    });
}
