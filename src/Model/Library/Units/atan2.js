function atan2(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    
    return zip([x, y], function(a, b) {
        var std_atan2 = exe.lib.std.atan2;
        var error = UnitObject.prototype.propagateError(std_atan2, a, b);
        if (error) {
            return error;
        }

        if (!a.equals(b)) {
            return new UnitObject(std_atan2(a.value, b.value), {}, "unitError",
                "Both arguments of the \"atan2\" function must be unit-less. Current units are <" + a.toString() + "> and <" + b.toString() + ">.");
        } else {
            return a.clone(std_atan2(a.value, b.value));
        }
    });
}