function bin(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    
    return zip([x, y], function(a, b) {
        if (!(a instanceof UnitObject)) {
            a = new UnitObject(a);
        }

        if (!(b instanceof UnitObject)) {
            b = new UnitObject(b);
        }

        var std_bin = exe.lib.std.bin;
        var error = a.propagateError(std_bin, b);
        if (error) {
            return error;
        }

        if (a.hasUnit() || b.hasUnit()) {
            return new UnitObject(std_bin(a.value, b.value), {}, "Bin argument should be dimensionless.");
        } else {
            var ans = a.clone()
            ans.value = std_bin(a.value, b.value);
            return ans;
        }
    });
}