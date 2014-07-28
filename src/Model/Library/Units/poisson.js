function poisson(x, y, z) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    
    return zip([x, y, z], function(a, b, c) {
        if (!(a instanceof UnitObject)) {
            a = new UnitObject(a);
        }

        if (!(b instanceof UnitObject)) {
            b = new UnitObject(b);
        }

        if (!(c instanceof UnitObject)) {
            c = new UnitObject(c);
        }

        var std_poisson = exe.lib.std.poisson;
        var error = a.propagateError(std_poisson, [b, c]);
        if (error) {
            return error;
        }

        if (a.hasUnit() || b.hasUnit() || c.hasUnit()) {
            return new UnitObject(std_poisson(a.value, b.value, c.value), {}, "Poisson arguments should be dimensionless.");
        } else {
            var ans = a.clone()
            ans.value = std_poisson(a.value, b.value, c.value);
            return ans;
        }
    });
}