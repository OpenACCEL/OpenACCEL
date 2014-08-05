function cos(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return unaryZip(x, function(a) {
        var std_cos = exe.lib.std.cos;
        var error = UnitObject.prototype.propagateError(std_cos, a);
        if (error) {
            return error;
        }

        if (a.hasUnit()) {
            return new UnitObject(std_cos(a.value), {}, "unitError",
                "Argument of the \"cos\" function must be unit-less. Current unit is <" + a.toString() + ">.");
        } else {
            var ans = a.clone()
            ans.value = std_cos(a.value);
            return ans;
        }
    });
}
