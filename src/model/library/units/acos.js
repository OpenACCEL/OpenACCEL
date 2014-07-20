function acos(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return unaryZip(x, function(a) {
        if (!(a instanceof UnitObject)) {
            a = new UnitObject(a);
        }

        var std_acos = exe.lib.std.acos;
        var error = a.propagateError(std_acos);
        if (error) {
            return error;
        }

        if (a.hasUnit()) {
            return new UnitObject(std_acos(a.value), {}, "Acos should be unitless.");
        } else {
            var ans = a.clone()
            ans.value = std_acos(a.value);
            return ans;
        }
    });
}

