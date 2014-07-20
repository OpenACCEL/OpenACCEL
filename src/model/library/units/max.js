function max(x, y) {
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

        var std_max = exe.lib.std.max;
        var error = a.propagateError(std_max, b);
        if (error) {
            return error;
        }

        if (!a.equals(b)) {
            return new UnitObject(std_max(a.value, b.value), {}, "Max units should be equal.");
        } else {
            var ans = a.clone()
            ans.value = std_max(a.value, b.value);
            return ans;
        }
    });
}