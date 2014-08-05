function exp(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return unaryZip(x, function(a) {
        var std_exp = exe.lib.std.exp;
        var error = UnitObject.prototype.propagateError(std_exp, a);
        if (error) {
            return error;
        }

        if (a.hasUnit()) {
            return new UnitObject(std_exp(a.value), {}, "unitError",
                "Argument of the \"exp\" function must be unit-less. Current unit is <" + a.toString() + ">.");
        } else {
            var ans = a.clone()
            ans.value = std_exp(a.value);
            return ans;
        }
    });
}
