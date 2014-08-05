function atan(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return unaryZip(x, function(a) {
        var std_atan = exe.lib.std.atan;
        var error = UnitObject.prototype.propagateError(std_atan, a);
        if (error) {
            return error;
        }

        if (a.hasUnit()) {
            return new UnitObject(std_atan(a.value), {}, "unitError",
                "Argument of the \"atan\" function must be unit-less. Current unit is <" + a.toString() + ">.");
        } else {
            var ans = a.clone()
            ans.value = std_atan(a.value);
            return ans;
        }
    });
}
