function min(x, y) {
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

        var std_min = exe.lib.std.min;
        var error = a.propagateError(std_min, b);
        if (error) {
            return error;
        }

        if (!a.equals(b)) {
            return new UnitObject(std_min(a.value, b.value), {}, "Min units should be equal.");
        } else {
            var ans = a.clone()
            ans.value = std_min(a.value, b.value);
            return ans;
        }
    });
}