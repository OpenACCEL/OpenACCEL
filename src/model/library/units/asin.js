function asin(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return unaryZip(x, function(a) {
        if (!(a instanceof UnitObject)) {
            a = new UnitObject(a);
        }

        var std_asin = exe.lib.std.asin;

        var error = a.propagateError(std_asin);
        if (error) {
            return error;
        }

        if (a.hasUnit()) {
            return new UnitObject(std_asin(a.value), {}, "Asin should be unitless.");
        } else {
            var ans = a.clone()
            ans.value = std_asin(a.value);
            return ans;
        }
    });
}

