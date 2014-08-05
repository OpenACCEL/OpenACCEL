function acos(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return unaryZip(x, function(a) {
        var std_acos = exe.lib.std.acos;
        var error = UnitObject.prototype.propagateError(std_acos, a);
        if (error) {
            return error;
        }

        if (a.hasUnit()) {
            return new UnitObject(std_acos(a.value), {}, "unitError",
                "Argument of the \"acos\" function must be unit-less. Current unit is <" + a.toString() + ">.");
        } else {
            var ans = a.clone()
            ans.value = std_acos(a.value);
            return ans;
        }
    });
}
