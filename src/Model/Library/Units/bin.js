function bin(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    
    return zip([x, y], function(a, b) {
        var std_bin = exe.lib.std.bin;
        var error = UnitObject.prototype.propagateError(std_bin, a, b);
        if (error) {
            return error;
        }

        if (a.hasUnit() || b.hasUnit()) {
            return new UnitObject(std_bin(a.value, b.value), {}, "unitError",
                "Both arguments of the \"bin\" function must be unit-less. Current units are <" + a.toString() + "> and <" + b.toString() + ">.");
        } else {
            return a.clone(std_bin(a.value, b.value));
        }
    });
}