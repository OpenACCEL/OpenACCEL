function asin(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return unaryZip(x, function(a) {
        var std_asin = exe.lib.std.asin;
        var error = UnitObject.prototype.propagateError(std_asin, a);
        if (error) {
            return error;
        }

        if (a.hasUnit()) {
            return new UnitObject(std_asin(a.value), {}, "unitError",
                "Argument of the \"asin\" function must be unit-less. Current unit is <" + a.toString() + ">.");
        } else {
            var ans = a.clone()
            ans.value = std_asin(a.value);
            return ans;
        }
    });
}
